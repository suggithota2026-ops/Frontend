import { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { TopNavbar } from "@/components/dashboard/TopNavbar";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <DashboardSidebar 
          collapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed} 
        />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar">
          <DashboardSidebar 
            collapsed={false} 
            onCollapse={() => {}} 
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div 
        className={`flex-1 transition-all duration-300 min-w-0 overflow-hidden ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <div className="flex flex-col h-screen w-full">
          {/* Main Content */}
          <main className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
            <TopNavbar onMenuClick={() => setMobileOpen(true)} />
            <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
