import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../ui/primitives';
import { Flame, Info, CheckCircle2, Star, ChefHat, Leaf, Sparkles } from 'lucide-react';
import { MealSchedule } from '../../firebase/collections';
import { format } from 'date-fns';
import { AddCalendarButton } from '../common/AddCalendarButton';

interface TodaysMealProps {
  meal?: MealSchedule;
  onSwapRequest?: () => void;
  onMealClick?: () => void;
}

export default function TodaysMealWidget({ meal, onSwapRequest, onMealClick }: TodaysMealProps) {
  const navigate = useNavigate();
  if (!meal) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 p-8 rounded-[2rem] text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
          <Leaf className="w-8 h-8 text-emerald-500" />
        </div>
        <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">No Meal Scheduled Today</h3>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest max-w-[200px] leading-relaxed mb-4">
          Take a break, drink water, and stay active.
        </p>
        <button 
          onClick={() => navigate('/dashboard/todays-meals')}
          className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          Explore Today's Menu
        </button>
      </Card>
    );
  }

  const { mealDetails } = meal as any;

  return (
    <Card 
      className="bg-white dark:bg-zinc-900 border-zinc-100 dark:border-white/5 shadow-lg shadow-zinc-200/40 dark:shadow-none rounded-[2rem] overflow-hidden flex flex-col group cursor-pointer active:scale-[0.98] transition-transform" 
      onClick={() => onMealClick ? onMealClick() : navigate(`/meal-experience/${meal.id || 'seed_meal'}`)}
    >
      <div className="w-full h-56 sm:h-64 relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {mealDetails?.imageUrl ? (
          <img 
            src={mealDetails.imageUrl.includes('?') ? `${mealDetails.imageUrl}&fm=webp` : `${mealDetails.imageUrl}?fm=webp`} 
            alt={mealDetails.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <ChefHat className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm border border-white/20">
            {meal.mealType}
          </div>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
              {mealDetails?.name || 'Chef\'s Special'}
            </h3>
            {meal.status === 'delivered' && (
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/20 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-emerald-500/30 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Delivered</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
              <Flame className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-base font-black text-zinc-900 dark:text-white leading-none mb-1">{mealDetails?.nutrition?.calories || 0}</p>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Calories</p>
            </div>
          </div>
          <div className="w-px h-8 bg-zinc-100 dark:bg-zinc-800" />
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
              <Leaf className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-base font-black text-zinc-900 dark:text-white leading-none mb-1">{mealDetails?.nutrition?.protein || 0}g</p>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none">Protein</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5 mt-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Experience
            </div>
            <AddCalendarButton
              id={meal.id}
              dateStr={meal.date}
              mealType={meal.mealType}
              mealName={mealDetails?.name || "Chef's Special"}
              deliveryTimeStr={meal.deliveryTime}
              calories={mealDetails?.nutrition?.calories}
              protein={mealDetails?.nutrition?.protein}
              carbs={mealDetails?.nutrition?.carbs}
              fat={mealDetails?.nutrition?.fat}
              showLabel={false}
              variant="ghost"
            />
          </div>
          
          {meal.status === 'scheduled' && onSwapRequest && (
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onSwapRequest();
              }}
              variant="outline" 
              size="sm" 
              className="h-8 rounded-xl border-zinc-200 dark:border-zinc-700 text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              Swap Meal
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
