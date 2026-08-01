import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, ChefHat, Star } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/image';

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

interface MealCardProps {
  meal: Meal;
  index: number;
}

export default function MealCard({ meal, index }: MealCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-premium hover:shadow-premium-lg transition-all duration-500 cursor-pointer spring-interactive"
    >
      {/* Meal Image with Overlay */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          src={getOptimizedImageUrl(meal.image, 500)}
          alt={meal.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <span className="bg-[#FF6B35]/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-black shadow-lg uppercase tracking-wider">
            {meal.calories} cal
          </span>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`p-2 rounded-full transition-all duration-300 ${isLiked ? 'bg-red-500 text-white' : 'bg-white/20 text-white backdrop-blur-md hover:bg-white/40'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Chef's Special Badge */}
        {meal.isSpecial && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute top-4 right-4 bg-[#2D6A4F]/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-lg uppercase tracking-wider"
          >
            <ChefHat className="w-3 h-3" />
            Special
          </motion.div>
        )}
      </div>

      {/* Meal Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-[#2D6A4F] transition-colors">{meal.name}</h3>
          <div className="flex items-center gap-1 text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {meal.rating}
          </div>
        </div>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{meal.description}</p>
        
        {/* Macro Information */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Protein</div>
            <div className="font-black text-[#2D6A4F] text-sm">{meal.protein}g</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Carbs</div>
            <div className="font-black text-[#2D6A4F] text-sm">{meal.carbs}g</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 border border-slate-100 text-center">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fat</div>
            <div className="font-black text-[#2D6A4F] text-sm">{meal.fat}g</div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight">₹{meal.price}</span>
            <span className="text-slate-400 text-[10px] font-black ml-1 uppercase">/meal</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-slate-900 hover:bg-[#2D6A4F] text-white font-black text-xs py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-slate-200 uppercase tracking-wider"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </motion.button>
        </div>
      </div>

      {/* Hover Effect Overlay (Simplified for performance) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-[#2D6A4F]/5 pointer-events-none border-2 border-transparent group-hover:border-[#2D6A4F]/20 rounded-3xl"
      />
    </motion.div>
  );
}
