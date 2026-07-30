import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { PERMISSIONS } from "@/config/permissions";

const AdminProviders = lazy(() =>
  import("@/components/AdminProviders").then((m) => ({ default: m.AdminProviders }))
);
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DashboardLayout = lazy(() =>
  import("@/components/layout/DashboardLayout").then((m) => ({ default: m.DashboardLayout }))
);
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Products = lazy(() => import("@/pages/Products"));
const Categories = lazy(() => import("@/pages/Categories"));
const Orders = lazy(() => import("@/pages/Orders"));
const Hotels = lazy(() => import("@/pages/Hotels"));
const Billing = lazy(() => import("@/pages/Billing"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Profile = lazy(() => import("@/pages/Profile"));
const Staff = lazy(() => import("@/pages/Staff"));
const StaffFormPage = lazy(() => import("@/pages/StaffFormPage"));
const Drivers = lazy(() => import("@/pages/Drivers"));
const Settings = lazy(() => import("@/pages/Settings"));
const Enquiry = lazy(() => import("@/pages/Enquiry"));
const Offers = lazy(() => import("@/pages/Offers"));
const Brands = lazy(() => import("@/pages/Brands"));
const InvoicePage = lazy(() => import("@/pages/InvoicePage"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
    Loading…
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }
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
  if (role === "ADMIN" || role === "SUPER_ADMIN") return <>{children}</>;

  const permissions = user?.permissions || [];
  if (!permissions.includes(permission)) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const AdminAuthLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

const LEGACY_ADMIN_SEGMENTS = [
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
] as const;

export default function AdminRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <AdminProviders>
        <Routes>
          <Route element={<AdminAuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <PermissionRoute permission={PERMISSIONS.DASHBOARD_VIEW}>
                    <Dashboard />
                  </PermissionRoute>
                }
              />
              <Route
                path="products"
                element={
                  <PermissionRoute permission={PERMISSIONS.PRODUCTS_VIEW}>
                    <Products />
                  </PermissionRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <PermissionRoute permission={PERMISSIONS.CATEGORIES_VIEW}>
                    <Categories />
                  </PermissionRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <PermissionRoute permission={PERMISSIONS.ORDERS_VIEW}>
                    <Orders />
                  </PermissionRoute>
                }
              />
              <Route
                path="hotels"
                element={
                  <PermissionRoute permission={PERMISSIONS.CUSTOMERS_VIEW}>
                    <Hotels />
                  </PermissionRoute>
                }
              />
              <Route
                path="billing"
                element={
                  <PermissionRoute permission={PERMISSIONS.BILLING_VIEW}>
                    <Billing />
                  </PermissionRoute>
                }
              />
              <Route
                path="notifications"
                element={
                  <PermissionRoute permission={PERMISSIONS.NOTIFICATIONS_VIEW}>
                    <Notifications />
                  </PermissionRoute>
                }
              />
              <Route
                path="enquiry"
                element={
                  <PermissionRoute permission={PERMISSIONS.ENQUIRY_VIEW}>
                    <Enquiry />
                  </PermissionRoute>
                }
              />
              <Route
                path="offers"
                element={
                  <PermissionRoute permission={PERMISSIONS.OFFERS_VIEW}>
                    <Offers />
                  </PermissionRoute>
                }
              />
              <Route
                path="brands"
                element={
                  <PermissionRoute permission={PERMISSIONS.BRANDS_VIEW}>
                    <Brands />
                  </PermissionRoute>
                }
              />
              <Route path="invoice" element={<InvoicePage />} />
              <Route
                path="settings"
                element={
                  <PermissionRoute permission={PERMISSIONS.SETTINGS_VIEW}>
                    <Settings />
                  </PermissionRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <PermissionRoute permission={PERMISSIONS.PROFILE_VIEW}>
                    <Profile />
                  </PermissionRoute>
                }
              />
              <Route
                path="staff"
                element={
                  <PermissionRoute permission={PERMISSIONS.STAFF_VIEW}>
                    <Staff />
                  </PermissionRoute>
                }
              />
              <Route
                path="staff/new"
                element={
                  <PermissionRoute permission={PERMISSIONS.STAFF_MANAGE}>
                    <StaffFormPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="staff/:id/edit"
                element={
                  <PermissionRoute permission={PERMISSIONS.STAFF_MANAGE}>
                    <StaffFormPage />
                  </PermissionRoute>
                }
              />
              <Route
                path="drivers"
                element={
                  <PermissionRoute permission={PERMISSIONS.DRIVERS_VIEW}>
                    <Drivers />
                  </PermissionRoute>
                }
              />
            </Route>
          </Route>

          {LEGACY_ADMIN_SEGMENTS.map((seg) => (
            <Route key={seg} path={seg} element={<Navigate to={`/admin/${seg}`} replace />} />
          ))}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AdminProviders>
    </Suspense>
  );
}
