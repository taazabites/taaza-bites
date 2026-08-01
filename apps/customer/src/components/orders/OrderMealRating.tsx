import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Check, MessageSquare, Edit2, Bot, ThumbsUp, Heart } from 'lucide-react';
import { Button, Textarea } from "@/src/components/ui/primitives";
import { cn } from "@/src/lib/utils";
import { triggerHaptic } from "@/src/utils/haptics";
import { db } from "@/src/firebase/db";
import { doc, updateDoc, setDoc, Timestamp } from "firebase/firestore";

export interface OrderMealRatingProps {
  orderId: string;
  planName?: string;
  initialRating?: number;
  initialFeedback?: string;
  initialTags?: string[];
  onRatingSubmitted?: (rating: number, feedback: string, tags: string[]) => void;
  compact?: boolean;
}

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  1: { text: "Needs Improvement", color: "text-rose-500", desc: "AI will adjust spice and ingredient combos" },
  2: { text: "Below Average", color: "text-amber-500", desc: "AI will reduce frequency of similar dishes" },
  3: { text: "Good & Fresh", color: "text-yellow-600", desc: "Balanced flavor, good macro distribution" },
  4: { text: "Very Delicious!", color: "text-emerald-600", desc: "AI will prioritize similar recipes" },
  5: { text: "Exceptional / AI Favorite!", color: "text-emerald-600 font-extrabold", desc: "Saved to your top AI menu preferences!" },
};

const QUICK_TAGS = [
  "✨ Perfect Portion",
  "🌶️ Great Spice Balance",
  "🥦 Ultra Fresh & Warm",
  "💪 High Protein Hit",
  "🧂 Less Salt Next Time",
  "🔥 Too Spicy",
  "🥑 Loved the Dressing",
  "⏰ Delivered Hot & On-Time"
];

export function OrderMealRating({
  orderId,
  planName,
  initialRating = 0,
  initialFeedback = "",
  initialTags = [],
  onRatingSubmitted,
  compact = false
}: OrderMealRatingProps) {
  // Check local storage for persistent rating fallback
  const storageKey = `taaza_rating_${orderId}`;
  
  const [rating, setRating] = useState<number>(() => {
    if (initialRating > 0) return initialRating;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.rating || 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(() => {
    if (initialFeedback) return initialFeedback;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved).feedback || ""; } catch { return ""; }
    }
    return "";
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    if (initialTags.length > 0) return initialTags;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { return JSON.parse(saved).tags || []; } catch { return []; }
    }
    return [];
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(() => {
    if (initialRating > 0) return true;
    return !!localStorage.getItem(storageKey);
  });
  const [isEditing, setIsEditing] = useState(false);
  const [aiTunedBadge, setAiTunedBadge] = useState(false);

  useEffect(() => {
    if (initialRating > 0) {
      setRating(initialRating);
      setIsSubmitted(true);
    }
  }, [initialRating]);

  const handleStarClick = (num: number) => {
    triggerHaptic('light');
    setRating(num);
  };

  const handleTagToggle = (tag: string) => {
    triggerHaptic('medium');
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    triggerHaptic('medium');
    setIsSubmitting(true);

    const ratingData = {
      rating,
      feedback,
      tags: selectedTags,
      updatedAt: new Date().toISOString()
    };

    // Save to local cache
    localStorage.setItem(storageKey, JSON.stringify(ratingData));

    try {
      // Try updating order doc in Firestore
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        mealRating: rating,
        mealFeedback: feedback,
        mealTags: selectedTags,
        ratedAt: Timestamp.now()
      }).catch(async () => {
        // Fallback: create in mealRatings collection
        await setDoc(doc(db, 'mealRatings', `${orderId}_rating`), {
          orderId,
          rating,
          feedback,
          tags: selectedTags,
          createdAt: Timestamp.now()
        });
      });
    } catch (err) {
      console.log("Saved locally (offline mode):", err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    setIsEditing(false);
    setAiTunedBadge(true);

    if (onRatingSubmitted) {
      onRatingSubmitted(rating, feedback, selectedTags);
    }

    setTimeout(() => {
      setAiTunedBadge(false);
    }, 5000);
  };

  // Compact card view once submitted
  if (isSubmitted && !isEditing) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-500/20 text-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "w-4 h-4 fill-amber-400 text-amber-400",
                    star > rating && "fill-zinc-200 dark:fill-zinc-700 text-zinc-300 dark:text-zinc-600"
                  )}
                />
              ))}
            </div>
            <span className="font-extrabold text-zinc-900 dark:text-white">
              {rating}/5
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" /> Rated
            </span>
          </div>

          <button
            onClick={() => { triggerHaptic('light'); setIsEditing(true); }}
            className="text-[10px] font-bold text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
        </div>

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTags.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-emerald-500/10">
                {t}
              </span>
            ))}
          </div>
        )}

        {feedback && (
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-medium italic mt-1.5 pl-2 border-l-2 border-emerald-500/30">
            "{feedback}"
          </p>
        )}

        {/* AI fine-tuning badge */}
        <div className="mt-2 pt-2 border-t border-emerald-500/10 flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
          <span>AI Fine-Tuning: Preferences updated for future menu recommendations.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 sm:p-5 rounded-2xl border transition-all bg-white dark:bg-zinc-900/90 border-zinc-200 dark:border-white/10 shadow-xs space-y-3.5",
      compact && "p-3 space-y-2.5"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <h4 className="text-xs font-black text-zinc-900 dark:text-white leading-tight">
              Rate This Meal
            </h4>
            <p className="text-[10px] text-zinc-400 font-medium">
              Helps AI fine-tune your personalized macro & flavor profile
            </p>
          </div>
        </div>

        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <Bot className="w-3 h-3" /> AI Trainer
        </span>
      </div>

      {/* Interactive Stars */}
      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-white/5 space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= (hoverRating || rating);
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(star)}
                className="p-1 cursor-pointer transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                aria-label={`Rate ${star} star`}
              >
                <Star
                  className={cn(
                    "w-6 h-6 sm:w-7 sm:h-7 transition-colors",
                    active
                      ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                      : "fill-zinc-200 dark:fill-zinc-800 text-zinc-300 dark:text-zinc-700"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Rating description */}
        <div className="h-5 text-center">
          {rating > 0 || hoverRating > 0 ? (
            <span className={cn("text-xs font-black", RATING_LABELS[hoverRating || rating]?.color)}>
              {RATING_LABELS[hoverRating || rating]?.text}
              <span className="block text-[10px] text-zinc-400 font-normal">
                {RATING_LABELS[hoverRating || rating]?.desc}
              </span>
            </span>
          ) : (
            <span className="text-[10px] font-bold text-zinc-400">
              Tap stars to rate your experience
            </span>
          )}
        </div>
      </div>

      {/* Quick Feedback Tags */}
      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">
            Quick Feedback Tags:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={cn(
                    "px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all border cursor-pointer",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-white/10 hover:border-emerald-400"
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Optional Textarea */}
          <div className="pt-1">
            <Textarea
              placeholder="Any specific feedback for our AI chef? (e.g. loved the garlic sauce, make tomorrow's lunch slightly less spicy)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="text-xs p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-white/10 min-h-[50px]"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-xl"
              >
                Cancel
              </Button>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="py-2 px-4 text-[10px] font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs flex items-center gap-1.5 border-none"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Submit & Fine-Tune AI
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* AI Tuned Banner notification */}
      <AnimatePresence>
        {aiTunedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin shrink-0" />
            <span className="font-bold">
              Feedback received! Your AI dietary engine has updated your weekly menu preferences.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
