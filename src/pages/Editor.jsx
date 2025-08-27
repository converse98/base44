
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Report, Comment } from "@/api/entities";
import { User } from "@/api/entities";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Eye,
  MessageSquare,
  Plus,
  GripVertical,
  Type,
  Image,
  BarChart3,
  Download,
  FileText,
  Presentation,
  FileImage,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

import RichTextBlock from "../components/editor/RichTextBlock";
import ImageBlock from "../components/editor/ImageBlock";
import ChartBlock from "../components/editor/ChartBlock";
import ExternalAIAssistant from "../components/editor/ExternalAIAssistant";
import CommentSystem from "../components/editor/CommentSystem";

export default function Editor() {
  const [report, setReport] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [assistantWidth, setAssistantWidth] = useState(384); // Corresponds to w-96
  const isResizing = useRef(false);
  const saveIntervalRef = useRef(null);

  useEffect(() => {
    loadEditor();
    loadUser();

    // Auto-save every 30 seconds
    saveIntervalRef.current = setInterval(saveReport, 30000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) {
      return;
    }
    // Calculate new width based on mouse position from the right of the screen
    const newWidth = window.innerWidth - e.clientX;
    // Apply constraints
    if (newWidth > 320 && newWidth < 800) {
      setAssistantWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  }, [handleMouseMove]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [handleMouseMove, handleMouseUp]);


  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const loadEditor = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const reportId = urlParams.get("id");

      if (!reportId) {
        window.location.href = "/Reports";
        return;
      }

      const reportData = await Report.list();
      const currentReport = reportData.find(r => r.id === reportId);

      if (!currentReport) {
        window.location.href = "/Reports";
        return;
      }

      setReport(currentReport);
      setBlocks(currentReport.blocks || []);

      // Load comments for this report
      const commentsData = await Comment.filter({ report_id: reportId });
      setComments(commentsData);

    } catch (error) {
      console.error("Error loading editor:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReport = async () => {
    if (!report || isSaving) return;

    setIsSaving(true);
    try {
      await Report.update(report.id, {
        ...report,
        blocks,
        last_saved: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving report:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const getReportHtml = () => {
    // Manually construct the HTML string since react-dom/server is not available.
    let blocksHtml = '';

    blocks.sort((a, b) => a.position - b.position).forEach(block => {
      const titleHtml = block.title ? `<h2 style="font-size: 1.75rem; margin-bottom: 1rem; color: #1E293B;">${block.title}</h2>` : '';
      let contentHtml = '';
      
      switch (block.type) {
        case 'rich_text':
          // The content is already HTML
          contentHtml = block.content.html;
          break;
        case 'image':
          contentHtml = `<div style="text-align: ${block.content.alignment || 'center'};"><img src="${block.content.url}" alt="${block.content.alt || ''}" style="max-width: ${block.content.width || '100%'}; height: auto; border-radius: 8px;" /></div>`;
          break;
        case 'chart':
          // Note: Rendering dynamic charts as images for a PDF is complex and best handled on a dedicated backend.
          // For now, we'll just include the title and a placeholder.
          contentHtml = `<div style="border: 1px solid #e2e8f0; padding: 1rem; border-radius: 8px; text-align: center; color: #64748b;">Chart: ${block.content.title || 'Untitled Chart'} (Live chart not rendered in PDF)</div>`;
          break;
        default:
          contentHtml = '';
      }
      
      blocksHtml += `<div style="margin-bottom: 2rem; page-break-inside: avoid;">${titleHtml}${contentHtml}</div>`;
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${report.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
              color: #334155;
            }
            img { 
              max-width: 100%; 
              height: auto; 
            }
            h1, h2, h3 { color: #0f172a; }
            p { line-height: 1.6; }
            ul, ol { padding-left: 20px; }
            blockquote { border-left: 3px solid #cbd5e1; padding-left: 1rem; color: #64748b; margin-left: 0; }
          </style>
        </head>
        <body>
          <h1 style="font-size: 2.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 2rem;">${report.title}</h1>
          ${blocksHtml}
        </body>
      </html>
    `;
    return fullHtml;
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const reportHtml = getReportHtml();
      
      // Assume your backend service is running on localhost:3001
      // In production, this URL should point to your deployed service.
      const response = await fetch('http://localhost:3001/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: reportHtml, title: report.title }),
      });

      if (!response.ok) {
        throw new Error('Backend failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.title.replace(/ /g, '_') || 'report'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("No se pudo exportar a PDF. Asegúrese de que el servicio de exportación del backend esté en ejecución.");
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportNotImplemented = (format) => {
    alert(`La exportación a ${format} requiere que el servicio de exportación del backend esté implementado y que el endpoint correspondiente esté construido.`);
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `block_${Date.now()}`,
      type,
      title: "",
      content: getDefaultContent(type),
      position: blocks.length
    };

    setBlocks([...blocks, newBlock]);
    setActiveBlockId(newBlock.id);
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case "rich_text":
        return { html: "<p>Empiece a escribir su contenido aquí...</p>" };
      case "image":
        return { url: "", alt: "", alignment: "center", width: "100%" };
      case "chart":
        return {
          type: "bar",
          data: [],
          title: "Título del Gráfico",
          colors: ["#F59E0B", "#10B981", "#3B82F6"]
        };
      default:
        return {};
    }
  };

  const updateBlock = (blockId, updates) => {
    setBlocks(blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const deleteBlock = (blockId) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    // Remove comments for this block
    setComments(comments.filter(comment => comment.block_id !== blockId));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const newBlocks = Array.from(blocks);
    const [reorderedBlock] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedBlock);

    // Update positions
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      position: index
    }));

    setBlocks(updatedBlocks);
  };

  const addComment = async (blockId, content, position) => {
    if (!user) return;

    try {
      const newComment = await Comment.create({
        report_id: report.id,
        block_id: blockId,
        content,
        author_name: user.full_name,
        author_email: user.email,
        position_x: position.x,
        position_y: position.y
      });

      setComments([...comments, newComment]);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const renderBlock = (block, index) => {
    const blockComments = comments.filter(c => c.block_id === block.id && !c.resolved);

    return (
      <Draggable key={block.id} draggableId={block.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`block-container bg-white border border-neutral-200 rounded-xl p-6 mb-6 relative ${
              snapshot.isDragging ? "shadow-2xl" : ""
            } ${activeBlockId === block.id ? "ring-2 ring-amber-500" : ""} print:shadow-none print:border-none`}
            onClick={() => setActiveBlockId(block.id)}
          >
            <div className="flex items-center gap-3 mb-4 no-print">
              <div
                {...provided.dragHandleProps}
                className="text-neutral-400 hover:text-neutral-600 cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                {block.type === "rich_text" && <Type className="w-4 h-4 text-blue-500" />}
                {block.type === "image" && <Image className="w-4 h-4 text-green-500" />}
                {block.type === "chart" && <BarChart3 className="w-4 h-4 text-purple-500" />}
                <span className="text-sm font-medium text-neutral-600 capitalize">
                  Bloque de {block.type.replace("_", " ")}
                </span>
              </div>
              {blockComments.length > 0 && (
                <Badge className="comment-badge text-white">
                  {blockComments.length}
                </Badge>
              )}
            </div>

            {block.type === "rich_text" && (
              <RichTextBlock
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            )}
            {block.type === "image" && (
              <ImageBlock
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            )}
            {block.type === "chart" && (
              <ChartBlock
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
              />
            )}

            <CommentSystem
              blockId={block.id}
              comments={blockComments}
              onAddComment={addComment}
              className="no-print"
            />
          </div>
        )}
      </Draggable>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando editor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body {
            background: white !important;
            -webkit-print-color-adjust: exact; /* For precise color matching in Chrome */
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .printable-area {
            display: block !important;
            padding: 2rem;
            margin: 0 auto;
            max-width: 800px;
          }
          .editor-canvas {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          .block-container {
            break-inside: avoid; /* Prevent blocks from splitting across pages */
            page-break-inside: avoid;
          }
          h1, h2, h3, h4, h5, h6, p, li {
            color: #000 !important; /* Ensure black text for print */
          }
          /* Ensure images are visible */
          img {
            max-width: 100%;
            height: auto;
          }
        }
        
        .resizer {
          width: 5px;
          cursor: col-resize;
          background-color: #e2e8f0;
          flex-shrink: 0;
        }
        .resizer:hover {
          background-color: #cbd5e1;
        }
        
        @media (max-width: 768px) {
          .ai-sidebar {
            position: fixed;
            top: 0;
            right: -100%;
            z-index: 50;
            height: 100vh;
            transition: right 0.3s ease;
          }
          .ai-sidebar.mobile-open {
            right: 0;
          }
          .mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }
        }
      `}</style>
      <div className="h-full flex">
        {/* Main Editor */}
        <div className="flex-1 p-4 sm:p-8 overflow-y-auto printable-area">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 no-print">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {report?.title}
              </h1>
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-100 text-blue-800">
                  {report?.status}
                </Badge>
                <span className="text-sm text-neutral-500">
                  {isSaving ? "Guardando..." : "Guardado automático"}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-neutral-300"
                    disabled={isExporting}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Generando..." : "Descargar"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportNotImplemented('Word (DOCX)')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Word (DOCX)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportNotImplemented('PowerPoint (PPT)')}>
                    <Presentation className="w-4 h-4 mr-2" />
                    PowerPoint (PPT)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FileImage className="w-4 h-4 mr-2" />
                      JPG
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleExportNotImplemented('JPG (Informe completo)')}>
                          Informe completo
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleExportNotImplemented('JPG (Bloque actual)')}
                          disabled={!activeBlockId}
                        >
                          Bloque actual
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="border-neutral-300"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Editar" : "Vista Previa"}
              </Button>
              <Button
                onClick={saveReport}
                disabled={isSaving}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
  
          {/* Block Controls */}
          <Card className="p-4 mb-6 bg-neutral-50 border-neutral-200 no-print">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-neutral-700">Añadir Bloque:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addBlock("rich_text")}
                className="border-blue-200 hover:bg-blue-50"
              >
                <Type className="w-4 h-4 mr-2" />
                Texto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addBlock("image")}
                className="border-green-200 hover:bg-green-50"
              >
                <Image className="w-4 h-4 mr-2" />
                Imagen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addBlock("chart")}
                className="border-purple-200 hover:bg-purple-50"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gráfico
              </Button>
            </div>
          </Card>
  
          {/* Print Header */}
          <div className="hidden print:block mb-8 border-b pb-4">
            <h1 className="text-4xl font-bold text-neutral-900">{report?.title}</h1>
            <p className="text-lg text-neutral-600">Informe de Sostenibilidad GRI</p>
          </div>

          {/* Blocks */}
          <div className="editor-canvas p-6 print:p-0">
            {blocks.length === 0 ? (
              <div className="text-center py-16 no-print">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">Empiece a construir su informe</h3>
                <p className="text-neutral-600 mb-6">Añada bloques para crear su informe de sostenibilidad GRI</p>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => addBlock("rich_text")} variant="outline">
                    <Type className="w-4 h-4 mr-2" />
                    Añadir Texto
                  </Button>
                  <Button onClick={() => addBlock("image")} variant="outline">
                    <Image className="w-4 h-4 mr-2" />
                    Añadir Imagen
                  </Button>
                  <Button onClick={() => addBlock("chart")} variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Añadir Gráfico
                  </Button>
                </div>
              </div>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="blocks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {blocks
                        .sort((a, b) => a.position - b.position)
                        .map((block, index) => renderBlock(block, index))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
  
        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="resizer group no-print hidden lg:flex items-center justify-center"
        >
            <MoreVertical className="w-4 h-4 text-neutral-500 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* External AI Assistant Sidebar */}
        <div className="no-print hidden lg:flex" style={{ width: `${assistantWidth}px`, flexShrink: 0 }}>
            <ExternalAIAssistant
              activeBlock={blocks.find(b => b.id === activeBlockId)}
              onUpdateBlock={updateBlock}
              className="w-full h-full"
            />
        </div>
      </div>
    </>
  );
}
