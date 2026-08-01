import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  placeholderSrc?: string;
  wrapperClassName?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoadStatusChange?: (isLoaded: boolean) => void;
  priority?: boolean;
  theme?: 'light' | 'dark' | 'neutral';
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholderSrc,
  wrapperClassName = '',
  loading,
  fetchPriority = 'auto',
  onLoadStatusChange,
  priority = false,
  theme = 'light',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isEager = priority || loading === 'eager' || fetchPriority === 'high';
  
  const isObserverVisible = useIntersectionObserver(containerRef, {
    threshold: 0.01,
    rootMargin: '1500px 0px 1500px 0px', // Increased margin for even earlier loading
    enabled: !isEager
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isVisible = isEager || isObserverVisible;

  // Optimized CDN URL helper for Unsplash and UrbanPiper
  const getOptimizedUrl = (baseUrl: string, width: number, quality = 75) => {
    if (!baseUrl || typeof baseUrl !== 'string') return '';
    const isUnsplash = baseUrl.includes('unsplash.com');
    const isUrbanPiper = baseUrl.includes('urbanpiper.com');
    
    if (isUnsplash) {
      const clean = baseUrl.split('?')[0];
      return `${clean}?auto=format,compress&q=${quality}&w=${width}&fm=webp`;
    }
    if (isUrbanPiper) {
       const clean = baseUrl.split('?')[0];
       return `${clean}?w=${width}&q=${quality}&fm=webp`;
    }
    return baseUrl;
  };

  const responsiveSrcSet = useMemo(() => {
    if (typeof src !== 'string' || (!src.includes('unsplash') && !src.includes('urbanpiper'))) return undefined;
    // Granular steps for responsive loading matching standard breakpoints
    return [320, 480, 640, 800, 1024, 1200, 1600].map(w => `${getOptimizedUrl(src, w)} ${w}w`).join(', ');
  }, [src]);

  const lqipSrc = useMemo(() => {
      if (placeholderSrc) return placeholderSrc;
      if (typeof src === 'string' && (src.includes('unsplash') || src.includes('urbanpiper'))) {
          return getOptimizedUrl(src, 20, 10); // Even lighter placeholder
      }
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }, [placeholderSrc, src]);

  const bgClass = theme === 'dark' 
    ? 'bg-neutral-900' 
    : theme === 'light' 
    ? 'bg-[#FBF9F6]' 
    : 'bg-zinc-100';

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${wrapperClassName}`}>
      {/* Skeleton / LQIP Layer. Kept mounted but scales out smoothly when loaded for cross-fade */}
      <div 
        className={`absolute inset-0 z-[1] ${bgClass} transition-opacity duration-500 ease-out ${isLoaded ? 'opacity-0 delay-300' : 'opacity-100'}`}
        aria-hidden="true"
      >
          <img 
              src={lqipSrc} 
              alt="" 
              className="w-full h-full object-cover blur-2xl opacity-90 scale-110 select-none pointer-events-none" 
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
          />
          {!isLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
          )}
      </div>
      
      {isVisible && (
        <img
          src={hasError ? 'https://cdn.urbanpiper.com/media/bizmedia/2026/06/19/HhPpnu-77502065-30b6-43ea-b959-146b6537957d.jpg' : (src as string)}
          srcSet={hasError ? undefined : responsiveSrcSet}
          sizes={props.sizes || (responsiveSrcSet ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px" : undefined)}
          alt={alt}
          className={`${className} relative z-[2] ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-out`}
          fetchPriority={fetchPriority}
          loading={loading || (isEager ? "eager" : "lazy")}
          decoding={isEager ? "sync" : "async"}
          referrerPolicy="no-referrer"
          onLoad={() => {
              setIsLoaded(true);
              onLoadStatusChange?.(true);
          }}
          onError={() => {
              setHasError(true);
              setIsLoaded(true); // stop skeleton
              onLoadStatusChange?.(true);
          }}
          {...props}
        />
      )}
    </div>
  );
};