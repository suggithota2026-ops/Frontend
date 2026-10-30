import type { ReactNode } from "react";

export const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.suggithota";

export function PlayStoreBadge({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex transition-transform duration-300 hover:scale-105"
      aria-label="Get it on Google Play"
    >
      <img
        src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
        alt="Get it on Google Play"
        width={646}
        height={250}
        className={className}
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}

/** Small label shown above section headings. */
export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <span
      className={[
        "inline-block text-xs font-bold uppercase tracking-[0.22em]",
        tone === "light" ? "text-green-700" : "text-green-300",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
