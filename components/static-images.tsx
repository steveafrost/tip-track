type LogoImageProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: "default" | "dark";
};

type PhoneScreenshotProps = {
  alt: string;
  className?: string;
  image: "add-order" | "locations" | "reports";
  priority?: boolean;
};

const optimizedBase = "/images/optimized";

export function LogoImage({
  alt = "TipTrack",
  className = "",
  priority = false,
  variant = "default",
}: LogoImageProps) {
  const logo =
    variant === "dark"
      ? {
          avif: `${optimizedBase}/logo-dark-72.avif 1x, ${optimizedBase}/logo-dark-144.avif 2x`,
          fallback: "/images/logo-dark-192.png",
        }
      : {
          avif: `${optimizedBase}/logo-72.avif 1x, ${optimizedBase}/logo-144.avif 2x`,
          fallback: "/images/logo-192.png",
        };

  return (
    <picture>
      <source type="image/avif" srcSet={logo.avif} />
      <img
        src={logo.fallback}
        alt={alt}
        width={72}
        height={72}
        className={className}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading={priority ? "eager" : "lazy"}
      />
    </picture>
  );
}

export function MarketingHeroImage() {
  return (
    <picture className="absolute inset-0 block">
      <source
        type="image/avif"
        sizes="100vw"
        srcSet={`${optimizedBase}/marketing/hero-dashboard-640.avif 640w, ${optimizedBase}/marketing/hero-dashboard-1080.avif 1080w, ${optimizedBase}/marketing/hero-dashboard-1600.avif 1600w`}
      />
      <img
        src={`${optimizedBase}/jpg/marketing/hero-dashboard-1600.jpg`}
        srcSet={`${optimizedBase}/jpg/marketing/hero-dashboard-640.jpg 640w, ${optimizedBase}/jpg/marketing/hero-dashboard-1080.jpg 1080w, ${optimizedBase}/jpg/marketing/hero-dashboard-1600.jpg 1600w`}
        sizes="100vw"
        alt=""
        width={1600}
        height={900}
        className="h-full w-full object-cover object-center"
        decoding="async"
        fetchPriority="high"
        loading="eager"
      />
    </picture>
  );
}

export function PhoneScreenshot({
  alt,
  className = "",
  image,
  priority = false,
}: PhoneScreenshotProps) {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${optimizedBase}/marketing/${image}-232.avif 1x, ${optimizedBase}/marketing/${image}-464.avif 2x`}
      />
      <img
        src={`${optimizedBase}/jpg/marketing/${image}-464.jpg`}
        srcSet={`${optimizedBase}/jpg/marketing/${image}-232.jpg 1x, ${optimizedBase}/jpg/marketing/${image}-464.jpg 2x`}
        alt={alt}
        width={232}
        height={502}
        className={className}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        loading="eager"
      />
    </picture>
  );
}
