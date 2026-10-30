import { lazy, Suspense } from "react";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { OptimizedHero } from "@/components/website/OptimizedHero";
import { PLAY_STORE_URL } from "@/components/website/PlayStoreBadge";
import { HERO_SIZES } from "@/lib/heroAssets";

const HOME_HERO_BASE = "close-up-dairy-products-optimized";

const HomeBelowFold = lazy(() => import("./HomeBelowFold"));

const WebsiteHome = () => {
  return (
    <div className="min-h-screen text-slate-900">
      <WebsiteHeader />

      <main>
        <section
          id="home"
          className="relative flex min-h-[70vh] items-center overflow-hidden pb-12 pt-[115px] md:pt-[131px]"
        >
          <OptimizedHero
            base={HOME_HERO_BASE}
            width={1024}
            height={768}
            sizes={HERO_SIZES}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl text-white">
              <div className="mb-6 flex items-center gap-4">
                <img
                  src="/suggi-thota-logo.png"
                  alt="Suggi Thota"
                  width={128}
                  height={64}
                  decoding="async"
                  loading="lazy"
                  fetchPriority="low"
                  className="h-14 w-auto shrink-0 rounded-2xl bg-white object-contain p-1.5 shadow-lg shadow-black/30 sm:h-16"
                />
                <div className="min-w-0 border-l-2 border-green-400/70 pl-4">
                  <p className="text-xl font-bold tracking-tight sm:text-2xl">Suggi Thota</p>
                  <p className="text-sm font-medium text-green-300">Farm Fresh • 100% Natural</p>
                </div>
              </div>

              <h1 className="mb-4 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Fresh Product
                <br />
                <span className="text-green-400">Delivered Daily</span>
              </h1>

              <p className="mb-4 text-base font-semibold text-green-300 md:text-lg">
                Fresh From Farm to Table
              </p>

              <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-200 sm:text-lg">
                Experience the finest selection of organic fruits and vegetables,
                hand-picked from local farms. Get premium quality produce delivered
                to your doorstep within hours. Taste the difference that freshness
                makes in every bite.
              </p>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 rounded-xl bg-green-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-green-900/40 transition-all duration-300 hover:bg-green-500 active:scale-[0.99] sm:text-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="6" y="2.5" width="12" height="19" rx="2.5" stroke="currentColor" strokeWidth="2" />
                  <path d="M11 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Download App
              </a>
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="min-h-[40vh] bg-[#f4f8f2]" aria-hidden />}>
          <HomeBelowFold />
        </Suspense>
      </main>
    </div>
  );
};

export default WebsiteHome;
