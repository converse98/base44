
import React, { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit3, BarChart3 } from "lucide-react";

export default function ChartBlock({ block, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(!block.content.data || block.content.data.length === 0);
  const [title, setTitle] = useState(block.title || "");
  const [chartTitle, setChartTitle] = useState(block.content.title || "Título del Gráfico");
  const [chartType, setChartType] = useState(block.content.type || "bar");
  const [data, setData] = useState(block.content.data || []);
  const [colors, setColors] = useState(block.content.colors || ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444"]);

  const addDataPoint = () => {
    setData([...data, { name: "", value: 0 }]);
  };

  const updateDataPoint = (index, field, value) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
  };

  const removeDataPoint = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdate(block.id, {
      title,
      content: {
        title: chartTitle,
        type: chartType,
        data: data.filter(item => item.name && item.value),
        colors
      }
    });
    setIsEditing(false);
  };

  const renderChart = () => {
    if (!block.content.data || block.content.data.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-neutral-300 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-500">Sin datos para el gráfico</p>
          </div>
        </div>
      );
    }

    const chartData = block.content.data;
    const chartColors = block.content.colors || colors;

    switch (block.content.type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={chartColors[0]} strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default: // bar
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={chartColors[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
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
          
          <div className="space-y-4 p-4 border border-neutral-200 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <Input
                value={chartTitle}
                onChange={(e) => setChartTitle(e.target.value)}
                placeholder="Título del gráfico"
              />
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Gráfico de Barras</SelectItem>
                  <SelectItem value="line">Gráfico de Líneas</SelectItem>
                  <SelectItem value="pie">Gráfico Circular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-neutral-700">Puntos de Datos</h4>
                <Button onClick={addDataPoint} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Punto
                </Button>
              </div>
              
              {data.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={item.name}
                    onChange={(e) => updateDataPoint(index, "name", e.target.value)}
                    placeholder="Etiqueta"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => updateDataPoint(index, "value", parseFloat(e.target.value) || 0)}
                    placeholder="Valor"
                    className="w-24"
                  />
                  <Button
                    onClick={() => removeDataPoint(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {data.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-neutral-700 mb-2">Vista Previa</h4>
                <div className="border border-neutral-200 rounded-lg p-4">
                  {renderChart()}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleSave} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Guardar
            </Button>
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
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
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-neutral-800 text-center">
              {block.content.title}
            </h4>
            {renderChart()}
          </div>
          
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
