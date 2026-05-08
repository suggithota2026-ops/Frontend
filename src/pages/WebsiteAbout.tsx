import { Link } from "react-router-dom";
import { WebsiteHeader } from "@/components/website/WebsiteHeader";
import { WebsiteFooter } from "@/components/website/WebsiteFooter";

const WHY_CHOOSE = [
  {
    title: "Deep Market Expertise",
    desc: "Backed by in-depth knowledge of market trends, seasonal availability, and sourcing practices.",
    icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Farm-to-Customer Freshness",
    desc: "Direct sourcing minimizes handling time and preserves freshness, quality, and nutritional value.",
    icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",
  },
  {
    title: "Reliable Partner",
    desc: "Preferred supplier for restaurants & PGs, known for consistent quality and bulk capability.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    title: "Wholesale & Retail",
    desc: "Flexible sourcing and distribution model tailored to both commercial and household needs.",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    title: "Quality & Hygiene",
    desc: "Every batch is inspected to meet strict standards, ensuring only market-grade vegetables reach you.",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    title: "Transparent Pricing",
    desc: "Fair, competitive pricing without compromising quality—benefiting both farmers and customers.",
    icon: "M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm-3 12v-1.5c0-1 3-1.5 3-1.5s3 .5 3 1.5V20H9z",
  },
] as const;

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
    initials: "IG",
    role: "Founder & CEO, Finance Head",
    accent: "bg-green-500",
  },
  {
    name: "Dik Bahadur Pradhan",
    initials: "DBP",
    role: "Co-Founder & Operations Head",
    accent: "bg-yellow-500",
  },
  {
    name: "Shrinivas Gowda",
    initials: "SG",
    role: "Managing Partner, Purchase Head",
    accent: "bg-red-500",
  },
  {
    name: "Shalini Gowda",
    initials: "SG",
    role: "Managing Partner, Sales Head",
    accent: "bg-blue-500",
  },
] as const;

const WebsiteAbout = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <WebsiteHeader />

      <main>
        {/* Hero — bg image on section (avoids -z-10 painting behind the page shell) */}
        <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-[url('/healthy-vegetables-wooden-table.jpg')] bg-cover bg-center bg-no-repeat pt-24">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-left text-white">
              <p className="mb-4 animate-pulse font-bold uppercase tracking-widest text-green-400">
                Established 2020
              </p>
              <h1 className="mb-6 font-heading text-5xl font-extrabold leading-tight md:text-7xl">
                Our Story
              </h1>
              <p className="mb-8 max-w-2xl text-xl font-light leading-relaxed text-gray-200 md:text-2xl">
                Delivering freshness, quality, and reliability from farm to your
                doorstep across Bengaluru.
              </p>
            </div>
          </div>
        </section>

        {/* Story Intro */}
        <section className="overflow-hidden bg-white py-24" id="about">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-block rounded-full border border-green-100 bg-green-50 px-4 py-1 text-sm font-semibold uppercase tracking-wider text-green-600">
                  A Unit Of PRK Smile
                </div>
                <h2 className="mb-8 font-heading text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                  PRK Smile (Suggi Thota)
                </h2>
                <div className="space-y-6 text-lg text-gray-600">
                  <p>
                    PRK Smile (Suggi Thota) is a Bengaluru-based vegetable sourcing
                    and supply company committed to delivering freshness, quality,
                    and reliability. Founded in 2020 by{" "}
                    <span className="font-semibold italic text-green-600">
                      Mr. Ishwar Gowda
                    </span>
                    , PRK Smile has grown steadily over the past 5 years, earning a
                    strong reputation as a trusted partner.
                  </p>
                  <p className="rounded-r-xl border-l-4 border-green-500 bg-gray-50 py-4 pl-6 italic">
                    &ldquo;We are thrilled to introduce{" "}
                    <span className="font-bold text-green-700">Suggi Thota</span>
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
              </div>

              <div className="relative">
                <div className="rotate-3 transform rounded-3xl bg-gradient-to-br from-green-500 to-yellow-400 p-1 shadow-2xl transition-transform duration-500 hover:rotate-0">
                  <div className="rounded-[1.4rem] bg-white p-10 text-center">
                    <div className="mx-auto mb-8 flex h-24 w-24 -rotate-6 items-center justify-center rounded-2xl bg-green-100">
                      <svg
                        className="h-12 w-12 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-6xl font-black text-gray-900">5+</h3>
                    <p className="mt-2 text-xl font-bold uppercase tracking-widest text-green-600">
                      Years of Excellence
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-8">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">100%</div>
                        <div className="text-sm text-gray-500">Freshness</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">Direct</div>
                        <div className="text-sm text-gray-500">From Farm</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -right-6 h-32 w-32 animate-pulse rounded-full bg-yellow-400/30 blur-xl" />
                <div className="absolute -left-6 -top-6 h-32 w-32 animate-pulse rounded-full bg-green-400/30 blur-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Market Expertise */}
        <section className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <img
                  src="/healthy-vegetables-old-dark-background.jpg"
                  alt="Suggi Thota Fresh Produce"
                  className="h-[500px] w-full rounded-3xl object-cover shadow-2xl"
                  loading="lazy"
                />
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="mb-8 font-heading text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
                  Deep Market Expertise &amp; Sourcing
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-gray-600">
                  Our hands-on experience and strong relationships with farmers and
                  wholesale markets enable{" "}
                  <span className="font-bold uppercase text-green-600">
                    Suggi Thota
                  </span>{" "}
                  to source the best-quality vegetables directly from farms and
                  trusted mandis.
                </p>

                <div className="space-y-4">
                  {[
                    "Specializing in both Wholesale and Retail supply",
                    "Meeting daily demands of Commercial Kitchens & Households",
                    "Efficient supply chain with Timely Deliveries",
                    "Preferred supplier for Restaurants, PGs, Hostels & Catering businesses",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center space-x-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md"
                    >
                      <div className="rounded-full bg-green-500 p-1">
                        <svg
                          className="h-4 w-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="relative overflow-hidden py-24">
          <div className="absolute inset-0 origin-right skew-y-3 transform bg-green-900" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-12 text-white backdrop-blur-lg">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400">
                  <svg
                    className="h-8 w-8 text-green-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-6 text-3xl font-bold">Our Vision</h3>
                <p className="text-lg font-light leading-relaxed text-green-50">
                  To become Bengaluru&apos;s most trusted vegetable sourcing and
                  supply partner, recognized for freshness, ethical sourcing, and
                  service excellence—connecting farmers to customers through a
                  reliable and transparent supply chain.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/20 bg-white/10 p-12 text-white backdrop-blur-lg">
                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-400">
                  <svg
                    className="h-8 w-8 text-green-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="mb-6 text-3xl font-bold">Our Mission</h3>
                <ul className="space-y-4 text-green-50">
                  {MISSION_POINTS.map((point) => (
                    <li key={point} className="flex items-start space-x-3">
                      <span className="mt-1.5 text-yellow-400">•</span>
                      <span className="text-lg font-light leading-snug">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-20 text-center">
              <div className="mb-4 inline-block rounded-full border border-red-100 bg-red-50 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-red-600">
                Why Choose Us
              </div>
              <h2 className="mb-6 font-heading text-4xl font-extrabold text-gray-900 md:text-5xl">
                Beyond Supply—We Deliver{" "}
                <span className="italic text-green-600">Trust</span>
              </h2>
              <p className="mx-auto max-w-3xl text-xl font-light leading-relaxed text-gray-500">
                With over 5 years of proven excellence, we understand the critical
                role fresh produce plays in your business and daily operations.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
              {WHY_CHOOSE.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-500 hover:-translate-y-2 hover:border-green-200 hover:shadow-2xl"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 transition-colors duration-300 group-hover:bg-green-600 group-hover:text-white">
                    <svg
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <h4 className="mb-3 text-xl font-bold text-gray-900">
                    {item.title}
                  </h4>
                  <p className="leading-relaxed text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder’s Message */}
        <section className="relative overflow-hidden bg-gray-900 py-24">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Founder&apos;s Message
              </h2>
              <div className="mx-auto h-1 w-24 bg-green-500" />
            </div>
            <div className="relative rounded-[3rem] border border-white/10 bg-white/5 p-10 backdrop-blur-sm md:p-16">
              <svg
                className="absolute left-8 top-8 h-16 w-16 text-white/5"
                fill="currentColor"
                viewBox="0 0 32 32"
                aria-hidden
              >
                <path d="M10 8c-4.418 0-8 3.582-8 8s3.582 8 8 8c1.105 0 2-.895 2-2s-.895-2-2-2c-2.209 0-4-1.791-4-4s1.791-4 4-4c1.105 0 2-.895 2-2s-.895-2-2-2zM24 8c-4.418 0-8 3.582-8 8s3.582 8 8 8c1.105 0 2-.895 2-2s-.895-2-2-2c-2.209 0-4-1.791-4-4s1.791-4 4-4c1.105 0 2-.895 2-2s-.895-2-2-2z" />
              </svg>
              <div className="space-y-6 text-xl font-light italic leading-relaxed text-gray-300">
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
              <div className="mt-12 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">Ishwar Gowda</div>
                  <div className="font-medium text-green-400">
                    Founder &amp; CEO, PRK Smile
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-gray-50 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-20 text-center">
              <h2 className="mb-6 font-heading text-4xl font-extrabold text-gray-900 md:text-5xl">
                Meet Our Team
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-gray-500">
                The dedicated professionals driving our mission forward.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((member) => (
                <div
                  key={member.name}
                  className="group relative overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl"
                >
                  <div
                    className={`h-2 scale-x-0 transform transition-transform duration-500 group-hover:scale-x-100 ${member.accent}`}
                  />
                  <div className="p-8 text-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 grayscale transition-all duration-500 group-hover:grayscale-0">
                      <span className="text-3xl font-bold text-gray-400">
                        {member.initials}
                      </span>
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-gray-900">
                      {member.name}
                    </h4>
                    <p className="mt-4 border-t border-gray-100 pt-4 text-sm font-medium text-green-600">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA — no contact form; link to Contact page */}
        <section className="bg-green-600 py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="mb-8 font-heading text-3xl font-bold text-white md:text-5xl">
              Ready to experience farm-fresh quality?
            </h2>
            <Link
              to="/contact"
              className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-green-700 shadow-xl transition-all duration-300 hover:scale-105 hover:bg-yellow-400 hover:text-green-900"
            >
              Contact Us Now
            </Link>
          </div>
        </section>
      </main>

      <WebsiteFooter />
    </div>
  );
};

export default WebsiteAbout;
