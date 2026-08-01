import React from "react";
import Lottie from "lottie-react";
import { Sparkles, CheckCircle2, Utensils, Flame } from "lucide-react";
import {
  loadingAnimationData,
  successAnimationData,
  foodAnimationData,
  aiAnimationData,
} from "./lottieAnimations";

export type LottieAnimationType = "loading" | "success" | "food" | "ai";

export interface LottieLoaderProps {
  type?: LottieAnimationType;
  animationData?: any;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  loop?: boolean;
  autoplay?: boolean;
  text?: string;
  subtext?: string;
  fullScreen?: boolean;
  className?: string;
}

const SIZE_MAP = {
  sm: { width: 64, height: 64, iconSize: "w-5 h-5", textStyle: "text-xs" },
  md: { width: 100, height: 100, iconSize: "w-7 h-7", textStyle: "text-sm" },
  lg: { width: 140, height: 140, iconSize: "w-9 h-9", textStyle: "text-base" },
  xl: { width: 180, height: 180, iconSize: "w-11 h-11", textStyle: "text-lg" },
  full: { width: 220, height: 220, iconSize: "w-14 h-14", textStyle: "text-xl" },
};

export const LottieLoader: React.FC<LottieLoaderProps> = ({
  type = "loading",
  animationData,
  size = "md",
  loop = type !== "success",
  autoplay = true,
  text,
  subtext,
  fullScreen = false,
  className = "",
}) => {
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  // Resolve Lottie JSON preset
  const resolvedAnimationData =
    animationData ||
    (type === "success"
      ? successAnimationData
      : type === "food"
      ? foodAnimationData
      : type === "ai"
      ? aiAnimationData
      : loadingAnimationData);

  // Center Badge Icon for crisp high-res vector accent
  const renderBadgeIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle2 className={`${sizeConfig.iconSize} text-emerald-500 animate-pulse`} />;
      case "food":
        return <Utensils className={`${sizeConfig.iconSize} text-amber-500 animate-bounce`} />;
      case "ai":
        return <Sparkles className={`${sizeConfig.iconSize} text-violet-500 animate-spin-slow`} />;
      case "loading":
      default:
        return <Flame className={`${sizeConfig.iconSize} text-emerald-600 animate-pulse`} />;
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center text-center p-4 ${className}`}>
      {/* Animated Lottie Container */}
      <div className="relative flex items-center justify-center">
        {/* Lottie Vector Component */}
        <div style={{ width: sizeConfig.width, height: sizeConfig.height }}>
          <Lottie
            animationData={resolvedAnimationData}
            loop={loop}
            autoplay={autoplay}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Center Accent Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {renderBadgeIcon()}
        </div>
      </div>

      {/* Optional Label / Messages */}
      {text && (
        <p
          className={`mt-3 font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 ${sizeConfig.textStyle}`}
        >
          {text}
        </p>
      )}

      {subtext && (
        <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400 max-w-xs">
          {subtext}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl max-w-sm w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LottieLoader;
