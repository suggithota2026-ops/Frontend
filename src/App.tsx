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

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

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
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="categories" element={<Categories />} />
      <Route path="orders" element={<Orders />} />
      <Route path="hotels" element={<Hotels />} />
      <Route path="billing" element={<Billing />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="enquiry" element={<Enquiry />} />
      <Route path="offers" element={<Offers />} />
      <Route path="brands" element={<Brands />} />
      <Route path="invoice" element={<InvoicePage />} />
      <Route path="settings" element={<Settings />} />
      <Route path="profile" element={<Profile />} />
      <Route path="staff" element={<Staff />} />
      <Route path="drivers" element={<Drivers />} />
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
