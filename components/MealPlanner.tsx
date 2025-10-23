import React, { useState } from 'react';
import { generateMealPlan } from '../services/geminiService';

interface Meal {
    type: 'Breakfast' | 'Lunch' | 'Dinner';
    name: string;
    reason: string;
}

const MealPlanSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/5 p-5 rounded-lg flex items-start gap-4">
                <div className="bg-white/10 w-12 h-12 rounded-full flex-shrink-0"></div>
                <div className="flex-grow">
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-full"></div>
                </div>
            </div>
        ))}
    </div>
);


export const MealPlanner: React.FC = () => {
    const [plan, setPlan] = useState<Meal[] | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setPlan(null);
        setSummary(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            dietaryPreference: formData.get('dietaryPreference') as string,
            healthGoal: formData.get('healthGoal') as string,
            dislikes: formData.get('dislikes') as string,
            nutritionalGoals: formData.get('nutritionalGoals') as string,
        };

        try {
            const resultText = await generateMealPlan(data.dietaryPreference, data.healthGoal, data.dislikes, data.nutritionalGoals);
            const lines = resultText.split('\n');
            const parsedPlan: Meal[] = [];
            let parsedSummary: string | null = null;

            lines.forEach(line => {
                const mealParts = line.match(/\[(BREAKFAST|LUNCH|DINNER)\]\|(.*?)\|(.*)/i);
                const summaryParts = line.match(/\[SUMMARY\]\|(.*)/i);

                if (mealParts && mealParts.length === 4) {
                    parsedPlan.push({
                        type: mealParts[1].charAt(0).toUpperCase() + mealParts[1].slice(1).toLowerCase() as Meal['type'],
                        name: mealParts[2].trim(),
                        reason: mealParts[3].trim()
                    });
                } else if (summaryParts && summaryParts.length === 2) {
                    parsedSummary = summaryParts[1].trim();
                }
            });
            
            if (parsedPlan.length === 0) throw new Error("AI response was not in the expected format.");

            setPlan(parsedPlan);
            setSummary(parsedSummary);
        } catch (err: any) {
            setError(err.message || 'An error occurred while generating the plan.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const mealIcons = { Breakfast: 'fa-coffee', Lunch: 'fa-sun', Dinner: 'fa-moon' };

    return (
        <section id="meal-planner" className="py-20 md:py-28 bg-gradient-to-br from-slate-800 via-zinc-800 to-black text-white">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 animate-on-scroll" data-animation="scale-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold font-iowan inline-block relative pb-2">
                            Personalized AI Meal Planner ✨
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
                        </h2>
                        <p className="mt-4 text-white/80">Let our AI nutritionist craft a perfect 1-day meal plan from our menu!</p>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 form-glow">
                        <div>
                            <label htmlFor="dietaryPreference" className="block text-sm font-semibold mb-1">Dietary Preference</label>
                            <select id="dietaryPreference" name="dietaryPreference" className="w-full bg-white/10 p-3 rounded-lg border border-white/20 outline-none appearance-none bg-no-repeat bg-right-4 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF80%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] [background-size:0.8em]">
                                <option>Any</option><option>Vegetarian</option><option>High-Protein</option><option>Keto</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="healthGoal" className="block text-sm font-semibold mb-1">Health Goal</label>
                            <select id="healthGoal" name="healthGoal" className="w-full bg-white/10 p-3 rounded-lg border border-white/20 outline-none appearance-none bg-no-repeat bg-right-4 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF80%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] [background-size:0.8em]">
                                <option>Weight Loss</option><option>Muscle Gain</option><option>Maintain Health</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="nutritionalGoals" className="block text-sm font-semibold mb-1">Nutritional Goals (optional)</label>
                            <input type="text" id="nutritionalGoals" name="nutritionalGoals" placeholder="e.g., low-carb, high-fiber, low-sodium" className="w-full bg-white/10 p-3 rounded-lg border border-white/20 outline-none placeholder:text-white/50" />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="dislikes" className="block text-sm font-semibold mb-1">Dislikes or Allergies (optional)</label>
                             <input type="text" id="dislikes" name="dislikes" placeholder="e.g., mushrooms, nuts" className="w-full bg-white/10 p-3 rounded-lg border border-white/20 outline-none placeholder:text-white/50" />
                        </div>
                        <button type="submit" disabled={isLoading} className="md:col-span-2 bg-[var(--accent)] text-gray-800 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 shadow-lg shadow-yellow-500/20 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 ripple-effect">
                            {isLoading ? <div className="meal-plan-loader"></div> : '✨ Generate My Plan'}
                        </button>
                    </form>

                    <div id="mealPlanResult" className="space-y-4">
                        {isLoading && <MealPlanSkeleton />}
                        {error && <p className="text-center text-red-400 bg-red-500/20 p-3 rounded-lg">{error}</p>}
                        {!isLoading && !plan && !error && (
                            <div className="text-center text-white/60 border-2 border-dashed border-white/30 p-8 rounded-lg">
                                Your personalized meal plan will appear here...
                            </div>
                        )}
                        {plan && (
                            <div className="space-y-4">
                                {plan.map((meal, index) => (
                                    <div key={meal.type} className="bg-white/10 p-5 rounded-lg flex items-start gap-4 animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay={`${index * 100}ms`}>
                                        <div className="bg-white/10 w-12 h-12 rounded-full flex items-center justify-center text-xl text-[var(--accent)] flex-shrink-0">
                                            <i className={`fas ${mealIcons[meal.type]}`}></i>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{meal.name}</h4>
                                            <p className="text-sm text-white/80">{meal.reason}</p>
                                        </div>
                                    </div>
                                ))}
                                {summary && (
                                     <blockquote className="animate-on-scroll bg-white/5 border-l-4 border-[var(--accent)] p-4 rounded-r-lg" data-animation="slide-fade-in-up" data-stagger-delay={`${plan.length * 100}ms`} style={{ animationDelay: `${plan.length * 100}ms` }}>
                                        <p className="text-white/90 italic">"{summary}"</p>
                                    </blockquote>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};