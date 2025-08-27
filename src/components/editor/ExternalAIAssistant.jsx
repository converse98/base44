
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  X,
  Maximize2,
  Minimize2,
  RefreshCw
} from "lucide-react";

export default function ExternalAIAssistant({ activeBlock, className = "" }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef(null);

  const assistantUrl = "https://genai-app-virtualassistantintroduct-1-17549425501-694128417896.us-central1.run.app/?key=7tif7vequ6tgj43e";

  useEffect(() => {
    // Listen for iframe load events
    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        setIsLoading(false);
        setHasError(false);
      };
      
      const handleError = () => {
        setIsLoading(false);
        setHasError(true);
      };

      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);

      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      };
    }
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className={`ai-sidebar bg-gradient-to-b from-neutral-900 to-neutral-800 text-white flex flex-col h-full transition-all duration-300 ${
      isMinimized ? 'w-16' : ''
    } ${className}`}>
      {/* Header */}
      <CardHeader className="border-b border-neutral-700 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isMinimized && (
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Asistente IA
            </CardTitle>
          )}
          <div className="flex items-center gap-2">
            {!isMinimized && hasError && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRefresh}
                className="text-white hover:bg-neutral-700 w-6 h-6"
                title="Refrescar Asistente"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMinimize}
              className="text-white hover:bg-neutral-700 w-6 h-6"
              title={isMinimized ? "Expandir Asistente" : "Minimizar Asistente"}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </Button>
          </div>
        </div>
        
        {!isMinimized && activeBlock && (
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 w-fit mt-2">
            Editando bloque de {activeBlock.type.replace("_", " ")}
          </Badge>
        )}
      </CardHeader>

      {/* Assistant Content */}
      {!isMinimized && (
        <CardContent className="flex-1 p-0 overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
                <p className="text-neutral-300 text-sm">Cargando Asistente IA...</p>
              </div>
            </div>
          )}
          
          {hasError && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <X className="w-8 h-8 text-red-400 mx-auto mb-4" />
                <p className="text-neutral-300 text-sm mb-4">Error al cargar el Asistente IA</p>
                <Button
                  onClick={handleRefresh}
                  size="sm"
                  variant="outline"
                  className="bg-neutral-800 border-neutral-600 text-neutral-200 hover:bg-neutral-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={assistantUrl}
            className={`w-full h-full border-0 ${isLoading || hasError ? 'hidden' : 'block'}`}
            title="AI Assistant"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </CardContent>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-center">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMinimize}
            className="text-amber-400 hover:bg-neutral-700 w-10 h-10"
            title="Abrir Asistente IA"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
