import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Zap, Flame } from 'lucide-react';
import { cn } from '@/src/lib/utils';

import OptimizedImage from '../common/OptimizedImage';

const MEALS = [
  {
    id: "1",
    name: "Mediterranean Salmon Power Bowl",
    calories: 450,
    protein: 35,
    carbs: 25,
    fat: 18,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.9,
    tag: "Lean Protein"
  },
  {
    id: "2",
    name: "Plant-Based Buddha Fuel",
    calories: 380,
    protein: 18,
    carbs: 45,
    fat: 12,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.7,
    tag: "Fiber Rich"
  },
  {
    id: "3",
    name: "Slow-Roasted Lean Beef Stir-Fry",
    calories: 520,
    protein: 42,
    carbs: 30,
    fat: 15,
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.8,
    tag: "Muscle Gain"
  },
  {
    id: "4",
    name: "Classic Pesto Grilled Chicken",
    calories: 410,
    protein: 38,
    carbs: 20,
    fat: 14,
    image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fm=webp&fit=crop&q=80&w=800",
    rating: 4.8,
    tag: "Keto Friendly"
  }
];

export default function MealCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % MEALS.length);
  };

  const slidePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + MEALS.length) % MEALS.length);
  };

  useEffect(() => {
    const timer = setInterval(slideNext, 5000);
    return () => clearInterval(timer);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      scale: 0.95
    })
  };

  const meal = MEALS[currentIndex];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
                <span className="text-emerald-600 font-black uppercase tracking-widest text-xs">Chef's Specials</span>
                <h2 className="text-4xl md:text-6xl font-black text-zinc-950 tracking-tighter mt-4">
                    Featured <span className="text-emerald-600">Creations</span>
                </h2>
                <p className="text-lg text-zinc-500 font-medium mt-4">Explore our most-loved nutritionist approved meals of the week.</p>
            </div>
            <div className="flex gap-3">
                <button 
                  onClick={slidePrev}
                  className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-6 h-6 text-zinc-900" />
                </button>
                <button 
                  onClick={slideNext}
                  className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-6 h-6 text-zinc-900" />
                </button>
            </div>
        </div>

        <div className="relative h-[600px] md:h-[500px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 }
              }}
              className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="relative h-[400px] lg:h-full rounded-[3rem] overflow-hidden shadow-2xl">
                  <OptimizedImage 
                    src={meal.image} 
                    alt={meal.name} 
                    className="w-full h-full object-cover"
                    containerClassName="w-full h-full"
                  />
                  <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/20">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-black text-zinc-900">{meal.rating} Rating</span>
                  </div>
              </div>

              <div className="space-y-8">
                  <div>
                    <span className="text-emerald-600 font-black uppercase tracking-widest text-[10px] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">{meal.tag}</span>
                    <h3 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mt-4">{meal.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <div className="flex items-center gap-2 mb-1">
                              <Flame className="w-4 h-4 text-orange-500" />
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Calories</span>
                          </div>
                          <p className="text-xl font-black text-zinc-800">{meal.calories}</p>
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <div className="flex items-center gap-2 mb-1">
                              <Zap className="w-4 h-4 text-emerald-500" />
                              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protein</span>
                          </div>
                          <p className="text-xl font-black text-zinc-800">{meal.protein}g</p>
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Carbs</span>
                          <p className="text-xl font-black text-zinc-800">{meal.carbs}g</p>
                      </div>
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Fats</span>
                          <p className="text-xl font-black text-zinc-800">{meal.fat}g</p>
                      </div>
                  </div>

                  <p className="text-lg text-zinc-500 font-medium leading-relaxed">
                    A premium culinary experience designed for peak metabolic performance. Sourced locally, prepared fresh daily.
                  </p>

                  <button className="h-14 px-10 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer">
                    View Full Nutrition Label
                  </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
