import { useState } from "react";
import { Link } from "react-router-dom";
import { Apple, ArrowRight, IndianRupee, Leaf, Mail, MapPin, Phone, Send, Truck } from "lucide-react";
import { LazyWebsiteFooter } from "@/components/website/LazyWebsiteFooter";
import { OptimizedImage } from "@/components/website/OptimizedHero";
import { Eyebrow, PLAY_STORE_URL } from "@/components/website/PlayStoreBadge";
import { APP_BANNER_BASE } from "@/lib/heroAssets";
import { STORY_STATS, WHY_CHOOSE } from "@/components/website/siteContent";

const HIGHLIGHTS = [
  {
    Icon: Leaf,
    title: "100% Organic",
    desc: "All our products are certified organic and sourced from trusted local farms",
  },
  {
    Icon: Truck,
    title: "Same Day Delivery",
    desc: "Order before 12 PM and get your fresh produce delivered the same day",
  },
  {
    Icon: IndianRupee,
    title: "Best Prices",
    desc: "Farm-fresh prices with daily deals and special offers on all products",
  },
  {
    Icon: Apple,
    title: "50+ Varieties",
    desc: "Fresh Fruits Daily, Organic Vegetables and Dairy Products",
  },
] as const;

const inputClass =
  "w-full rounded-xl border border-transparent bg-[#f3f7f1] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 hover:border-green-300 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-600/15";

export default function HomeBelowFold() {
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
    <>
      {/* Highlights */}
      <section className="border-b border-green-100 bg-[#f4f8f2] [content-visibility:auto]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 divide-green-200/70 lg:grid-cols-4 lg:divide-x">
            {HIGHLIGHTS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center px-3 py-6 text-center sm:px-6">
                <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-md shadow-green-600/25">
                  <Icon className="h-6 w-6" />
                </span>
                <h4 className="font-heading text-base font-bold text-slate-900 sm:text-lg">{title}</h4>
                <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-slate-500 sm:text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our story */}
      <section className="bg-white py-12 sm:py-16 [content-visibility:auto]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative">
              <OptimizedImage
                base="healthy-vegetables-old-dark-background"
                alt="Fresh vegetables sourced by Suggi Thota"
                width={1000}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[300px] w-full rounded-[2rem] object-cover shadow-2xl shadow-green-950/20 sm:h-[440px]"
              />
              <div className="absolute -bottom-6 right-6 rounded-2xl bg-green-700 px-6 py-4 text-white shadow-xl shadow-green-900/30 sm:right-10">
                <p className="font-heading text-3xl font-bold">5+</p>
                <p className="text-xs font-medium uppercase tracking-wider text-green-100">Years of Excellence</p>
              </div>
            </div>

            <div className="pt-4 lg:pt-0">
              <Eyebrow>A Unit Of PRK Smile</Eyebrow>
              <h2 className="mb-5 mt-4 font-heading text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Our <span className="text-green-600">Story</span>
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-slate-600">
                PRK Smile (Suggi Thota) is a Bengaluru-based vegetable sourcing and
                supply company committed to delivering freshness, quality, and
                reliability. Founded in 2020 by{" "}
                <span className="font-semibold text-green-700">Mr. Ishwar Gowda</span>,
                PRK Smile has grown steadily over the past 5 years, earning a strong
                reputation as a trusted partner.
              </p>
              <p className="mb-8 border-l-4 border-green-500 pl-5 text-lg italic leading-relaxed text-slate-700">
                &ldquo;We are thrilled to introduce{" "}
                <span className="font-bold not-italic text-green-700">Suggi Thota</span>
                —our new online vegetable ordering platform, bringing the freshest
                produce directly to your fingertips.&rdquo;
              </p>

              <div className="mb-8 grid grid-cols-3 divide-x divide-green-100">
                {STORY_STATS.map((stat) => (
                  <div key={stat.label} className="px-2 text-center first:pl-0 sm:px-4">
                    <div className="font-heading text-2xl font-bold text-green-600 sm:text-3xl">{stat.value}</div>
                    <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-600/25 transition-colors hover:bg-green-700"
              >
                About Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* App banner */}
      <section className="bg-white pb-12 sm:pb-16 [content-visibility:auto]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get the Suggi Thota app on Google Play"
            className="block overflow-hidden rounded-2xl shadow-[0_24px_60px_-30px_rgba(20,83,45,0.35)] sm:rounded-3xl"
          >
            <OptimizedImage
              base={APP_BANNER_BASE}
              alt="Get the Suggi Thota App on Google Play"
              width={2086}
              height={754}
              sizes="(max-width: 1440px) 100vw, 1360px"
              className="block h-auto w-full"
            />
          </a>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-[#f4f8f2] py-12 sm:py-16 [content-visibility:auto]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>Why Choose Us</Eyebrow>
              <h2 className="mt-4 font-heading text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Beyond Supply, We Deliver <span className="text-green-600">Trust</span>
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              With over 5 years of proven excellence, we understand the critical
              role fresh produce plays in your business and daily operations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE.map((item, idx) => (
              <div
                key={item.title}
                className="group relative overflow-hidden rounded-3xl bg-white p-7 shadow-[0_24px_60px_-30px_rgba(20,83,45,0.35)] transition-all duration-300 hover:-translate-y-1 hover:bg-green-700"
              >
                <span className="absolute right-6 top-5 font-heading text-5xl font-bold text-green-50 transition-colors group-hover:text-white/10">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white transition-colors group-hover:bg-white group-hover:text-green-700">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                  </svg>
                </div>
                <h4 className="relative mb-2 font-heading text-xl font-bold text-slate-900 transition-colors group-hover:text-white">
                  {item.title}
                </h4>
                <p className="relative leading-relaxed text-slate-600 transition-colors group-hover:text-green-50">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[#f4f8f2] py-12 sm:py-16 [content-visibility:auto]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-green-900/5 lg:grid-cols-5">
            <div className="relative min-h-[360px] lg:col-span-2">
              <OptimizedImage
                base="healthy-vegetables-wooden-table-optimized"
                alt="Fresh vegetables"
                width={1024}
                height={683}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-950/95 via-green-950/70 to-green-950/20" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <h2 className="font-heading text-3xl font-bold">Contact Us</h2>
                <p className="mt-2 text-green-100">
                  Send us a message and we’ll respond as soon as possible.
                </p>
                <ul className="mt-6 space-y-3 border-t border-white/15 pt-6 text-sm">
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 shrink-0 text-green-300" />
                    <span>
                      <a href="tel:8884672766" className="font-semibold hover:text-green-200">8884672766</a>
                      <span className="mx-2 text-white/40">|</span>
                      <a href="tel:9606670144" className="font-semibold hover:text-green-200">9606670144</a>
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 shrink-0 text-green-300" />
                    <a href="mailto:prksmilegroups2020@gmail.com" className="break-all hover:text-green-200">
                      prksmilegroups2020@gmail.com
                    </a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-green-300" />
                    <span className="text-green-50/90">Bilekahalli, Vijayabank Layout, Bengaluru - 560076</span>
                  </li>
                </ul>
              </div>
            </div>

            <form className="space-y-5 p-6 sm:p-10 lg:col-span-3">
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Email <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass} resize-none`}
                  placeholder="Tell us how we can help you..."
                />
              </div>
              <button
                type="button"
                onClick={handleSendMessage}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white shadow-md shadow-green-600/25 transition-colors duration-300 hover:bg-green-700"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <LazyWebsiteFooter />
    </>
  );
}
