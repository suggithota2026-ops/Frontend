import { WebsiteHeader } from "@/components/website/WebsiteHeader";

const WebsiteHome = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <WebsiteHeader />

      <main>
        {/* Hero Section (same layout as Website/app/page.js) */}
        <section
          id="home"
          className="relative flex min-h-[92vh] items-center overflow-hidden pt-24 bg-[url('/healthy-vegetables-old-dark-background.jpg')] bg-cover bg-center bg-no-repeat"
        >
          {/* Overlay for readability (lighter, no pulse) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="text-white">
                <div className="mb-6 inline-flex items-center rounded-full border border-green-400/30 bg-green-500/20 px-4 py-2 backdrop-blur-sm">
                  <span className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  <p className="text-sm font-semibold text-green-200">
                    🥬 Fresh From Farm to Table
                  </p>
                </div>

                <h1 className="mb-6 text-6xl font-black leading-[0.98] tracking-tight text-white md:text-7xl lg:text-7xl">
                  Fresh <span className="text-green-400">Product</span>
                  <br />
                  Delivered Daily
                </h1>

                <p className="mb-8 max-w-2xl text-lg leading-relaxed text-gray-200 md:text-xl">
                  Experience the finest selection of organic fruits and vegetables,
                  hand-picked from local farms. Get premium quality produce delivered
                  to your doorstep within hours. Taste the difference that freshness
                  makes in every bite.
                </p>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <button className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-2xl active:scale-[0.99]">
                    🛒 Shop Now
                    <span className="pointer-events-none absolute inset-y-0 left-[-120%] w-2/3 rotate-12 bg-white/20 blur-xl transition-all duration-700 group-hover:left-[120%]" />
                  </button>
                  <button className="rounded-lg border-2 border-white px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white hover:text-gray-900 active:scale-[0.99]">
                    📱 Download App
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">100%</div>
                    <div className="text-sm text-gray-300">Organic</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">24hr</div>
                    <div className="text-sm text-gray-300">Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">50+</div>
                    <div className="text-sm text-gray-300">Varieties</div>
                  </div>
                </div>
              </div>

              {/* Right Content - Product Showcase */}
              <div className="relative">
                <div className="relative">
                  <div className="absolute right-0 top-0 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:rotate-3 hover:scale-110">
                    <img
                      src="/close-up-dairy-products.jpg"
                      alt="Fresh products"
                      className="h-28 w-32 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute left-0 top-32 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:-rotate-3 hover:scale-110">
                    <img
                      src="/healthy-vegetables-wooden-table.jpg"
                      alt="Fresh vegetables"
                      className="h-28 w-32 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="absolute right-8 top-64 rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-sm transition-all duration-500 hover:rotate-2 hover:scale-110">
                    <img
                      src="/top-view-tasty-fruits-arrangement.jpg"
                      alt="Fresh fruits"
                      className="h-28 w-32 rounded-lg object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="mt-40 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 p-8 text-center text-white shadow-2xl transition-all duration-300 hover:scale-105">
                    <div className="mb-4 text-6xl">🥕</div>
                    <h3 className="mb-2 font-heading text-2xl font-bold">
                      Special Offer!
                    </h3>
                    <p className="mb-4 text-green-100">
                      Get 20% off on your first order
                    </p>
                    <div className="rounded-lg bg-white px-4 py-2 font-bold text-green-600">
                      Use Code: FRESH20
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Section (same layout as Website/app/page.js) */}
        <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h3 className="mb-6 font-heading text-4xl font-bold text-white">
                🥕 Our Happy Customers
              </h3>

              <div className="mb-6 flex items-center justify-center space-x-2">
                <div className="flex -space-x-2">
                  {[
                    "bg-gradient-to-br from-orange-400 to-red-500",
                    "bg-gradient-to-br from-green-400 to-emerald-500",
                    "bg-gradient-to-br from-blue-400 to-indigo-500",
                    "bg-gradient-to-br from-purple-400 to-pink-500",
                  ].map((cls, idx) => (
                    <div
                      key={cls}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-white text-white shadow-md transition-all duration-300 hover:-translate-y-1 ${cls}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                  ))}
                </div>
                <span className="ml-4 text-xl font-bold text-white">
                  +25k Happy Families
                </span>
              </div>

              <div className="flex items-center justify-center">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-8 w-8 fill-current transition-transform duration-300 hover:scale-105"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-3 text-xl font-semibold text-white">4.8</span>
                <span className="ml-2 text-green-200">(25k+ Reviews)</span>
              </div>
            </div>

            {/* Service Features */}
            <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: "🚚",
                  title: "Same Day Delivery",
                  desc: "Order before 12 PM and get your fresh produce delivered the same day",
                },
                {
                  icon: "🌿",
                  title: "100% Organic",
                  desc: "All our products are certified organic and sourced from trusted local farms",
                },
                {
                  icon: "💰",
                  title: "Best Prices",
                  desc: "Farm-fresh prices with daily deals and special offers on all products",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-white/10 p-8 text-center text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/20"
                >
                  <div className="mb-4 text-5xl">{item.icon}</div>
                  <h4 className="mb-3 font-heading text-2xl font-bold">
                    {item.title}
                  </h4>
                  <p className="text-green-100">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Download App Section */}
            <section
              id="about"
              className="rounded-3xl bg-white p-12 text-center shadow-2xl"
            >
              <h3 className="mb-4 font-heading text-4xl font-bold text-gray-900">
                📱 Download the Suggi Thota App
              </h3>
              <p className="mb-8 text-xl text-gray-600">
                Get fresh fruits and vegetables delivered to your doorstep with our
                mobile app
              </p>

              <div className="mb-8" />

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  { icon: "🍎", text: "Fresh Fruits Daily" },
                  { icon: "🥬", text: "Organic Vegetables" },
                  { icon: "🥛", text: "Dairy Products" },
                ].map((i) => (
                  <div key={i.text} className="flex items-center justify-center text-gray-600">
                    <span className="mr-3 text-2xl">{i.icon}</span>
                    <span className="font-medium">{i.text}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        {/* Contact section (kept simple; nav target) */}
        <section id="contact" className="bg-white py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h2 className="font-heading text-3xl font-bold text-gray-900">
                Contact Us
              </h2>
              <p className="mt-2 text-gray-600">
                Send us a message and we’ll respond as soon as possible.
              </p>

              <form className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your email address"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={6}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                <button
                  type="button"
                  className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-green-700 hover:to-green-800"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-950 py-10 text-sm text-gray-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Suggi Thota. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WebsiteHome;

