import { Link } from "react-router-dom";
import { Check, Eye, Quote, Target } from "lucide-react";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { LazyWebsiteFooter } from "@/components/website/LazyWebsiteFooter";
import { OptimizedHero, OptimizedImage } from "@/components/website/OptimizedHero";
import { Eyebrow } from "@/components/website/PlayStoreBadge";
import { HERO_SIZES } from "@/lib/heroAssets";
import { STORY_STATS, WHY_CHOOSE } from "@/components/website/siteContent";

const ABOUT_HERO_BASE = "healthy-vegetables-wooden-table-optimized";

const MISSION_POINTS = [
  "Deliver fresh, high-quality vegetables sourced directly from farmers.",
  "Support restaurants, PGs, and retailers with consistent supply.",
  "Maintain fair pricing for both farmers and customers.",
  "Uphold hygiene and quality control at every stage.",
  "Build long-term partnerships through trust and integrity.",
] as const;

const TEAM = [
  {
    name: "Ishwar Gowda",
    gender: "male",
    role: "Founder & CEO, Finance Head",
    accent: "bg-green-500",
  },
  {
    name: "Dik Bahadur Pradhan",
    gender: "male",
    role: "Co-Founder & Operations Head",
    accent: "bg-yellow-500",
  },
  {
    name: "Shrinivas Gowda",
    gender: "male",
    role: "Managing Partner, Purchase Head",
    accent: "bg-red-500",
  },
  {
    name: "Shalini Gowda",
    gender: "female",
    role: "Managing Partner, Sales Head",
    accent: "bg-blue-500",
  },
] as const;

const EXPERTISE_POINTS = [
  "Specializing in both Wholesale and Retail supply",
  "Meeting daily demands of Commercial Kitchens & Households",
  "Efficient supply chain with Timely Deliveries",
  "Preferred supplier for Restaurants, PGs, Hostels & Catering businesses",
] as const;

function CheckBadge() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </span>
  );
}

const WebsiteAbout = () => {
  return (
    <div className="min-h-screen text-slate-900">
      <WebsiteHeader />

      <main>
        {/* Hero — real <img> for LCP (CSS backgrounds are discovered too late) */}
        <section className="relative flex min-h-[60vh] items-center overflow-hidden pt-20">
          <OptimizedHero
            base={ABOUT_HERO_BASE}
            width={1400}
            height={933}
            sizes={HERO_SIZES}
            priority
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl text-left text-white">
              <Eyebrow tone="dark">Established 2020</Eyebrow>
              <h1 className="mb-6 mt-5 font-heading text-5xl font-bold leading-tight md:text-7xl">
                Our <span className="text-green-400">Story</span>
              </h1>
              <p className="text-xl leading-relaxed text-gray-200 md:text-2xl">
                Delivering freshness, quality, and reliability from farm to your
                doorstep across Bengaluru.
              </p>
            </div>
          </div>
        </section>

        {/* Story Intro */}
        <section className="overflow-hidden bg-white py-12 sm:py-14" id="about">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-4">
                  <img
                    src="/suggi-thota-logo.png"
                    alt="Suggi Thota logo"
                    width={192}
                    height={96}
                    loading="lazy"
                    decoding="async"
                    className="h-16 w-auto object-contain"
                  />
                  <Eyebrow>A Unit Of PRK Smile</Eyebrow>
                </div>
                <h2 className="mb-6 font-heading text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                  PRK Smile <span className="text-green-600">(Suggi Thota)</span>
                </h2>
                <div className="space-y-5 text-lg leading-relaxed text-slate-600">
                  <p>
                    PRK Smile (Suggi Thota) is a Bengaluru-based vegetable sourcing
                    and supply company committed to delivering freshness, quality,
                    and reliability. Founded in 2020 by{" "}
                    <span className="font-semibold text-green-700">Mr. Ishwar Gowda</span>
                    , PRK Smile has grown steadily over the past 5 years, earning a
                    strong reputation as a trusted partner.
                  </p>
                  <p className="border-l-4 border-green-500 pl-5 italic text-slate-700">
                    &ldquo;We are thrilled to introduce{" "}
                    <span className="font-bold not-italic text-green-700">Suggi Thota</span>
                    —our new online vegetable ordering platform, bringing the freshest
                    produce directly to your fingertips.&rdquo;
                  </p>
                  <p>
                    With deep roots in the Indian agricultural ecosystem, Mr.
                    Ishwar Gowda brings extensive knowledge of the vegetable market,
                    including seasonal trends, pricing dynamics, and quality
                    standards.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-3 divide-x divide-green-100">
                  {STORY_STATS.map((stat) => (
                    <div
                      key={stat.label}
                      className="px-2 text-center first:pl-0 sm:px-4"
                    >
                      <div className="text-2xl font-bold text-green-600 sm:text-3xl">{stat.value}</div>
                      <div className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <OptimizedImage
                base="top-view-tasty-fruits-arrangement-optimized"
                alt="Fresh produce from Suggi Thota"
                width={1024}
                height={683}
                className="h-[320px] w-full rounded-3xl object-cover shadow-xl sm:h-[460px]"
              />
            </div>
          </div>
        </section>

        {/* Market Expertise */}
        <section className="bg-[#f4f8f2] py-12 sm:py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <h2 className="mb-6 font-heading text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                  Deep Market Expertise <span className="text-green-600">&amp; Sourcing</span>
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-slate-600">
                  Our hands-on experience and strong relationships with farmers and
                  wholesale markets enable{" "}
                  <span className="font-bold uppercase text-green-600">Suggi Thota</span>{" "}
                  to source the best-quality vegetables directly from farms and
                  trusted mandis.
                </p>

                <ul className="space-y-3">
                  {EXPERTISE_POINTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_24px_60px_-30px_rgba(20,83,45,0.35)] transition-shadow duration-300 hover:shadow-md"
                    >
                      <CheckBadge />
                      <span className="font-medium text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <OptimizedImage
                base="healthy-vegetables-old-dark-background"
                alt="Suggi Thota Fresh Produce"
                width={1000}
                height={1500}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-[360px] w-full rounded-3xl object-cover shadow-xl sm:h-[500px]"
              />
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
              <div className="rounded-[2rem] bg-gradient-to-br from-green-800 to-green-950 p-8 text-white shadow-xl sm:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-green-300 ring-1 ring-white/15">
                  <Eye className="h-7 w-7" />
                </div>
                <h3 className="mb-4 font-heading text-3xl font-bold">
                  Our <span className="text-green-300">Vision</span>
                </h3>
                <p className="text-lg leading-relaxed text-green-50/90">
                  To become Bengaluru&apos;s most trusted vegetable sourcing and
                  supply partner, recognized for freshness, ethical sourcing, and
                  service excellence—connecting farmers to customers through a
                  reliable and transparent supply chain.
                </p>
              </div>

              <div className="rounded-[2rem] bg-[#f4f8f2] p-8 shadow-[0_24px_60px_-30px_rgba(20,83,45,0.35)] sm:p-10">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="mb-4 font-heading text-3xl font-bold text-slate-900">
                  Our <span className="text-green-600">Mission</span>
                </h3>
                <ul className="space-y-3">
                  {MISSION_POINTS.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-0.5">
                        <CheckBadge />
                      </span>
                      <span className="text-lg leading-snug text-slate-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-[#f4f8f2] py-12 sm:py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mb-8 text-center">
              <Eyebrow>Why Choose Us</Eyebrow>
              <h2 className="mb-5 mt-5 font-heading text-3xl font-bold text-slate-900 md:text-5xl">
                Beyond Supply, We Deliver <span className="text-green-600">Trust</span>
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-relaxed text-slate-600">
                With over 5 years of proven excellence, we understand the critical
                role fresh produce plays in your business and daily operations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_CHOOSE.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-3xl bg-white p-7 shadow-[0_24px_60px_-30px_rgba(20,83,45,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                  </div>
                  <h4 className="mb-2 font-heading text-xl font-bold text-slate-900">{item.title}</h4>
                  <p className="leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder’s Message */}
        <section className="bg-white py-12 sm:py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-green-900 to-green-950 p-8 shadow-2xl sm:p-12 md:p-16">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/15 blur-3xl" />
              <Quote className="absolute right-8 top-8 h-20 w-20 text-white/5" aria-hidden />
              <div className="relative">
                <Eyebrow tone="dark">Founder&apos;s Message</Eyebrow>
                <div className="mt-8 space-y-6 text-lg italic leading-relaxed text-green-50/90 md:text-xl">
                  <p>
                    &ldquo;PRK SMILE (Suggi Thota) was founded in 2020 with a simple
                    yet powerful vision—to deliver fresh, reliable, and fairly sourced
                    vegetables to businesses and households across Bengaluru.&rdquo;
                  </p>
                  <p>
                    &ldquo;Having spent years closely observing the Indian vegetable
                    market, I developed a deep understanding of sourcing practices and
                    seasonality. This knowledge has helped us build strong
                    relationships with farmers, enabling us to maintain consistency
                    and freshness.&rdquo;
                  </p>
                  <p>
                    &ldquo;As we continue to grow, our focus remains unchanged—to
                    strengthen the farm-to-customer supply chain, support our farmer
                    partners, and provide dependable service to our customers every
                    day.&rdquo;
                  </p>
                </div>
                <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-8">
                  <img
                    src="/avatar-male.png"
                    alt="Ishwar Gowda"
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-14 rounded-full bg-white/10 object-contain p-1 ring-2 ring-green-400/50"
                  />
                  <div>
                    <div className="text-xl font-bold text-white">Ishwar Gowda</div>
                    <div className="font-medium text-green-300">Founder &amp; CEO, PRK Smile</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-[#f4f8f2] py-12 sm:py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="mb-8 text-center">
              <h2 className="mb-4 font-heading text-3xl font-bold text-slate-900 md:text-5xl">
                Meet Our <span className="text-green-600">Team</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600">
                The dedicated professionals driving our mission forward.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="group relative overflow-hidden rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_-30px_rgba(20,83,45,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${member.accent}`} />
                  <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 p-2 ring-4 ring-white shadow-md">
                    <img
                      src={member.gender === "female" ? "/avatar-female.png" : "/avatar-male.png"}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="h-full w-full object-contain"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">{member.name}</h4>
                  <p className="mt-3 border-t border-green-100 pt-3 text-sm font-medium text-green-700">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — no contact form; link to Contact page */}
        <section className="bg-white py-10 sm:py-12">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center shadow-xl shadow-green-600/20 md:flex-row md:px-14 md:text-left">
              <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">
                Ready to experience farm-fresh quality?
              </h2>
              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-green-700 shadow-lg transition-all duration-300 hover:bg-green-50"
              >
                Contact Us Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <LazyWebsiteFooter />
    </div>
  );
};

export default WebsiteAbout;
