import React, { useState, useEffect, useMemo } from 'react';
import { Star, MessageSquare, CheckCircle, Utensils, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

interface MealInfo {
    id: string;
    name: string;
    type: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

interface MealFeedbackWidgetProps {
    plan: Record<string, Record<string, MealInfo>>;
    completedMeals: Record<string, Record<string, boolean>>;
}

export const MealFeedbackWidget: React.FC<MealFeedbackWidgetProps> = ({ plan, completedMeals }) => {
    const { user } = useAuth();
    const [selectedMealId, setSelectedMealId] = useState<string>('');
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [comments, setComments] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Extract all meals from the plan
    const planMeals = useMemo(() => {
        const list: Array<{ id: string; name: string; type: string; day: string }> = [];
        if (!plan) return list;
        Object.entries(plan).forEach(([day, dayMeals]) => {
            if (!dayMeals) return;
            Object.entries(dayMeals).forEach(([slot, meal]) => {
                if (meal) {
                    list.push({
                        id: meal.id,
                        name: meal.name,
                        type: slot,
                        day
                    });
                }
            });
        });
        return list;
    }, [plan]);

    // Check if a meal has been eaten
    const isEaten = (day: string, slot: string) => {
        return completedMeals?.[day]?.[slot] || false;
    };

    // Sort meals to prioritize eaten ones first, then upcoming
    const sortedMeals = useMemo(() => {
        return [...planMeals].sort((a, b) => {
            const aEaten = isEaten(a.day, a.type) ? 1 : 0;
            const bEaten = isEaten(b.day, b.type) ? 1 : 0;
            return bEaten - aEaten; // completed/eaten meals first
        });
    }, [planMeals, completedMeals]);

    // Initialize selected meal to the first eaten meal, or first available meal
    useEffect(() => {
        if (sortedMeals.length > 0 && !selectedMealId) {
            const firstEaten = sortedMeals.find(m => isEaten(m.day, m.type));
            setSelectedMealId(firstEaten ? firstEaten.id : sortedMeals[0].id);
        }
    }, [sortedMeals, selectedMealId]);

    const activeMeal = useMemo(() => {
        return planMeals.find(m => m.id === selectedMealId);
    }, [planMeals, selectedMealId]);

    const ratingLabel = useMemo(() => {
        const r = hoveredRating || rating;
        switch (r) {
            case 1: return 'Needs improvement';
            case 2: return 'Okay';
            case 3: return 'Good / Tasty';
            case 4: return 'Very delicious!';
            case 5: return 'Absolutely extraordinary!';
            default: return 'Select rating';
        }
    }, [rating, hoveredRating]);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (rating < 1 || rating > 5) {
            setSubmitError("Please select a rating of at least 1 star.");
            return;
        }
        if (!activeMeal) {
            setSubmitError("Please select a meal to rate.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
            
            if (db) {
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const feedbackDocRef = doc(db, 'meal_feedback', feedbackId);
                
                const payload: any = {
                    mealId: activeMeal.id,
                    mealName: activeMeal.name,
                    rating: rating,
                    userId: user.uid,
                    userDisplayName: user.displayName || 'Valued Eater',
                    timestamp: serverTimestamp()
                };
                if (comments.trim()) {
                    payload.comments = comments.trim();
                }

                await setDoc(feedbackDocRef, payload);
            } else {
                // Simulate delay for offline sandbox / local demo mode
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Save to local storage for persistent mock tracking
                try {
                    const mockFeedback = JSON.parse(localStorage.getItem('mock_meal_feedback') || '[]');
                    mockFeedback.push({
                        id: feedbackId,
                        mealId: activeMeal.id,
                        mealName: activeMeal.name,
                        rating: rating,
                        comments: comments.trim(),
                        userId: user.uid,
                        userDisplayName: user.displayName || 'Valued Eater',
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('mock_meal_feedback', JSON.stringify(mockFeedback));
                } catch (e) {
                    console.warn("Storage access denied:", e);
                }
            }

            setSubmitSuccess(true);
            
            const toastEvent = new CustomEvent('taaza:toast', {
                detail: { 
                    message: `Rating saved! Thank you for reviewing the "${activeMeal.name}".`, 
                    type: 'success' 
                }
            });
            window.dispatchEvent(toastEvent);
        } catch (err) {
            console.error("Error writing meal feedback to Firestore:", err);
            setSubmitError("Failed to save feedback. Please check your network connection.");
            const toastEvent = new CustomEvent('taaza:toast', {
                detail: { message: "Could not sync review to Firebase.", type: 'error' }
            });
            window.dispatchEvent(toastEvent);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReset = () => {
        setSubmitSuccess(false);
        setRating(0);
        setComments('');
        setSubmitError(null);
    };

    if (!user) return null;

    return (
        <div id="meal-feedback-section" className="bg-white p-6 sm:p-10 rounded-[3rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7A00]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000 pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-zinc-50 pb-4 gap-2">
                <div>
                    <span className="text-[9px] font-black text-[#FF7A00] uppercase tracking-[0.5em] block mb-1">CULINARY JOURNAL</span>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-sans text-[#1A1A1A] flex items-center gap-2 uppercase">
                        <Utensils className="w-5 h-5 text-[#FF7A00]" /> How was your meal?
                    </h3>
                </div>
                <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                    Saves to Firestore
                </span>
            </div>

            {submitSuccess ? (
                <div className="py-8 text-center flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-16 h-16 bg-[#059669]/10 rounded-full flex items-center justify-center text-[#059669] mb-4 animate-bounce">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-bold text-[#1A1A1A] mb-1">Feedback Submitted Successfully!</h4>
                    <p className="text-zinc-500 text-xs sm:text-sm max-w-sm font-light leading-relaxed mb-6">
                        Thank you! Your rating and comments have been registered in our kitchen logs. Our culinary team reads every review to fine-tune your meals.
                    </p>
                    <button
                        onClick={handleReset}
                        className="px-6 py-3 bg-[#1A1A1A] hover:bg-[#FF7A00] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] shadow-lg hover:shadow-xl transition-all active:scale-95 duration-300"
                    >
                        Rate Another Meal
                    </button>
                </div>
            ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                    {/* Meal selector */}
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                            Select Meal to Rate
                        </label>
                        <div className="relative">
                            <select
                                value={selectedMealId}
                                onChange={(e) => {
                                    setSelectedMealId(e.target.value);
                                    setRating(0);
                                    setSubmitError(null);
                                }}
                                className="w-full bg-zinc-50 border-transparent focus:bg-white focus:border-[#FF7A00] rounded-2xl p-4 text-xs font-medium text-[#1A1A1A] outline-none transition-all pr-10 appearance-none cursor-pointer"
                            >
                                {sortedMeals.map((meal) => {
                                    const eaten = isEaten(meal.day, meal.type);
                                    return (
                                        <option key={meal.id} value={meal.id}>
                                            {eaten ? '✓ [EATEN] ' : '[UPCOMING] '} {meal.day} {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)} — {meal.name}
                                        </option>
                                    );
                                })}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                                <Sparkles className="w-4 h-4 text-[#FF7A00]/70" />
                            </div>
                        </div>
                    </div>

                    {/* Star selector */}
                    <div className="bg-zinc-50/50 p-6 rounded-2xl border border-zinc-100 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">
                            Your Rating
                        </span>
                        
                        <div className="flex items-center gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((starIndex) => {
                                const isActive = starIndex <= (hoveredRating || rating);
                                return (
                                    <button
                                        type="button"
                                        key={starIndex}
                                        onClick={() => {
                                            setRating(starIndex);
                                            setSubmitError(null);
                                        }}
                                        onMouseEnter={() => setHoveredRating(starIndex)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="focus:outline-none transform hover:scale-115 active:scale-95 transition-all duration-200 cursor-pointer"
                                        aria-label={`Rate ${starIndex} stars`}
                                    >
                                        <Star
                                            className={`w-8 h-8 ${
                                                isActive 
                                                    ? 'fill-[#FF7A00] text-[#FF7A00]' 
                                                    : 'text-zinc-300'
                                            } transition-all`}
                                        />
                                    </button>
                                );
                            })}
                        </div>

                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
                            rating > 0 || hoveredRating > 0 ? 'text-[#FF7A00]' : 'text-zinc-400'
                        }`}>
                            {ratingLabel}
                        </span>
                    </div>

                    {/* Comments */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                Optional Comments
                            </label>
                            <span className="text-[9px] font-mono font-medium text-zinc-400">
                                {comments.length}/1000
                            </span>
                        </div>
                        <div className="relative">
                            <textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value.slice(0, 1000))}
                                placeholder="Tell us how the flavor profile tasted, or what we can adjust (e.g. spice, sodium, portion, temperature)..."
                                rows={3}
                                className="w-full bg-zinc-50 border-transparent focus:bg-white focus:border-[#FF7A00] rounded-2xl p-4 text-xs text-[#1A1A1A] outline-none transition-all resize-none font-light leading-relaxed"
                            />
                            <div className="absolute right-4 bottom-4 text-zinc-300 pointer-events-none">
                                <MessageSquare className="w-4 h-4 opacity-40 text-zinc-500" />
                            </div>
                        </div>
                    </div>

                    {/* Error display */}
                    {submitError && (
                        <div className="p-4 bg-red-50 text-red-700 text-xs font-medium rounded-2xl flex items-center gap-2 border border-red-100">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                            <span>{submitError}</span>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 bg-[#1A1A1A] hover:bg-[#FF7A00] text-white rounded-full text-xs font-bold uppercase tracking-[0.15em] shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer ${
                            isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Logging in Firestore...</span>
                            </>
                        ) : (
                            <span>Submit Feedback</span>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};
