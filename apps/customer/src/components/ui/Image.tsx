import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { ImageOff } from "lucide-react";

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  rootMargin?: string;
  placeholderClassName?: string;
  blurDataURL?: string;
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  fetchPriority?: "high" | "low" | "auto";
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  placeholderClassName,
  blurDataURL,
  aspectRatio,
  rootMargin = '200px',
  fallbackSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  objectFit = "cover",
  srcSet,
  sizes,
  onLoad,
  onError,
  loading,
  fetchPriority,
  style,
  ...props
}) => {
  const isPriority = loading === "eager" || fetchPriority === "high";
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(isPriority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPriority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, isPriority]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (onError) {
      onError(e);
    }
  };

  const objectFitClass =
    objectFit === "cover"
      ? "object-cover"
      : objectFit === "contain"
      ? "object-contain"
      : objectFit === "fill"
      ? "object-fill"
      : "object-none";

  return (
    <div 
      ref={containerRef}
      className={cn('relative overflow-hidden inline-block', containerClassName)}
      style={aspectRatio ? { aspectRatio, ...style } : style}
    >
      {/* Blurred Placeholder / Skeleton */}
      {!isLoaded && !hasError && (
        <div 
          className={cn(
            'absolute inset-0 bg-zinc-200 dark:bg-zinc-800 transition-opacity duration-500',
            blurDataURL ? "bg-cover bg-center" : "animate-pulse",
            placeholderClassName
          )} 
          style={blurDataURL ? { 
            backgroundImage: `url(${blurDataURL})`, 
            filter: "blur(20px)",
            transform: "scale(1.1)"
          } : undefined}
        />
      )}
      
      {!hasError ? (
        <img
          ref={imgRef}
          src={isInView ? src : fallbackSrc}
          srcSet={isInView ? srcSet : undefined}
          sizes={isInView ? sizes : undefined}
          alt={alt}
          loading={loading}
          // @ts-ignore - fetchPriority is supported in modern browsers and React 18.3+
          fetchPriority={fetchPriority}
          className={cn(
            'w-full h-full transition-opacity duration-700 ease-in-out',
            objectFitClass,
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 text-zinc-400 p-2 text-center">
          <ImageOff className="w-5 h-5 mb-1 opacity-50" />
        </div>
      )}
    </div>
  );
};

export default Image;
