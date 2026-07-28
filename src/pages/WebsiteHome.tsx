import { useState } from "react";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";

const WebsiteHome = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedMessage) {
      window.alert("Please fill name and message before sending.");
      return;
    }

    const whatsappText = trimmedEmail
      ? `Name: ${trimmedName}\nEmail: ${trimmedEmail}\nMessage: ${trimmedMessage}`
      : `Name: ${trimmedName}\nMessage: ${trimmedMessage}`;
    const whatsappUrl = `https://wa.me/918884672766?text=${encodeURIComponent(whatsappText)}`;

    setName("");
    setEmail("");
    setMessage("");
    window.location.href = whatsappUrl;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <WebsiteHeader />

      <main>
        {/* Hero Section (same layout as Website/app/page.js) */}
        <section
          id="home"
          className="relative flex min-h-[92vh] items-center overflow-hidden pt-36 bg-[url('/close-up-dairy-products-optimized.jpg')] bg-cover bg-center bg-no-repeat md:pt-40"
        >
          {/* Overlay for readability (lighter, no pulse) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* Left Content */}
              <div className="text-white">
                <div className="mb-5 flex items-center gap-3">
                  <img
                    src="/suggi-thota-logo.png"
                    alt="Suggi Thota"
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

                {/* Trust Indicators */}
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

        {/* Bottom Section (same layout as Website/app/page.js) */}
        <section className="bg-gradient-to-br from-green-600 to-emerald-700 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h3 className="mb-6 font-heading text-4xl font-bold text-white">
                🥕 Our Happy Customers
              </h3>

              <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:space-x-2 sm:gap-0">
                <div className="flex -space-x-2">
                  {[
                    "bg-gradient-to-br from-orange-400 to-red-500",
                    "bg-gradient-to-br from-green-400 to-emerald-500",
                    "bg-gradient-to-br from-blue-400 to-indigo-500",
                    "bg-gradient-to-br from-purple-400 to-pink-500",
                  ].map((cls, idx) => (
                    <div
                      key={cls}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-white text-white shadow-md transition-all duration-300 hover:-translate-y-1 sm:h-12 sm:w-12 ${cls}`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </div>
                  ))}
                </div>
                <span className="text-lg font-bold text-white sm:ml-4 sm:text-xl">
                  +25k Happy Families
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-6 w-6 fill-current transition-transform duration-300 hover:scale-105 sm:h-8 sm:w-8"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <span className="text-lg font-semibold text-white sm:text-xl">4.8</span>
                <span className="text-sm text-green-200 sm:text-base">(25k+ Reviews)</span>
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
              className="rounded-3xl bg-white p-6 text-center shadow-2xl sm:p-8 md:p-12"
            >
              <img
                src="/suggi-thota-logo.png"
                alt="Suggi Thota logo"
                className="mx-auto mb-6 h-20 w-auto object-contain sm:h-28"
              />
              <h3 className="mb-4 font-heading text-3xl font-bold text-gray-900 sm:text-4xl">
                📱 Download the Suggi Thota App
              </h3>
              <p className="mb-8 text-lg text-gray-600 sm:text-xl">
                Get fresh fruits and vegetables delivered to your doorstep with our
                mobile app
              </p>

              <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href="https://play.google.com/store/apps/details?id=com.prksmile"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex transition-transform duration-300 hover:scale-105"
                  aria-label="Get it on Google Play"
                >
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    className="h-16 w-auto"
                    loading="lazy"
                  />
                </a>
              </div>

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="w-full rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 font-semibold text-white transition-all duration-300 hover:from-green-700 hover:to-green-800"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default WebsiteHome;

