
import React, { useState, useEffect } from 'react';

export const ScrollProgress: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const updateProgress = () => {
        const totalScroll = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const currentScroll = window.scrollY;
        // Ensure we don't divide by zero
        const progress = totalScroll > 0 ? (currentScroll / totalScroll) * 100 : 0;
        setScrollProgress(progress);
        ticking = false;
    };

    const handleScroll = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateProgress);
            ticking = true;
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-[1300] pointer-events-none">
        <div 
          className="h-1 bg-gradient-to-r from-[#059669] to-[#FF7A00] transition-all duration-100 ease-out" 
          style={{ width: `${scrollProgress}%` }}>
        </div>
      </div>
  );
};
