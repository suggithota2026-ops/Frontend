export const HERO_BY_PATH: Record<string, string> = {
  "/": "close-up-dairy-products-optimized",
  "/about": "healthy-vegetables-wooden-table-optimized",
  "/contact": "top-view-tasty-fruits-arrangement-optimized",
};

/** Cap at 1024w — no 1920w on marketing heroes (cuts transfer ~2×) */
export const HERO_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1024px";
export const HERO_WIDTHS = [480, 640, 1024] as const;

export const CONTACT_HERO_SIZES =
  "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1024px";
export const CONTACT_HERO_WIDTHS = [480, 640, 1024] as const;

export const ABOUT_HERO_WIDTHS = [640, 1024] as const;

export function resolveHeroBase(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return HERO_BY_PATH["/"];
  if (pathname.startsWith("/about")) return HERO_BY_PATH["/about"];
  if (pathname.startsWith("/contact")) return HERO_BY_PATH["/contact"];
  return null;
}

export function getHeroWidths(base: string): readonly number[] {
  if (base === HERO_BY_PATH["/contact"]) return CONTACT_HERO_WIDTHS;
  if (base === HERO_BY_PATH["/about"]) return ABOUT_HERO_WIDTHS;
  return HERO_WIDTHS;
}

export function getHeroSizes(base: string) {
  if (base === HERO_BY_PATH["/contact"]) return CONTACT_HERO_SIZES;
  return HERO_SIZES;
}

export function buildHeroSrcSet(
  base: string,
  ext: "webp" | "jpg" = "webp",
  widths: readonly number[] = getHeroWidths(base)
) {
  return widths.map((w) => `/${base}-${w}w.${ext} ${w}w`).join(", ");
}

export function getHeroFallbackSrc(base: string, ext: "webp" | "jpg" = "webp") {
  const widths = getHeroWidths(base);
  return `/${base}-${widths[0]}w.${ext}`;
}

export function getHeroConfig(pathname: string) {
  const base = resolveHeroBase(pathname);
  if (!base) return null;

  const widths = getHeroWidths(base);
  const sizes = getHeroSizes(base);
  const srcset = buildHeroSrcSet(base, "webp", widths);
  const href = getHeroFallbackSrc(base, "webp");

  return { base, widths, sizes, srcset, href };
}

/** Inject / update boot image on SPA navigations; remove when leaving hero routes. */
export function ensureLcpBoot(pathname: string) {
  const cfg = getHeroConfig(pathname);

  if (!cfg) {
    document.getElementById("lcp-boot")?.remove();
    return;
  }

  const html = document.documentElement;
  html.classList.remove("route-home", "route-about", "route-contact");
  if (pathname.startsWith("/contact")) html.classList.add("route-contact");
  else if (pathname.startsWith("/about")) html.classList.add("route-about");
  else html.classList.add("route-home");

  let boot = document.getElementById("lcp-boot") as HTMLImageElement | null;
  if (!boot) {
    boot = document.createElement("img");
    boot.id = "lcp-boot";
    boot.alt = "";
    boot.width = 1024;
    boot.height = 768;
    boot.decoding = "async";
    boot.setAttribute("fetchpriority", "high");
    const root = document.getElementById("root");
    document.body.insertBefore(boot, root);
  }

  boot.sizes = cfg.sizes;
  boot.srcset = cfg.srcset;
  if (!boot.src.includes(cfg.base)) {
    boot.src = cfg.href;
  }
  boot.style.opacity = "1";
}
