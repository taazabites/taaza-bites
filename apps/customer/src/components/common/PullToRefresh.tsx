import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const controls = useAnimation();
  const PULL_THRESHOLD = 80;

  const handlePan = (event: any, info: PanInfo) => {
    if (isRefreshing || window.scrollY > 0) return;
    
    const distance = Math.max(0, info.offset.y);
    const easedDistance = Math.pow(distance, 0.8);
    setPullDistance(easedDistance);
  };

  const handlePanEnd = async (event: any, info: PanInfo) => {
    if (isRefreshing || window.scrollY > 0) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
      await onRefresh();
      setIsRefreshing(false);
      setPullDistance(0);
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div className="relative overflow-hidden w-full">
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onPan={handlePan}
        onPanEnd={handlePanEnd}
        animate={{ y: pullDistance }}
        className="relative z-10 w-full"
      >
        <div className="absolute -top-12 left-0 right-0 flex justify-center items-center h-12 pointer-events-none">
          <div className="flex flex-col items-center gap-1">
            <motion.div
              animate={{ 
                rotate: isRefreshing ? 360 : pullDistance * 2,
                scale: isRefreshing ? 1 : Math.min(1, pullDistance / PULL_THRESHOLD)
              }}
              transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
              className="p-2 bg-emerald-600 rounded-full text-white shadow-lg"
            >
              {isRefreshing ? <RefreshCw className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
              {isRefreshing ? 'Refreshing...' : pullDistance > PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
            </span>
          </div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
