import React, { useState, useRef } from "react";
import ReactQuill from "react-quill";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Edit3, Undo, Redo } from "lucide-react";
import "react-quill/dist/quill.snow.css";

// Componente de la Barra de Herramientas Personalizada
const CustomToolbar = ({ onUndo, onRedo }) => (
  <div id="toolbar" className="flex flex-wrap items-center gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-t-lg">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="">
        <option value="1">Título 1</option>
        <option value="2">Título 2</option>
        <option value="3">Título 3</option>
        <option value="">Texto Normal</option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-strike"></button>
    </span>
    <span className="ql-formats">
      <select className="ql-color"></select>
      <select className="ql-background"></select>
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
    </span>
    <span className="ql-formats">
      <select className="ql-align"></select>
    </span>
    <span className="ql-formats">
      <button className="ql-link"></button>
      <button className="ql-blockquote"></button>
      <button className="ql-code-block"></button>
    </span>
    <span className="ql-formats">
      <button className="ql-clean"></button>
    </span>
    <span className="ql-formats">
      <button type="button" onClick={onUndo} title="Deshacer">
        <Undo className="w-4 h-4" />
      </button>
      <button type="button" onClick={onRedo} title="Rehacer">
        <Redo className="w-4 h-4" />
      </button>
    </span>
  </div>
);


export default function RichTextBlock({ block, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(!block.content.html || block.content.html === "<p>Empiece a escribir su contenido aquí...</p>");
  const [title, setTitle] = useState(block.title || "");
  const [content, setContent] = useState(block.content.html || "");
  const quillRef = useRef(null);

  const handleSave = () => {
    onUpdate(block.id, {
      title,
      content: { html: content }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(block.title || "");
    setContent(block.content.html || "");
    setIsEditing(false);
  };

  const undoChange = () => {
    quillRef.current.getEditor().history.undo();
  };

  const redoChange = () => {
    quillRef.current.getEditor().history.redo();
  };

  const modules = {
    toolbar: {
      container: "#toolbar",
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true
    }
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <style>{`
            .ql-toolbar button, .ql-toolbar select {
              padding: 4px !important;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .ql-toolbar .ql-picker-label {
              display: flex;
              align-items: center;
            }
          `}</style>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del bloque (opcional)"
            className="font-semibold text-lg border-0 border-b-2 border-neutral-200 rounded-none px-0 focus:border-amber-500"
          />
          
          <div className="text-editor">
            <CustomToolbar onUndo={undoChange} onRedo={redoChange} />
            <ReactQuill
              ref={quillRef}
              value={content}
              onChange={setContent}
              modules={modules}
              formats={[
                'header', 'bold', 'italic', 'underline', 'strike', 
                'color', 'background', 'list', 'bullet', 
                'align', 'link', 'blockquote', 'code-block'
              ]}
              theme="snow"
              placeholder="Empiece a escribir su contenido..."
              className="border-neutral-200 rounded-b-lg"
            />
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Guardar
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          {block.title && (
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">
              {block.title}
            </h3>
          )}
          
          <div 
            className="prose prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: block.content.html }}
          />
          
          <div className="flex gap-2 pt-3 border-t border-neutral-100">
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="hover:bg-blue-50"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button
              onClick={() => onDelete(block.id)}
              variant="outline"
              size="sm"
              className="hover:bg-red-50 text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}