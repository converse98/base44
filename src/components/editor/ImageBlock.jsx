
import React, { useState, useRef } from "react";
import { UploadFile } from "@/api/integrations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Edit3, Trash2, Image as ImageIcon } from "lucide-react";

export default function ImageBlock({ block, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(!block.content.url);
  const [title, setTitle] = useState(block.title || "");
  const [imageUrl, setImageUrl] = useState(block.content.url || "");
  const [altText, setAltText] = useState(block.content.alt || "");
  const [alignment, setAlignment] = useState(block.content.alignment || "center");
  const [width, setWidth] = useState(block.content.width || "100%");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setImageUrl(file_url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = () => {
    onUpdate(block.id, {
      title,
      content: {
        url: imageUrl,
        alt: altText,
        alignment,
        width
      }
    });
    setIsEditing(false);
  };

  const getAlignmentStyle = () => {
    switch (alignment) {
      case "left": return "text-left";
      case "right": return "text-right";
      case "center": return "text-center";
      default: return "text-center";
    }
  };

  return (
    <div className="space-y-4">
      {isEditing ? (
        <>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título del bloque (opcional)"
            className="font-semibold text-lg border-0 border-b-2 border-neutral-200 rounded-none px-0 focus:border-amber-500"
          />
          
          <div className="space-y-4 p-4 border-2 border-dashed border-neutral-300 rounded-lg">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? "Subiendo..." : "Subir Imagen"}
              </Button>
              <span className="text-sm text-neutral-500">
                O pegue la URL de la imagen abajo
              </span>
            </div>
            
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL de la imagen"
            />
            
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Texto alternativo para accesibilidad"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Alineación
                </label>
                <Select value={alignment} onValueChange={setAlignment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Izquierda</SelectItem>
                    <SelectItem value="center">Centro</SelectItem>
                    <SelectItem value="right">Derecha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-2 block">
                  Ancho
                </label>
                <Select value={width} onValueChange={setWidth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50%">Pequeño (50%)</SelectItem>
                    <SelectItem value="75%">Mediano (75%)</SelectItem>
                    <SelectItem value="100%">Grande (100%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {imageUrl && (
              <div className={`mt-4 ${getAlignmentStyle()}`}>
                <img
                  src={imageUrl}
                  alt={altText}
                  style={{ width }}
                  className="max-w-full h-auto rounded-lg shadow-sm border border-neutral-200"
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!imageUrl}
            >
              Guardar
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              Cancelar
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="hidden"
          />
        </>
      ) : (
        <>
          {block.title && (
            <h3 className="text-xl font-semibold text-neutral-900 mb-3">
              {block.title}
            </h3>
          )}
          
          {block.content.url ? (
            <div className={getAlignmentStyle()}>
              <img
                src={block.content.url}
                alt={block.content.alt}
                style={{ width: block.content.width }}
                className="max-w-full h-auto rounded-lg shadow-sm border border-neutral-200"
              />
              {block.content.alt && (
                <p className="text-sm text-neutral-500 mt-2 italic">
                  {block.content.alt}
                </p>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-neutral-300 rounded-lg">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">No se ha subido ninguna imagen</p>
              </div>
            </div>
          )}
          
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
