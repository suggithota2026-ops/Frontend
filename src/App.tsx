import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ensureLcpBoot } from "@/lib/heroAssets";

// Public website — home only in the critical bundle
import WebsiteHome from "./pages/WebsiteHome";

const WebsiteAbout = lazy(() => import("./pages/WebsiteAbout"));
const WebsiteContact = lazy(() => import("./pages/WebsiteContact"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AdminRoutes = lazy(() => import("./routes/AdminRoutes"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-white text-sm text-slate-500">
    Loading…
  </div>
);

const LEGACY_ADMIN_SEGMENTS = new Set([
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
]);

function isAdminContext(pathname: string) {
  if (pathname.startsWith("/admin") || pathname === "/login") return true;
  const seg = pathname.replace(/^\//, "");
  return LEGACY_ADMIN_SEGMENTS.has(seg);
}

const PublicRoutes = () => (
  <Suspense fallback={<RouteFallback />}>
    <Routes>
      <Route path="/" element={<WebsiteHome />} />
      <Route path="/about" element={<WebsiteAbout />} />
      <Route path="/contact" element={<WebsiteContact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

function AppShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    ensureLcpBoot(pathname);
  }, [pathname]);

  if (isAdminContext(pathname)) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <AdminRoutes />
      </Suspense>
    );
  }

  return <PublicRoutes />;
}

const App = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
