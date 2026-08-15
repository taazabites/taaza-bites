/**
 * Dedicated Subscriptions browse page — matches marketing screenshots:
 * intro hero, category grid, then global Footer (rendered by App).
 */
import React from "react";
import { motion } from "motion/react";
import { ShopTopNav } from "./ShopTopNav";
import { PORTAL_LINKS } from "../config";
import { LazyImage } from "./LazyImage";

interface SubscriptionsBrowsePageProps {
  onNavigate: (path: string) => void;
}

const HERO_FLATLAY =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1600";
const HERO_TRANSFORM =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=1600";

const CATEGORIES = [
  {
    id: "indian-home-style",
    label: "Indian Home Style Meals",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&q=80&w=800",
    path: "/products",
  },
  {
    id: "muscle-gain",
    label: "Muscle Gain",
    image:
      "https://images.unsplash.com/photo-1532550907401-a532f99b7e18?auto=format&fit=crop&q=80&w=800",
    path: "/products",
  },
  {
    id: "balanced",
    label: "Balanced",
    image:
      "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&q=80&w=800",
    path: "/products",
  },
  {
    id: "fat-loss",
    label: "Fat Loss",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800",
    path: "/products",
  },
] as const;

export const SubscriptionsBrowsePage: React.FC<SubscriptionsBrowsePageProps> = ({
  onNavigate,
}) => {
  return (
    <div className="bg-white text-[#1A1A1A] w-full">
      <ShopTopNav active="subscriptions" onNavigate={onNavigate} />

      {/* Screenshot 1 — intro + flat-lay */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-6 sm:pb-8">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold tracking-tight text-zinc-900 leading-tight"
        >
          Healthy Meals Delivered Daily
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 max-w-2xl"
        >
          Customized Meal Plans for Weight Loss, Muscle Gain &amp; Healthy Living
        </motion.p>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.12 }}
        className="w-full"
      >
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] max-h-[520px] overflow-hidden">
          <LazyImage
            src={HERO_FLATLAY}
            alt="Assortment of healthy meal bowls and fresh ingredients"
            className="w-full h-full object-cover"
            wrapperClassName="w-full h-full"
            priority
            fetchPriority="high"
          />
        </div>
      </motion.section>

      {/* Screenshot 2 — overlay hero */}
      <section className="relative w-full mt-0">
        <div className="relative w-full min-h-[280px] sm:min-h-[380px] md:min-h-[440px] overflow-hidden">
          <LazyImage
            src={HERO_TRANSFORM}
            alt="Fresh Taaza Bites meals on marble"
            className="absolute inset-0 w-full h-full object-cover"
            wrapperClassName="absolute inset-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 flex flex-col justify-end min-h-[280px] sm:min-h-[380px] md:min-h-[440px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight max-w-xl leading-tight"
            >
              Transform Your Health with Taaza Bites
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/95"
            >
              Fresh Meals • Daily Delivery • No Cooking Required
            </motion.p>
          </div>
        </div>
      </section>

      {/* Screenshot 2 — browse categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Browse Categories
          </h2>
          <p className="mt-2 text-base sm:text-lg text-zinc-700">
            Find Your Perfect Meal Plan
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(cat.path)}
              className="group text-left cursor-pointer bg-transparent border-0 p-0"
            >
              <div className="rounded-xl sm:rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-100 shadow-sm ring-1 ring-zinc-100 group-hover:ring-[#059669]/30 transition-all">
                <LazyImage
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  wrapperClassName="w-full h-full"
                />
              </div>
              <p className="mt-3 sm:mt-4 text-center text-sm sm:text-base font-semibold text-zinc-900">
                {cat.label}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 flex justify-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = PORTAL_LINKS.subscribe;
            }}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#059669] text-white text-sm font-bold tracking-wide hover:bg-[#047857] transition-colors cursor-pointer shadow-lg shadow-emerald-700/20"
          >
            Start Your Subscription
          </button>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionsBrowsePage;
