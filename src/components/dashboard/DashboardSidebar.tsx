import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Building2,
  CreditCard,
  FileBarChart,
  Bell,
  Settings,
  ChevronLeft,
  LogOut,
  Zap,
  Users,
  Truck,
  MessageSquare,
  Percent,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/config/permissions";

/** Must match nested routes under `/admin` in App.tsx */
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin", permission: PERMISSIONS.DASHBOARD_VIEW },
  { icon: Package, label: "Products", path: "/admin/products", permission: PERMISSIONS.PRODUCTS_VIEW },
  { icon: FolderOpen, label: "Categories", path: "/admin/categories", permission: PERMISSIONS.CATEGORIES_VIEW },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders", permission: PERMISSIONS.ORDERS_VIEW },
  { icon: Building2, label: "Customers", path: "/admin/hotels", permission: PERMISSIONS.CUSTOMERS_VIEW },
  { icon: Users, label: "Staff", path: "/admin/staff", permission: PERMISSIONS.STAFF_VIEW },
  { icon: Truck, label: "Drivers", path: "/admin/drivers", permission: PERMISSIONS.DRIVERS_VIEW },
  { icon: CreditCard, label: "Billing", path: "/admin/billing", permission: PERMISSIONS.BILLING_VIEW },
  { icon: MessageSquare, label: "Enquiry", path: "/admin/enquiry", permission: PERMISSIONS.ENQUIRY_VIEW },
  { icon: Percent, label: "Offers", path: "/admin/offers", permission: PERMISSIONS.OFFERS_VIEW },
  { icon: FolderOpen, label: "Brands", path: "/admin/brands", permission: PERMISSIONS.BRANDS_VIEW },
  { icon: Bell, label: "Notifications", path: "/admin/notifications", permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { icon: Settings, label: "Settings", path: "/admin/settings", permission: PERMISSIONS.SETTINGS_VIEW },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  onNavigate?: () => void;
}

export function DashboardSidebar({ collapsed, onCollapse, onNavigate }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  const userPermissions = user?.permissions || [];
  const visibleMenuItems = menuItems.filter((item) =>
    role === "ADMIN" ? true : userPermissions.includes(item.permission)
  );

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50 overflow-hidden",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        "flex items-center border-b border-sidebar-border shrink-0 min-h-[73px]",
        collapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-white animate-fade-in truncate">
              AdminPanel
            </span>
          </div>
        )}
        <button
          onClick={() => onCollapse(!collapsed)}
          className="p-2 rounded-lg text-sidebar-foreground/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "w-5 h-5 transition-transform duration-300 shrink-0",
              collapsed && "rotate-180"
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0 hide-scrollbar">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => {
            const { pathname } = location;
            const isActive =
              item.path === "/admin"
                ? pathname === "/admin" || pathname === "/admin/"
                : pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={cn(
                    "sidebar-item w-full",
                    isActive && "sidebar-item-active"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  {!collapsed && (
                    <span className="animate-fade-in truncate">{item.label}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-sidebar-border shrink-0">
        <button
          onClick={logout}
          className={cn(
            "sidebar-item w-full transition-colors hover:text-red-400 group",
            collapsed && "justify-center"
          )}
          title="Logout"
        >
          <LogOut
            className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110"
            strokeWidth={1.5}
          />
          {!collapsed && <span className="truncate">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
