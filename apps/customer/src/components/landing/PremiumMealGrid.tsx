import React from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, Zap, Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  description: string;
  image: string;
  rating: number;
  isSpecial?: boolean;
}

export default function PremiumMealGrid({ meals }: { meals: Meal[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {meals.map((meal, index) => (
        <motion.div
          key={meal.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-emerald-600/10 transition-all cursor-pointer"
          onClick={() => navigate(`/plans`)}
        >
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            <OptimizedImage 
              src={meal.image} 
              alt={meal.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              containerClassName="w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            {/* Badges */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              {meal.isSpecial && (
                <div className="px-3 py-1 bg-amber-400 text-zinc-950 text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 shadow-lg">
                  <Zap className="w-3 h-3 fill-current" /> Chef's Special
                </div>
              )}
              <div className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full flex items-center gap-1.5 border border-white/30">
                <Flame className="w-3 h-3" /> {meal.calories} kcal
              </div>
            </div>

            {/* Price/Rating Overlays */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-black tracking-tight">{meal.rating}</span>
              </div>
              <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                High Protein
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <h3 className="text-xl font-black text-zinc-950 mb-3 tracking-tight group-hover:text-emerald-600 transition-colors leading-tight">
              {meal.name}
            </h3>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6 line-clamp-2">
              {meal.description}
            </p>
            
            <div className="flex items-center justify-between pt-6 border-t border-zinc-100">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Protein</span>
                  <span className="text-sm font-black text-zinc-950">{meal.protein}g</span>
                </div>
                <div className="w-px h-6 bg-zinc-100" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Status</span>
                  <span className="text-sm font-black text-emerald-600">Active</span>
                </div>
              </div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
