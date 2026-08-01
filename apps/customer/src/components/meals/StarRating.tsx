import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from "@/src/lib/utils";
import { motion } from 'framer-motion';

interface StarRatingProps {
  initialRating?: number;
  max?: number;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({ 
  initialRating = 0, 
  max = 5, 
  onRate, 
  readOnly = false,
  className 
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleRate = (r: number) => {
    if (readOnly) return;
    setRating(r);
    if (onRate) onRate(r);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(max)].map((_, i) => {
        const starValue = i + 1;
        return (
          <motion.button
            key={i}
            whileHover={readOnly ? {} : { scale: 1.2 }}
            whileTap={readOnly ? {} : { scale: 0.9 }}
            onClick={() => handleRate(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            className={cn(
              "focus:outline-none transition-colors",
              readOnly ? "cursor-default" : "cursor-pointer"
            )}
          >
            <Star
              className={cn(
                "h-5 w-5",
                (hover || rating) >= starValue
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-300 dark:text-zinc-600"
              )}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
