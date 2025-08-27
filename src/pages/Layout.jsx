
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { FileText, BarChart3, Users, BrainCircuit, ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Informes",
    url: createPageUrl("Reports"),
    icon: FileText,
  },
  {
    title: "Conocimiento",
    url: createPageUrl("Conocimiento"),
    icon: BrainCircuit,
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
  },
  {
    title: "Colaboración",
    url: createPageUrl("Collaboration"),
    icon: Users,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    document.title = "Alicorp";
  }, []);

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary-navy: #0B1426;
          --primary-white: #FFFFFF;
          --accent-amber: #F59E0B;
          --accent-sage: #10B981;
          --neutral-50: #F8FAFC;
          --neutral-100: #F1F5F9;
          --neutral-200: #E2E8F0;
          --neutral-300: #CBD5E1;
          --neutral-400: #94A3B8;
          --neutral-500: #64748B;
          --neutral-600: #475569;
          --neutral-700: #334155;
          --neutral-800: #1E293B;
          --neutral-900: #0F172A;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background: linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-100) 100%);
        }
        
        .editor-canvas {
          background: var(--primary-white);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-radius: 12px;
        }
        
        .block-container {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 8px;
        }
        
        .block-container:hover {
          box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .ai-sidebar {
          background: linear-gradient(180deg, var(--primary-navy) 0%, #1E293B 100%);
        }
        
        .comment-badge {
          background: var(--accent-amber);
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
        }
      `}</style>
      
      <div className="min-h-screen flex w-full bg-gradient-to-br from-neutral-50 to-neutral-100">
        <Sidebar className={`border-r border-neutral-200 bg-white transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
          <SidebarHeader className="border-b border-neutral-200 p-4 h-[81px] flex items-center">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className={`transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <h2 className="font-bold text-xl text-neutral-900 whitespace-nowrap">Alicorp</h2>
                <p className="text-sm text-neutral-500 whitespace-nowrap">Informes GRI</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className={`text-xs font-semibold text-neutral-500 uppercase tracking-wider px-3 py-3 transition-opacity ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                Navegación
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 rounded-lg mb-1 flex items-center justify-start ${isCollapsed ? 'justify-center' : ''} ${
                          location.pathname === item.url ? 'bg-amber-50 text-amber-700 shadow-sm' : ''
                        }`}
                        title={item.title}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-3">
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className={`font-medium transition-opacity whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-2 border-t border-neutral-200">
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`hover:bg-neutral-100 transition-all duration-200 rounded-lg mb-1 w-full flex items-center justify-start ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex items-center gap-3 px-3 py-3">
                    {isCollapsed ? <ChevronsRight className="w-5 h-5 flex-shrink-0" /> : <ChevronsLeft className="w-5 h-5 flex-shrink-0" />}
                    <span className={`font-medium transition-opacity whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Contraer</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-neutral-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-neutral-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold text-neutral-900">Alicorp</h1>
            </div>
          </header>

          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
