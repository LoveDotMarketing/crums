import { useState, useRef, useEffect, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ProgressiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> {
  src: string;
  alt: string;
  webpSrc?: string;
  placeholderColor?: string;
  blurAmount?: number;
  threshold?: number;
  rootMargin?: string;
}

// Helper to generate WebP path from original image path
const getWebPPath = (src: string): string | null => {
  const supportedExtensions = ['.jpg', '.jpeg', '.png'];
  const extension = supportedExtensions.find(ext => src.toLowerCase().endsWith(ext));
  if (extension) {
    return src.slice(0, -extension.length) + '.webp';
  }
  return null;
};

export const ProgressiveImage = ({
  src,
  alt,
  webpSrc,
  className,
  placeholderColor = "hsl(var(--muted))",
  blurAmount = 20,
  threshold = 0.1,
  rootMargin = "50px",
  width,
  height,
  ...props
}: ProgressiveImageProps) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Only use WebP when explicitly provided - don't auto-generate paths
  const webpSource = webpSrc;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{
        backgroundColor: placeholderColor,
        aspectRatio: width && height ? `${width} / ${height}` : undefined,
      }}
    >
      {/* Placeholder with shimmer effect */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isLoaded ? "opacity-0" : "opacity-100"
        )}
        style={{ backgroundColor: placeholderColor }}
      >
        {/* Shimmer animation */}
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(90deg, transparent, hsl(var(--background) / 0.3), transparent)`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Actual image with WebP support - only load when in view */}
      {isInView && (
        <picture>
          {/* WebP source for browsers that support it */}
          {webpSource && (
            <source srcSet={webpSource} type="image/webp" />
          )}
          {/* Fallback to original format */}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-contain transition-all duration-700 ease-out",
              isLoaded ? "opacity-100 blur-0 scale-100" : `opacity-0 blur-sm scale-105`
            )}
            style={{
              filter: isLoaded ? "blur(0px)" : `blur(${blurAmount}px)`,
            }}
            {...props}
          />
        </picture>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground text-sm">Failed to load</span>
        </div>
      )}
    </div>
  );
};

export default ProgressiveImage;
