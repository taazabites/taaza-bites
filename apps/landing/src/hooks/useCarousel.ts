import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UseCarouselProps {
  itemCount: number;
  slideInterval?: number;
  defaultIndex?: number;
  depsHash?: string;
}

export const useCarousel = ({ itemCount, slideInterval = 5000, defaultIndex = 0, depsHash }: UseCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const isInternalScroll = useRef(false);
  const isProgrammaticScroll = useRef(false);
  const isHoveringRef = useRef(false);
  const resumeTimeoutRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (itemCount > 1 && slideInterval > 0 && !isUserInteracting) {
      timerRef.current = window.setInterval(() => {
        isProgrammaticScroll.current = true;
        setActiveIndex(prevIndex => (prevIndex + 1) % itemCount);
      }, slideInterval);
    }
  }, [itemCount, slideInterval, stopTimer, isUserInteracting]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  const triggerInactivityCountdown = useCallback(() => {
    if (resumeTimeoutRef.current) {
      window.clearTimeout(resumeTimeoutRef.current);
    }
    // If the user is actively hovering over the carousel, don't schedule resume yet.
    // It will be scheduled once they trigger onMouseLeave.
    if (isHoveringRef.current) {
      setIsUserInteracting(true);
      return;
    }
    setIsUserInteracting(true);
    resumeTimeoutRef.current = window.setTimeout(() => {
      setIsUserInteracting(false);
    }, 5000); // 5 seconds of inactivity
  }, []);

  const triggerButtonInteraction = useCallback(() => {
    triggerInactivityCountdown();
  }, [triggerInactivityCountdown]);

  // High-precision scroll tracking for "Smart" sliding
  const handleScroll = useCallback(() => {
    if (isInternalScroll.current || !scrollContainerRef.current) return;

    // Reset inactivity countdown as user is manually scrolling
    triggerInactivityCountdown();

    const container = scrollContainerRef.current;
    
    // Find children and calculate which is closest to the horizontal center of the container
    const children = container.children;
    if (children.length === 0) return;

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const centerPoint = scrollLeft + containerWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement;
      // Calculate distance of child center from container center using cheap offset properties
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(childCenter - centerPoint);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIndex) {
      // Mark as non-programmatic, so the useEffect doesn't call scrollTo back
      isProgrammaticScroll.current = false;
      setActiveIndex(closestIndex);
    }
  }, [activeIndex, triggerInactivityCountdown]);

  // Programmatic scroll logic with smooth interpolation
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && container.children.length > activeIndex) {
      const item = container.children[activeIndex] as HTMLElement;
      if (item) {
        const containerWidth = container.clientWidth;
        const itemWidth = item.clientWidth;
        const itemOffsetLeft = item.offsetLeft;
        
        // Target scroll to center the active item
        const targetScrollLeft = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);

        if (isInitialMount.current) {
          if (containerWidth === 0 || itemWidth === 0) {
            // Retry centering on the next frames once layout finishes
            const retryTimeout = setTimeout(() => {
              const freshContainer = scrollContainerRef.current;
              if (freshContainer && freshContainer.children.length > activeIndex) {
                const freshItem = freshContainer.children[activeIndex] as HTMLElement;
                if (freshItem) {
                  const cw = freshContainer.clientWidth;
                  const iw = freshItem.clientWidth;
                  const iol = freshItem.offsetLeft;
                  const tsl = iol - (cw / 2) + (iw / 2);
                  if (cw > 0 && iw > 0) {
                    freshContainer.scrollLeft = tsl;
                  }
                }
              }
            }, 120);
            isInitialMount.current = false;
            return () => clearTimeout(retryTimeout);
          }
          
          container.scrollLeft = targetScrollLeft;
          isInitialMount.current = false;
          return;
        }

        // Only programmatic triggers (dots, next, prev, auto-play) should smooth-scroll
        if (isProgrammaticScroll.current) {
          isInternalScroll.current = true;
          container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
          });

          // Release lock after animation duration
          const timeout = setTimeout(() => {
            isInternalScroll.current = false;
            isProgrammaticScroll.current = false;
          }, 600);
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [activeIndex]);

  // Instantly re-center on window resize or when layout changes (e.g. dietType or goal changes)
  useEffect(() => {
    const handleLayoutResize = () => {
      const container = scrollContainerRef.current;
      if (container && container.children.length > activeIndex) {
        const item = container.children[activeIndex] as HTMLElement;
        if (item) {
          const containerWidth = container.clientWidth;
          const itemWidth = item.clientWidth;
          const itemOffsetLeft = item.offsetLeft;
          const targetScrollLeft = itemOffsetLeft - (containerWidth / 2) + (itemWidth / 2);
          
          container.scrollLeft = targetScrollLeft;
        }
      }
    };

    // Run centering logic
    handleLayoutResize();
    
    // Set a minor timeout to ensure DOM finishes rendering styles/positions
    const timeout = setTimeout(handleLayoutResize, 50);

    window.addEventListener('resize', handleLayoutResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleLayoutResize);
    };
  }, [activeIndex, depsHash]);

  useEffect(() => {
    startTimer();
    return () => stopTimer();
  }, [startTimer, stopTimer]);

  const goToSlide = (index: number) => {
    triggerButtonInteraction();
    isProgrammaticScroll.current = true;
    setActiveIndex(index);
  };
  
  const goToNext = useCallback(() => {
    triggerButtonInteraction();
    isProgrammaticScroll.current = true;
    setActiveIndex(prevIndex => (prevIndex + 1) % itemCount);
  }, [itemCount, triggerButtonInteraction]);

  const goToPrevious = useCallback(() => {
    triggerButtonInteraction();
    isProgrammaticScroll.current = true;
    setActiveIndex(prevIndex => (prevIndex - 1 + itemCount) % itemCount);
  }, [itemCount, triggerButtonInteraction]);

  const handlers = {
    onMouseEnter: () => {
      isHoveringRef.current = true;
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      setIsUserInteracting(true);
    },
    onMouseLeave: () => {
      isHoveringRef.current = false;
      triggerInactivityCountdown();
    },
    onScroll: handleScroll,
    onTouchStart: (e: React.TouchEvent) => {
      if (resumeTimeoutRef.current) {
        window.clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
      setIsUserInteracting(true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      triggerInactivityCountdown();
    },
  };

  return {
    scrollContainerRef,
    activeIndex,
    goToSlide,
    goToNext,
    goToPrevious,
    handlers
  };
};