import React from "react";
import { Image } from "../ui/Image";

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  blurDataURL?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
}

/**
 * Utility to generate responsive WebP srcSet for standard CDN providers like Unsplash
 */
const generateWebPSrcSet = (src: string): string | undefined => {
  if (!src) return undefined;
  if (src.includes("images.unsplash.com")) {
    const cleanUrl = src.split("?")[0];
    const widths = [320, 640, 960, 1280, 1600];
    return widths
      .map((w) => `${cleanUrl}?auto=format&fit=crop&w=${w}&q=75&fm=webp ${w}w`)
      .join(", ");
  }
  return undefined;
};

/**
 * Formats the primary source URL to WebP where supported
 */
const getWebPSrc = (src: string): string => {
  if (!src) return "";
  if (src.includes("images.unsplash.com") && !src.includes("fm=webp")) {
    const separator = src.includes("?") ? "&" : "?";
    return `${src}${separator}fm=webp&auto=format`;
  }
  return src;
};

/**
 * Generates a low-quality blurred placeholder URL for standard CDN providers
 */
const generateBlurUrl = (src: string): string | undefined => {
  if (!src) return undefined;
  if (src.includes("images.unsplash.com")) {
    const cleanUrl = src.split("?")[0];
    return `${cleanUrl}?auto=format&fit=crop&w=50&q=20&blur=30`;
  }
  return undefined;
};

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  aspectRatio,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  blurDataURL,
  objectFit = "cover",
  onLoad,
  onError,
  ...rest
}) => {
  const finalSrc = getWebPSrc(src);
  const srcSet = generateWebPSrcSet(src);
  const finalBlurDataURL = blurDataURL || generateBlurUrl(src);

  return (
    <Image
      src={finalSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      containerClassName={containerClassName}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
      onLoad={onLoad}
      onError={onError}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      rootMargin={priority ? '1000px' : '200px'}
      blurDataURL={finalBlurDataURL}
      {...rest}
    />
  );
};

export default OptimizedImage;
