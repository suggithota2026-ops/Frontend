import { memo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const WebsiteHeader = memo(function WebsiteHeader() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const nav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ] as const;

  const isActive = (to: string) =>
    to === "/"
      ? pathname === "/"
      : to === "/about"
        ? pathname.startsWith("/about")
        : to === "/contact"
          ? pathname.startsWith("/contact")
          : false;

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-green-950">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4 md:h-24">
          <Link to="/" className="group flex items-center" onClick={() => setIsMenuOpen(false)}>
            <div className="rounded-full bg-transparent shadow-lg transition-transform duration-300 group-hover:scale-105">
              <img
                src="/Invoice.png"
                alt="Suggi Thota Logo"
                width={160}
                height={64}
                decoding="async"
                fetchPriority="low"
                className="h-12 w-auto max-w-[130px] object-contain md:h-16 md:max-w-[160px]"
              />
            </div>
          </Link>

          <nav className="ml-auto hidden items-center space-x-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "group relative text-lg transition-all duration-300",
                  "text-white hover:text-green-200",
                  isActive(item.to) ? "font-semibold" : "font-medium",
                ].join(" ")}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-green-200 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen ? (
          <nav className="border-t border-white/10 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={[
                    "rounded-lg px-3 py-3 text-base transition-colors",
                    isActive(item.to)
                      ? "bg-white/10 font-semibold text-white"
                      : "font-medium text-white/90 hover:bg-white/5 hover:text-white",
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
