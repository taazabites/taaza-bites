import { Lightbulb } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const TIPS = [
    "Hydration is key! Drinking water before meals can aid digestion and prevent overeating.",
    "Protein at every meal helps maintain muscle mass and keeps you feeling full longer.",
    "Don't fear healthy fats! Avocados, nuts, and olive oil are essential for brain health.",
    "Eating a rainbow of vegetables ensures you get a wide spectrum of vitamins and minerals.",
    "Chew your food thoroughly. Digestion begins in the mouth, not just the stomach.",
    "Sleep is nutrition too. Lack of sleep can increase cravings for sugary, high-calorie foods."
];

export const NutritionTips: React.FC = () => {
    const [currentTip, setCurrentTip] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentTip((prev) => (prev + 1) % TIPS.length);
                setIsVisible(true);
            }, 500); // Wait for fade out
        }, 8000); // Change tip every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-[#FF7A00] text-white py-1.5 sm:py-2 px-2 sm:px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-medium">
                <Lightbulb className="text-[#FFD700] animate-pulse shrink-0"/>
                <div className="relative h-4 sm:h-5 flex-1 max-w-2xl overflow-hidden flex items-center justify-center">
                    <p 
                        className={`absolute w-full text-center transition-all duration-500 transform line-clamp-1 ${
                            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                        }`}
                    >
                        <span className="font-bold mr-1 sm:mr-2 hidden sm:inline">Daily Tip:</span>
                        {TIPS[currentTip]}
                    </p>
                </div>
            </div>
        </div>
    );
};
