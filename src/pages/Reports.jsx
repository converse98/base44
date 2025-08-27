
import React, { useState, useEffect } from "react";
import { Report } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Clock, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const data = await Report.list("-updated_date");
      setReports(data);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewReport = async () => {
    const newReport = await Report.create({
      title: "Informe GRI sin título",
      industry_template: "technology",
      status: "draft",
      blocks: [],
      last_saved: new Date().toISOString()
    });
    
    window.location.href = createPageUrl(`Editor?id=${newReport.id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft": return "bg-yellow-100 text-yellow-800";
      case "review": return "bg-blue-100 text-blue-800";
      case "published": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const getStatusName = (status) => {
      switch (status) {
        case "draft": return "Borrador";
        case "review": return "En Revisión";
        case "published": return "Publicado";
        default: return "Desconocido";
      }
  };

  const getIndustryIcon = (template) => {
    return <FileText className="w-5 h-5 text-neutral-500" />;
  };

  return (
    <div className="h-full bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Informes GRI</h1>
            <p className="text-lg text-neutral-600">Cree y gestione sus informes de sostenibilidad</p>
          </div>
          <Button
            onClick={createNewReport}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Informe
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-neutral-200 rounded"></div>
                    <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <Card className="border-dashed border-2 border-neutral-300 bg-white/50">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Aún no hay informes</h3>
              <p className="text-neutral-600 text-center mb-6 max-w-md">
                Comience a crear su primer informe de sostenibilidad GRI con nuestro editor intuitivo
              </p>
              <Button
                onClick={createNewReport}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Su Primer Informe
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getIndustryIcon(report.industry_template)}
                      <div>
                        <CardTitle className="text-lg font-semibold text-neutral-900 group-hover:text-amber-700 transition-colors">
                          {report.title}
                        </CardTitle>
                        <p className="text-sm text-neutral-500 capitalize">
                          Industria {report.industry_template}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem>Exportar PDF</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusName(report.status)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-neutral-500">
                      <Clock className="w-4 h-4" />
                      {report.last_saved ? format(new Date(report.last_saved), "MMM d") : "Nunca"}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Bloques</span>
                      <span className="font-medium text-neutral-900">{report.blocks?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Progreso</span>
                      <span className="font-medium text-neutral-900">
                        {report.status === "published" ? "100%" : report.status === "review" ? "85%" : "42%"}
                      </span>
                    </div>
                  </div>

                  <Link to={createPageUrl(`Editor?id=${report.id}`)} className="block">
                    <Button className="w-full bg-neutral-900 hover:bg-neutral-800 text-white">
                      Abrir Editor
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
