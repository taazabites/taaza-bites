import { Scale, Leaf, Soup, Utensils } from 'lucide-react';
import React from 'react';

const NUTRITION_PILLARS = [
    {
        title: "Macronutrient Balance",
        description: "Our meals are scientifically formulated to provide the ideal ratio of proteins, healthy fats, and complex carbohydrates to fuel your day.",
        icon: Scale,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        title: "Whole Foods Focus",
        description: "We prioritize unprocessed, nutrient-dense ingredients, avoiding artificial additives, preservatives, and refined sugars.",
        icon: Leaf,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        title: "Portion Control",
        description: "Each meal is carefully portioned to help you achieve your health goals, whether it's weight loss, muscle gain, or maintenance.",
        icon: Soup,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        title: "Dietary Flexibility",
        description: "We cater to various dietary needs, offering specialized plans for Keto, High-Protein, Vegetarian, and more.",
        icon: Utensils,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
    }
];

export const NutritionApproach: React.FC = () => {
    return (
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden" id="nutrition-approach">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute top-1/2 -left-20 w-72 h-72 bg-orange-50 rounded-full blur-3xl opacity-50"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16 sm:mb-24">
                    <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Philosophy</span>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light font-serif text-gray-900 tracking-tight mb-6">
                        Food as <span className="italic text-orange-700">Medicine.</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-gray-500 font-light leading-relaxed">
                        We combine culinary artistry with clinical nutritional science to create meals that heal, nourish, and support your daily performance.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                    {NUTRITION_PILLARS.map((pillar, index) => (
                        <div key={index} className="bg-gray-50 rounded-[2.5rem] p-8 sm:p-10 border border-gray-100 hover:bg-white hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:border-orange-100 transition-all duration-500 group flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl ${pillar.bgColor} ${pillar.color} flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                <i className={`fas ${pillar.icon}`}></i>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">{pillar.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-light">{pillar.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
