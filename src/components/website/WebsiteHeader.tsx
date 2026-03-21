import { Link, useLocation } from "react-router-dom";

export function WebsiteHeader() {
  const { pathname } = useLocation();

  const nav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ] as const;

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-green-950">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-24 items-center justify-between gap-6">
          <div className="flex items-center">
            <Link to="/" className="group flex items-center">
              <div className="rounded-full bg-transparent shadow-lg transition-transform duration-300 group-hover:scale-110">
                <img
                  src="/Invoice.png"
                  alt="Suggi Thota Logo"
                  className="h-16 w-auto max-w-[160px] object-contain"
                />
              </div>
            </Link>
          </div>

          <nav className="ml-auto flex space-x-8">
            {nav.map((item) => {
              const isActive =
                item.to === "/"
                  ? pathname === "/"
                  : item.to === "/about"
                  ? pathname.startsWith("/about")
                  : item.to === "/contact"
                  ? pathname.startsWith("/contact")
                  : false;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "group relative text-lg transition-all duration-300",
                    "text-white hover:text-green-200",
                    isActive ? "font-semibold" : "font-medium",
                  ].join(" ")}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-green-200 transition-all duration-300 group-hover:w-full" />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center" />
        </div>
      </div>
    </header>
  );
}

