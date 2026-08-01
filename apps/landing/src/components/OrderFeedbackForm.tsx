/**
 * @file OrderFeedbackForm.tsx
 * @description Post-meal feedback form for rating meal quality and packaging for a delivered order.
 * Integrates with Firestore and features robust local validation and fallback local storage.
 * Designed with Taazabites' fresh, vibrant color palette (greens, oranges, and warm yellows).
 */

import React, { useState, useMemo } from 'react';
import { Star, MessageSquare, CheckCircle, AlertCircle, Sparkles, Package, Utensils } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';

interface OrderFeedbackFormProps {
    orderId: string;
    mealName: string;
    onSuccess: () => void;
    onCancel?: () => void;
}

export const OrderFeedbackForm: React.FC<OrderFeedbackFormProps> = ({
    orderId,
    mealName,
    onSuccess,
    onCancel
}) => {
    const { user } = useAuth();
    
    // Form States
    const [mealRating, setMealRating] = useState<number>(0);
    const [hoveredMealRating, setHoveredMealRating] = useState<number>(0);
    
    const [packagingRating, setPackagingRating] = useState<number>(0);
    const [hoveredPackagingRating, setHoveredPackagingRating] = useState<number>(0);
    
    const [comments, setComments] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

    // Dynamic Labels based on rating
    const mealRatingLabel = useMemo(() => {
        const r = hoveredMealRating || mealRating;
        switch (r) {
            case 1: return 'Needs improvement';
            case 2: return 'Okay';
            case 3: return 'Good & Tasty';
            case 4: return 'Very delicious!';
            case 5: return 'Extraordinary!';
            default: return 'Select rating';
        }
    }, [mealRating, hoveredMealRating]);

    const packagingRatingLabel = useMemo(() => {
        const r = hoveredPackagingRating || packagingRating;
        switch (r) {
            case 1: return 'Poor / Damaged';
            case 2: return 'Basic';
            case 3: return 'Eco-friendly & Good';
            case 4: return 'Excellent & Clean';
            case 5: return 'Premium & Perfect!';
            default: return 'Select rating';
        }
    }, [packagingRating, hoveredPackagingRating]);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Validation
        if (mealRating < 1 || mealRating > 5) {
            setSubmitError("Please select a rating for the meal quality.");
            return;
        }
        if (packagingRating < 1 || packagingRating > 5) {
            setSubmitError("Please select a rating for the packaging.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const feedbackId = `order_fb_${orderId}_${Date.now()}`;

            if (db) {
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const feedbackDocRef = doc(db, 'order_feedback', feedbackId);

                const payload: any = {
                    orderId,
                    mealName,
                    mealRating,
                    packagingRating,
                    userId: user.uid,
                    userDisplayName: user.displayName || 'Valued Eater',
                    timestamp: serverTimestamp()
                };

                if (comments.trim()) {
                    payload.comments = comments.trim();
                }

                await setDoc(feedbackDocRef, payload);
            } else {
                // Local dev fallback
                await new Promise((resolve) => setTimeout(resolve, 800));
                
                try {
                    const localFeedbacks = JSON.parse(localStorage.getItem('mock_order_feedback') || '[]');
                    localFeedbacks.push({
                        id: feedbackId,
                        orderId,
                        mealName,
                        mealRating,
                        packagingRating,
                        comments: comments.trim(),
                        userId: user.uid,
                        userDisplayName: user.displayName || 'Valued Eater',
                        timestamp: new Date().toISOString()
                    });
                    localStorage.setItem('mock_order_feedback', JSON.stringify(localFeedbacks));
                } catch (e) {
                    console.warn("Storage write denied:", e);
                }
            }

            setSubmitSuccess(true);
            
            // Dispatch dynamic UI feedback
            const toastEvent = new CustomEvent('taaza:toast', {
                detail: { 
                    message: `Feedback registered for order ${orderId}! Thank you!`, 
                    type: 'success' 
                }
            });
            window.dispatchEvent(toastEvent);

            setTimeout(() => {
                onSuccess();
            }, 1500);

        } catch (err) {
            console.error("Error writing order feedback:", err);
            setSubmitError("Failed to save feedback. Please check your network connection.");
            const toastEvent = new CustomEvent('taaza:toast', {
                detail: { message: "Could not save feedback to database.", type: 'error' }
            });
            window.dispatchEvent(toastEvent);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="p-6 sm:p-8 bg-emerald-50/50 border border-emerald-100 rounded-3xl text-center flex flex-col items-center justify-center animate-pulse">
                <div className="w-12 h-12 bg-[#059669]/10 rounded-full flex items-center justify-center text-[#059669] mb-3">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-[#1A1A1A] mb-1">Feedback Submitted!</h5>
                <p className="text-xs text-zinc-500 font-light">
                    Thank you for helping us maintain 100% macro freshness in Bengaluru.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleFeedbackSubmit} className="mt-6 p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-5 animate-fade-in text-left w-full">
            <div className="flex justify-between items-center border-b border-zinc-200/60 pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                    <h5 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                        Post-Meal Review
                    </h5>
                </div>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <p className="text-[11px] text-zinc-500 font-light leading-relaxed">
                We use sustainable biodegradable eco-friendly food containers for <strong className="text-zinc-700 font-semibold">{mealName}</strong>. Let us know how we did!
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. Meal Quality Rating */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Utensils className="w-3.5 h-3.5 text-[#059669]" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Meal Quality
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((starIdx) => {
                            const active = starIdx <= (hoveredMealRating || mealRating);
                            return (
                                <button
                                    type="button"
                                    key={starIdx}
                                    onClick={() => {
                                        setMealRating(starIdx);
                                        setSubmitError(null);
                                    }}
                                    onMouseEnter={() => setHoveredMealRating(starIdx)}
                                    onMouseLeave={() => setHoveredMealRating(0)}
                                    className="focus:outline-none transform hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer"
                                    aria-label={`Rate meal ${starIdx} stars`}
                                >
                                    <Star
                                        className={`w-5 h-5 ${
                                            active 
                                                ? 'fill-[#FF7A00] text-[#FF7A00]' 
                                                : 'text-zinc-200'
                                        } transition-all`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                        mealRating > 0 || hoveredMealRating > 0 ? 'text-[#FF7A00]' : 'text-zinc-400'
                    }`}>
                        {mealRatingLabel}
                    </span>
                </div>

                {/* 2. Packaging Rating */}
                <div className="bg-white p-4 rounded-2xl border border-zinc-100 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Package className="w-3.5 h-3.5 text-[#059669]" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Packaging Quality
                        </span>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((starIdx) => {
                            const active = starIdx <= (hoveredPackagingRating || packagingRating);
                            return (
                                <button
                                    type="button"
                                    key={starIdx}
                                    onClick={() => {
                                        setPackagingRating(starIdx);
                                        setSubmitError(null);
                                    }}
                                    onMouseEnter={() => setHoveredPackagingRating(starIdx)}
                                    onMouseLeave={() => setHoveredPackagingRating(0)}
                                    className="focus:outline-none transform hover:scale-110 active:scale-90 transition-all duration-150 cursor-pointer"
                                    aria-label={`Rate packaging ${starIdx} stars`}
                                >
                                    <Star
                                        className={`w-5 h-5 ${
                                            active 
                                                ? 'fill-[#059669] text-[#059669]' 
                                                : 'text-zinc-200'
                                        } transition-all`}
                                    />
                                </button>
                            );
                        })}
                    </div>
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                        packagingRating > 0 || hoveredPackagingRating > 0 ? 'text-[#059669]' : 'text-zinc-400'
                    }`}>
                        {packagingRatingLabel}
                    </span>
                </div>
            </div>

            {/* Comments */}
            <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor={`comments-${orderId}`} className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        Chef & Delivery Notes (Optional)
                    </label>
                    <span className="text-[8px] font-mono text-zinc-400">
                        {comments.length}/1000
                    </span>
                </div>
                <div className="relative">
                    <textarea
                        id={`comments-${orderId}`}
                        value={comments}
                        onChange={(e) => setComments(e.target.value.slice(0, 1000))}
                        placeholder="Spice adjustments, packaging integrity, temperature, etc."
                        rows={2}
                        className="w-full bg-white border border-zinc-200 focus:bg-white focus:border-[#FF7A00] rounded-2xl p-3 text-xs text-[#1A1A1A] outline-none transition-all resize-none font-light leading-relaxed pr-9"
                    />
                    <div className="absolute right-3 bottom-3 text-zinc-400 pointer-events-none">
                        <MessageSquare className="w-3.5 h-3.5 opacity-40" />
                    </div>
                </div>
            </div>

            {/* Error view */}
            {submitError && (
                <div className="p-3 bg-red-50 text-red-700 text-[11px] font-medium rounded-2xl flex items-center gap-1.5 border border-red-100">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 bg-[#1A1A1A] hover:bg-[#059669] text-white rounded-full text-[10px] font-bold uppercase tracking-[0.15em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                }`}
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting...</span>
                    </>
                ) : (
                    <span>Submit Review</span>
                )}
            </button>
        </form>
    );
};
