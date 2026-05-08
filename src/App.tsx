import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Hotels from "./pages/Hotels";
import Billing from "./pages/Billing";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Staff from "./pages/Staff";
import StaffFormPage from "./pages/StaffFormPage";
import Drivers from "./pages/Drivers";
import Settings from "./pages/Settings";
import Enquiry from "./pages/Enquiry";
import Offers from "./pages/Offers";
import Brands from "./pages/Brands";
import InvoicePage from "./pages/InvoicePage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import WebsiteHome from "./pages/WebsiteHome";
import WebsiteAbout from "./pages/WebsiteAbout";
import WebsiteContact from "./pages/WebsiteContact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { Navigate } from "react-router-dom";
import { PERMISSIONS } from "./config/permissions";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const PermissionRoute = ({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: string;
}) => {
  const { user } = useAuth();
  const role = String(user?.role || "").toUpperCase();
  if (role === "ADMIN") return <>{children}</>;

  const permissions = user?.permissions || [];
  if (!permissions.includes(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public website */}
    <Route path="/" element={<WebsiteHome />} />
    <Route path="/about" element={<WebsiteAbout />} />
    <Route path="/contact" element={<WebsiteContact />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

    {/* Auth / admin panel */}
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW}><Dashboard /></PermissionRoute>} />
      <Route path="products" element={<PermissionRoute permission={PERMISSIONS.PRODUCTS_VIEW}><Products /></PermissionRoute>} />
      <Route path="categories" element={<PermissionRoute permission={PERMISSIONS.CATEGORIES_VIEW}><Categories /></PermissionRoute>} />
      <Route path="orders" element={<PermissionRoute permission={PERMISSIONS.ORDERS_VIEW}><Orders /></PermissionRoute>} />
      <Route path="hotels" element={<PermissionRoute permission={PERMISSIONS.CUSTOMERS_VIEW}><Hotels /></PermissionRoute>} />
      <Route path="billing" element={<PermissionRoute permission={PERMISSIONS.BILLING_VIEW}><Billing /></PermissionRoute>} />
      <Route path="notifications" element={<PermissionRoute permission={PERMISSIONS.NOTIFICATIONS_VIEW}><Notifications /></PermissionRoute>} />
      <Route path="enquiry" element={<PermissionRoute permission={PERMISSIONS.ENQUIRY_VIEW}><Enquiry /></PermissionRoute>} />
      <Route path="offers" element={<PermissionRoute permission={PERMISSIONS.OFFERS_VIEW}><Offers /></PermissionRoute>} />
      <Route path="brands" element={<PermissionRoute permission={PERMISSIONS.BRANDS_VIEW}><Brands /></PermissionRoute>} />
      <Route path="invoice" element={<InvoicePage />} />
      <Route path="settings" element={<PermissionRoute permission={PERMISSIONS.SETTINGS_VIEW}><Settings /></PermissionRoute>} />
      <Route path="profile" element={<PermissionRoute permission={PERMISSIONS.PROFILE_VIEW}><Profile /></PermissionRoute>} />
      <Route path="staff" element={<PermissionRoute permission={PERMISSIONS.STAFF_VIEW}><Staff /></PermissionRoute>} />
      <Route path="staff/new" element={<PermissionRoute permission={PERMISSIONS.STAFF_MANAGE}><StaffFormPage /></PermissionRoute>} />
      <Route path="staff/:id/edit" element={<PermissionRoute permission={PERMISSIONS.STAFF_MANAGE}><StaffFormPage /></PermissionRoute>} />
      <Route path="drivers" element={<PermissionRoute permission={PERMISSIONS.DRIVERS_VIEW}><Drivers /></PermissionRoute>} />
    </Route>

    {/* Old admin URLs (no /admin prefix) — keep bookmarks / manual entry working */}
    {(
      [
        "products",
        "categories",
        "orders",
        "hotels",
        "staff",
        "drivers",
        "billing",
        "enquiry",
        "offers",
        "brands",
        "notifications",
        "settings",
        "profile",
        "invoice",
      ] as const
    ).map((seg) => (
      <Route
        key={seg}
        path={seg}
        element={<Navigate to={`/admin/${seg}`} replace />}
      />
    ))}

    {/* Catch-all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
