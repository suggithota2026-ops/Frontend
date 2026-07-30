import { lazy, Suspense } from "react";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { OptimizedHero } from "@/components/website/OptimizedHero";
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
          className="relative flex min-h-[92vh] items-center overflow-hidden pt-36 md:pt-40"
        >
          <OptimizedHero
            base={HOME_HERO_BASE}
            width={1024}
            height={768}
            sizes={HERO_SIZES}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="text-white">
                <div className="mb-5 flex items-center gap-3">
                  <img
                    src="/suggi-thota-logo.png"
                    alt="Suggi Thota"
                    width={128}
                    height={64}
                    decoding="async"
                    loading="lazy"
                    fetchPriority="low"
                    className="h-12 w-auto shrink-0 object-contain drop-shadow-lg sm:h-14 md:h-16"
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-lg font-bold tracking-tight sm:text-xl md:text-2xl">
                      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-green-400" />
                      Suggi Thota
                    </p>
                    <p className="mt-1 text-sm font-medium text-green-200 md:text-base">
                      Farm Fresh • 100% Natural
                    </p>
                  </div>
                </div>

                <h1 className="mb-4 text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  Fresh <span className="text-green-400">Product</span>
                  <br />
                  Delivered Daily
                </h1>

                <p className="mb-5 text-base font-semibold text-green-200 md:text-lg">
                  Fresh From Farm to Table
                </p>

                <p className="mb-8 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl">
                  Experience the finest selection of organic fruits and vegetables,
                  hand-picked from local farms. Get premium quality produce delivered
                  to your doorstep within hours. Taste the difference that freshness
                  makes in every bite.
                </p>

                <a
                  href="https://play.google.com/store/apps/details?id=com.prksmile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border-2 border-white bg-black/35 px-8 py-4 text-lg font-semibold text-white shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-gray-900 active:scale-[0.99]"
                >
                  📱 Download App
                </a>

                <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 sm:text-3xl">100%</div>
                    <div className="text-xs text-gray-300 sm:text-sm">Organic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 sm:text-3xl">24hr</div>
                    <div className="text-xs text-gray-300 sm:text-sm">Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 sm:text-3xl">50+</div>
                    <div className="text-xs text-gray-300 sm:text-sm">Varieties</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Suspense fallback={<div className="min-h-[40vh] bg-green-700" aria-hidden />}>
          <HomeBelowFold />
        </Suspense>
      </main>
    </div>
  );
};

export default WebsiteHome;
