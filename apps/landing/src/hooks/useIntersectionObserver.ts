import { useState, useEffect, RefObject } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  enabled?: boolean;
}

export const useIntersectionObserver = (
  ref: RefObject<Element>,
  options: IntersectionObserverOptions = { threshold: 0.1, rootMargin: '200px', enabled: true }
): boolean => {
  const [isVisible, setIsVisible] = useState(false);
  const { enabled = true, ...obsOptions } = options;

  useEffect(() => {
    if (!enabled) return;
    
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(element);
      }
    }, obsOptions);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, enabled, JSON.stringify(obsOptions)]);

  return isVisible;
};