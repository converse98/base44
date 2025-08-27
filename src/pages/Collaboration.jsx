import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Collaboration() {
  const collaborators = [
    { name: "Sarah Johnson", email: "sarah@company.com", role: "Editor", status: "active" },
    { name: "Mike Chen", email: "mike@company.com", role: "Revisor", status: "active" },
    { name: "Emma Wilson", email: "emma@company.com", role: "Lector", status: "inactive" },
  ];

  const recentActivity = [
    { user: "Sarah Johnson", action: "Añadió un comentario en Desempeño Ambiental", time: "hace 2 horas" },
    { user: "Mike Chen", action: "Aprobó la sección de Gobernanza Corporativa", time: "hace 5 horas" },
    { user: "Emma Wilson", action: "Vio el informe de Métricas de Sostenibilidad", time: "hace 1 día" },
  ];

  return (
    <div className="h-full bg-gradient-to-br from-neutral-50 to-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-neutral-900 mb-2">Colaboración</h1>
            <p className="text-lg text-neutral-600">Gestione miembros del equipo y siga el trabajo colaborativo</p>
          </div>
          <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Invitar Miembro
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Miembros del Equipo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collaborators.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{member.name}</p>
                      <p className="text-sm text-neutral-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {member.role}
                    </Badge>
                    <Badge className={member.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                      {member.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {activity.user.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Comment Overview */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Resumen de Comentarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Aún no hay comentarios</h3>
              <p className="text-neutral-600">
                Empiece a colaborar añadiendo comentarios a los bloques del informe en el editor.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}