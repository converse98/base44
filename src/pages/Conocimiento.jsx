import React, { useState, useEffect, useCallback } from "react";
import { DataSource } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, FileVideo, FileText, UploadCloud } from "lucide-react";

import UrlInput from "../components/conocimiento/UrlInput";
import FileUploadZone from "../components/conocimiento/FileUploadZone";
import FileManagementList from "../components/conocimiento/FileManagementList";

export default function Conocimiento() {
  const [dataSources, setDataSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDataSources = useCallback(async () => {
    setIsLoading(true);
    try {
      const sources = await DataSource.list("-created_date");
      setDataSources(sources);
    } catch (error) {
      console.error("Failed to load data sources:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataSources();
  }, [loadDataSources]);

  const groupedSources = dataSources.reduce((acc, source) => {
    const key = source.source_type;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(source);
    return acc;
  }, {});

  return (
    <div className="h-full bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-2">Conocimiento</h1>
          <p className="text-lg text-neutral-600">Gestione las fuentes de datos para el entrenamiento del modelo.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Column 1: URL Scraping */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-blue-500" />
                <span className="text-xl">Web Scraping</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UrlInput onDataSourceAdded={loadDataSources} />
            </CardContent>
          </Card>

          {/* Column 2: Video/Audio */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileVideo className="w-6 h-6 text-purple-500" />
                <span className="text-xl">Videos y Audio</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                acceptedFormats={{
                  'video/mp4': ['.mp4'],
                  'audio/mpeg': ['.mp3'],
                }}
                sourceType="video" // 'video' and 'audio' are handled similarly
                maxSizeMB={10} // Will be updated to 5GB as per final instruction
                onUploadComplete={loadDataSources}
              />
            </CardContent>
          </Card>

          {/* Column 3: Documents */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-500" />
                <span className="text-xl">Documentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadZone
                acceptedFormats={{
                  'application/pdf': ['.pdf'],
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                  'application/msword': ['.doc'],
                  'text/plain': ['.txt'],
                  'text/csv': ['.csv'],
                }}
                sourceType="document"
                maxSizeMB={10} // Will be updated to 5GB
                onUploadComplete={loadDataSources}
              />
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <UploadCloud className="w-6 h-6 text-neutral-600" />
              <span className="text-xl">Archivos Cargados</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileManagementList
              groupedSources={groupedSources}
              onDataSourceDeleted={loadDataSources}
              onDataSourceUpdated={loadDataSources}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}