import { useState, useCallback, useEffect } from 'react';

export interface UseCarouselOptions {
  total: number;
  interval?: number;
  autoplay?: boolean;
}

export function useCarousel({ total, interval = 5000, autoplay = false }: UseCarouselOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index % total);
  }, [total]);

  useEffect(() => {
    if (!autoplay || total <= 1) return;

    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, next, total]);

  return {
    currentIndex,
    next,
    prev,
    goTo,
    total
  };
}
