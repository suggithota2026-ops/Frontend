import { memo } from "react";

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

const WIDTHS = [640, 1024, 1920] as const;

function buildSrcSet(base: string, ext: "webp" | "jpg") {
  return WIDTHS.map((w) => `/${base}-${w}w.${ext} ${w}w`).join(", ");
}

export const OptimizedHero = memo(function OptimizedHero({
  base,
  alt = "",
  width,
  height,
  sizes = "100vw",
  priority = true,
  className = "h-full w-full object-cover object-center",
  pictureClassName = "absolute inset-0",
}: OptimizedHeroProps) {
  const webpSrcSet = buildSrcSet(base, "webp");
  const jpgSrcSet = buildSrcSet(base, "jpg");

  return (
    <picture className={pictureClassName}>
      <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      <source srcSet={jpgSrcSet} sizes={sizes} type="image/jpeg" />
      <img
        src={`/${base}-1024w.webp`}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "low"}
        className={className}
      />
    </picture>
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
  const webpSrcSet = buildSrcSet(base, "webp");
  const jpgSrcSet = buildSrcSet(base, "jpg");

  return (
    <picture>
      <source srcSet={webpSrcSet} sizes={sizes} type="image/webp" />
      <source srcSet={jpgSrcSet} sizes={sizes} type="image/jpeg" />
      <img
        src={`/${base}-1024w.webp`}
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
