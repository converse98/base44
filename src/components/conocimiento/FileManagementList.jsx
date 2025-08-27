import React from 'react';
import { DataSource } from "@/api/entities";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Globe, FileVideo, FileText, Download, Trash2, Edit, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const categoryInfo = {
  web_url: { icon: Globe, label: 'Web Scraping', color: 'blue' },
  video: { icon: FileVideo, label: 'Videos', color: 'purple' },
  audio: { icon: FileVideo, label: 'Audio', color: 'purple' },
  document: { icon: FileText, label: 'Documentos', color: 'green' },
};

export default function FileManagementList({ groupedSources, onDataSourceDeleted, onDataSourceUpdated, isLoading }) {

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this data source?')) {
      await DataSource.delete(id);
      onDataSourceDeleted();
    }
  };

  const renderTable = (sources, category) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Formato</TableHead>
          <TableHead>Tamaño</TableHead>
          <TableHead>Subido</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sources.map(source => (
          <TableRow key={source.id}>
            <TableCell className="font-medium truncate max-w-xs">{source.name}</TableCell>
            <TableCell>
              <Badge variant="outline">{source.format}</Badge>
            </TableCell>
            <TableCell>{source.size > 0 ? formatBytes(source.size) : 'N/A'}</TableCell>
            <TableCell>{format(new Date(source.created_date), 'MMM d, yyyy')}</TableCell>
            <TableCell className="flex gap-2">
              {source.source_type !== 'web_url' && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" download={source.name}>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              )}
              <Button variant="outline" size="icon" onClick={() => alert('Edit functionality coming soon!')}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(source.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (Object.keys(groupedSources).length === 0) {
    return (
      <div className="text-center py-10 text-neutral-500">
        <p>No se han cargado fuentes de datos todavía.</p>
        <p>Utilice los paneles de arriba para empezar a añadir datos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(categoryInfo).map(([key, { icon: Icon, label, color }]) => {
        const sources = groupedSources[key];
        if (!sources || sources.length === 0) return null;
        
        return (
          <Collapsible key={key} defaultOpen className="border rounded-lg p-4">
            <CollapsibleTrigger className="w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 text-${color}-500`} />
                <h3 className="text-lg font-semibold">{label}</h3>
                <Badge>{sources.length}</Badge>
              </div>
              <ChevronDown className="h-5 w-5 transition-transform data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              {renderTable(sources, key)}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}