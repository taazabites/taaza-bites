import React, { useRef, ReactNode, Suspense } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import AnimateOnView from './AnimateOnView';

interface RenderOnViewProps {
  children: ReactNode;
  placeholderHeight?: string;
  rootMargin?: string;
  id?: string;
  forceRender?: boolean;
  fallback?: ReactNode;
  animation?: string;
  delay?: number;
}

const BioSkeleton = () => (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 animate-pulse relative overflow-hidden">
        <div className="flex flex-col items-center gap-6 mb-16">
            <div className="h-3 w-40 bg-zinc-200/80 rounded-full"></div>
            <div className="h-14 w-full max-w-lg bg-zinc-200 rounded-[2rem]"></div>
            <div className="h-3 w-64 bg-zinc-200/50 rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-zinc-100 rounded-[2.5rem] border border-zinc-200 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
                    <div className="absolute bottom-0 left-0 w-full p-8 space-y-4 bg-white/60 backdrop-blur-sm">
                        <div className="h-6 w-3/4 bg-zinc-200 rounded-lg"></div>
                        <div className="h-3 w-full bg-zinc-200/60 rounded-lg"></div>
                        <div className="h-3 w-2/3 bg-zinc-200/60 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
        <style>{`
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            .animate-shimmer { animation: shimmer 2.5s infinite linear; }
        `}</style>
    </div>
);

const RenderOnView: React.FC<RenderOnViewProps> = ({
  children,
  placeholderHeight = '400px',
  rootMargin = '600px 0px 600px 0px', // Pre-load even earlier for better speed
  id,
  forceRender = false,
  fallback,
  animation,
  delay
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, { rootMargin });

  const shouldRender = forceRender || isVisible;

  const animationClass = animation ? `${animation} animate-on-scroll` : '';
  const animationDelay = delay ? `${delay}s` : undefined;

  return (
    <div 
      ref={ref} 
      id={id} 
      className={`scroll-mt-24 w-full min-h-[1px] ${animationClass}`}
      data-stagger-delay={animationDelay}
    >
      {shouldRender ? (
          <Suspense fallback={fallback || <BioSkeleton />}>
              {children}
          </Suspense>
      ) : (
          fallback ? (
              <div style={{ minHeight: placeholderHeight }}>
                  {fallback}
              </div>
          ) : (
              <div style={{ minHeight: placeholderHeight }} className="flex items-center justify-center bg-zinc-50/30 rounded-[3rem] m-4 border border-dashed border-zinc-200/50">
                 <div className="w-1.5 h-1.5 bg-[#059669]/20 rounded-full animate-ping"></div>
              </div>
          )
      )}
    </div>
  );
};

export default RenderOnView;