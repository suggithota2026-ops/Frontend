import { memo } from "react";
import {
  buildHeroSrcSet,
  getHeroFallbackSrc,
  getHeroSizes,
  getHeroWidths,
} from "@/lib/heroAssets";

type OptimizedHeroProps = {
  base: string;
  alt?: string;
  width: number;
  height: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  pictureClassName?: string;
};

function bootMatchesBase(base: string) {
  const boot = document.getElementById("lcp-boot");
  if (!boot) return false;
  const src = boot.getAttribute("src") || "";
  return src.includes(base);
}

export const OptimizedHero = memo(function OptimizedHero({
  base,
  alt = "",
  width,
  height,
  sizes,
  priority = true,
  className = "h-full w-full object-cover object-center",
  pictureClassName = "absolute inset-0",
}: OptimizedHeroProps) {
  const resolvedSizes = sizes ?? getHeroSizes(base);
  const widths = getHeroWidths(base);
  const webpSrcSet = buildHeroSrcSet(base, "webp", widths);
  const fallbackSrc = getHeroFallbackSrc(base, "webp");

  // HTML boot image is already painted — a second <img> would replace it as LCP (~2–4s).
  const useBoot =
    priority &&
    typeof document !== "undefined" &&
    bootMatchesBase(base);

  if (useBoot) {
    return <div className={pictureClassName} aria-hidden />;
  }

  return (
    <div className={pictureClassName}>
      <img
        src={fallbackSrc}
        srcSet={webpSrcSet}
        alt={alt}
        width={width}
        height={height}
        sizes={resolvedSizes}
        decoding={priority ? "sync" : "async"}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        className={className}
      />
    </div>
  );
});

type OptimizedImageProps = {
  base: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export const OptimizedImage = memo(function OptimizedImage({
  base,
  alt,
  width,
  height,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  className,
  priority = false,
}: OptimizedImageProps) {
  const widths = getHeroWidths(base);
  const webpSrcSet = buildHeroSrcSet(base, "webp", widths);
  const jpgSrcSet = buildHeroSrcSet(base, "jpg", widths);

  return (
    <picture>
      <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      <source srcSet={jpgSrcSet} sizes={sizes} type="image/jpeg" />
      <img
        src={getHeroFallbackSrc(base, "webp")}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        className={className}
      />
    </picture>
  );
});
