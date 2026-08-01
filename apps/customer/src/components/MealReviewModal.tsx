import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  X, 
  Camera, 
  Send,
  ChefHat,
  Package,
  Leaf,
  Scale,
  Truck
} from 'lucide-react';
import { ReviewService } from '../firebase/services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { LottieLoader } from './common/LottieLoader';

interface MealReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealId: string;
  mealName: string;
  scheduleId: string;
  subscriptionId: string;
}

export default function MealReviewModal({ 
  isOpen, 
  onClose, 
  mealId, 
  mealName,
  scheduleId,
  subscriptionId 
}: MealReviewModalProps) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ratings, setRatings] = useState({
    taste: 5,
    packaging: 5,
    freshness: 5,
    portionSize: 5,
    delivery: 5
  });
  const [comments, setComments] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      const overallRating = Object.values(ratings).reduce((a, b) => a + b, 0) / 5;
      await ReviewService.submitMealReview({
        userId: currentUser.uid,
        mealId,
        mealName,
        scheduleId,
        subscriptionId,
        ratings,
        overallRating,
        comments
      });
      setIsSuccess(true);
      showToast("Review submitted successfully!", "success");
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } catch (error) {
      showToast("Failed to submit review.", "error");
    } finally {
      setLoading(false);
    }
  };

  const RatingRow = ({ label, value, icon: Icon, field }: { label: string, value: number, icon: any, field: keyof typeof ratings }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zinc-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</span>
        </div>
        <span className="text-xs font-black text-emerald-600">{value}/5</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings({ ...ratings, [field]: star })}
            className={cn(
              "flex-1 h-10 rounded-xl transition-all flex items-center justify-center",
              star <= value ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/10" : "bg-zinc-50 text-zinc-300 hover:bg-zinc-100"
            )}
          >
            <Star className={cn("h-4 w-4", star <= value ? "fill-current" : "")} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[48px] max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 bg-zinc-900 text-white flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Meal Review</p>
                <h3 className="text-2xl font-black">{mealName}</h3>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
              {isSuccess ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <LottieLoader
                    type="success"
                    size="xl"
                    loop={false}
                    text="Review Submitted!"
                    subtext="Your feedback helps our culinary team continuously perfect metabolic meal quality."
                  />
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RatingRow label="Taste" value={ratings.taste} icon={ChefHat} field="taste" />
                  <RatingRow label="Freshness" value={ratings.freshness} icon={Leaf} field="freshness" />
                  <RatingRow label="Packaging" value={ratings.packaging} icon={Package} field="packaging" />
                  <RatingRow label="Portion Size" value={ratings.portionSize} icon={Scale} field="portionSize" />
                  <div className="md:col-span-2">
                    <RatingRow label="Delivery" value={ratings.delivery} icon={Truck} field="delivery" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Experience</label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Tell us about the taste, texture, and your overall thoughts..."
                    className="w-full p-6 rounded-[32px] border-2 border-zinc-50 bg-zinc-50/30 focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={onClose}
                    className="flex-1 rounded-2xl h-14"
                  >
                    Skip
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                  >
                    {loading ? "Submitting..." : "Submit Review"} <Send className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
