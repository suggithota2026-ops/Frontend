import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function IconMenu() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const WebsiteHeader = memo(function WebsiteHeader() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ] as const;

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-100 bg-white shadow-sm">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex h-[72px] items-center justify-between gap-4 md:h-[88px]">
          <Link to="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
            <img
              src="/prk-smile-logo.png"
              alt="Suggi Thota Logo"
              width={160}
              height={64}
              decoding="async"
              loading="lazy"
              fetchPriority="low"
              className="h-[58px] w-auto max-w-[170px] object-contain md:h-[68px] md:max-w-[200px]"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "relative py-1 text-[15px] transition-colors duration-200",
                  isActive(item.to)
                    ? "font-semibold text-green-700"
                    : "font-medium text-slate-700 hover:text-green-700",
                ].join(" ")}
              >
                {item.label}
                <span
                  className={[
                    "absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-green-600 transition-all duration-300",
                    isActive(item.to) ? "w-full" : "w-0",
                  ].join(" ")}
                />
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-800 transition-colors hover:bg-green-50 md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {isMenuOpen ? (
          <nav className="border-t border-green-100 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={[
                    "rounded-lg px-3 py-3 text-base transition-colors",
                    isActive(item.to)
                      ? "bg-green-50 font-semibold text-green-700"
                      : "font-medium text-slate-700 hover:bg-green-50",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
});
