/**
 * Subscriptions browse — single full-bleed hero + category grid.
 * Layout matches the clean marketing reference (overlay copy bottom-left).
 */
import React from "react";
import { motion } from "motion/react";
import { ShopTopNav } from "./ShopTopNav";
import { PORTAL_LINKS } from "../config";
import { LazyImage } from "./LazyImage";

interface SubscriptionsBrowsePageProps {
  onNavigate: (path: string) => void;
}

/** Flat-lay healthy meals — matches reference mood */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=85&w=2000";

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
    <div className="bg-white text-[#1A1A1A] w-full min-h-screen">
      <ShopTopNav active="subscriptions" onNavigate={onNavigate} />

      {/* Full-bleed hero — one image, copy bottom-left */}
      <section className="relative w-full">
        <div className="relative w-full h-[min(72vh,640px)] sm:h-[min(78vh,700px)] overflow-hidden bg-zinc-200">
          <motion.div
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <LazyImage
              src={HERO_IMAGE}
              alt="Healthy meal bowls, fresh produce, and Taaza Bites flat lay"
              className="w-full h-full object-cover object-center"
              wrapperClassName="w-full h-full"
              priority
              fetchPriority="high"
            />
          </motion.div>

          {/* Soft bottom fade for readability — no floating cards */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.22) 42%, rgba(0,0,0,0.05) 70%, transparent 100%)",
            }}
          />

          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 pb-10 sm:pb-14 md:pb-16">
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="text-[1.85rem] sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-white tracking-tight leading-[1.15] max-w-[18ch] sm:max-w-xl drop-shadow-sm"
              >
                Transform Your Health with Taaza Bites
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-white/95 font-medium tracking-wide"
              >
                Fresh Meals • Daily Delivery • No Cooking Required
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Browse categories */}
      <section className="max-w-[1200px] mx-auto px-5 sm:px-8 lg:px-10 py-12 sm:py-16 md:py-[4.5rem]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.45 }}
          className="mb-8 sm:mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Browse Categories
          </h2>
          <p className="mt-2 text-base sm:text-lg text-zinc-600">
            Find Your Perfect Meal Plan
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {CATEGORIES.map((cat, index) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-24px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => onNavigate(cat.path)}
              className="group text-left cursor-pointer bg-transparent border-0 p-0"
            >
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] ring-1 ring-zinc-100/80 group-hover:shadow-md group-hover:ring-[#059669]/25 transition-all duration-300">
                <LazyImage
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  wrapperClassName="w-full h-full"
                />
              </div>
              <p className="mt-3 sm:mt-3.5 text-center text-sm sm:text-[15px] font-semibold text-zinc-900">
                {cat.label}
              </p>
            </motion.button>
          ))}
        </div>

        <div className="mt-12 sm:mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => {
              window.location.href = PORTAL_LINKS.subscribe;
            }}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#059669] text-white text-sm font-bold tracking-wide hover:bg-[#047857] transition-colors cursor-pointer shadow-lg shadow-emerald-800/15"
          >
            Start Your Subscription
          </button>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionsBrowsePage;
