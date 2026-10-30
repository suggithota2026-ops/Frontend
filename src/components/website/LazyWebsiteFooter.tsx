import { lazy, Suspense } from "react";

const WebsiteFooter = lazy(() =>
  import("./WebsiteFooter").then((m) => ({ default: m.WebsiteFooter }))
);

export function LazyWebsiteFooter() {
  return (
    <Suspense fallback={<footer className="h-40 bg-[#0f2e1a]" aria-hidden />}>
      <WebsiteFooter />
    </Suspense>
  );
}
