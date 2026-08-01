import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MealCard from './MealCard';
import BeautifulLoader from '../common/BeautifulLoader';
import { throttle } from '../../lib/performance';

interface Meal {
  id: string;
  name: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  description: string;
  rating: number;
  price: number;
  isSpecial?: boolean;
}

interface LazyMealGridProps {
  meals: Meal[];
}

export default function LazyMealGrid({ meals }: LazyMealGridProps) {
  const [visibleMeals, setVisibleMeals] = useState(6);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (window.innerHeight + document.documentElement.scrollTop 
          >= document.documentElement.offsetHeight - 200) {
        if (visibleMeals < meals.length && !loading) {
          loadMoreMeals();
        }
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleMeals, meals.length, loading]);

  const loadMoreMeals = () => {
    setLoading(true);
    // Simulate minor transition delay for realistic yet snappy feel
    setTimeout(() => {
      setVisibleMeals(prev => Math.min(prev + 3, meals.length));
      setLoading(false);
    }, 150);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {meals.slice(0, visibleMeals).map((meal, i) => (
            <motion.div
              key={meal.id || i}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ 
                duration: 0.4,
                delay: (i % 3) * 0.1 // Staggered entrance for each row
              }}
            >
              <MealCard meal={meal} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {loading && (
        <div className="flex justify-center py-12">
          <BeautifulLoader message="Curating more healthy options..." />
        </div>
      )}

      {!loading && visibleMeals >= meals.length && meals.length > 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 bg-slate-50 px-8 py-4 rounded-3xl border border-slate-100">
            <span className="w-2.5 h-2.5 bg-[#2D6A4F] rounded-full"></span>
            <p className="text-slate-500 font-black text-sm uppercase tracking-widest">You've explored our entire menu</p>
          </div>
        </div>
      )}
    </div>
  );
}
