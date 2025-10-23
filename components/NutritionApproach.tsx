import React from 'react';

const PillarCard = ({ icon, title, text, staggerDelay }: { icon: string; title: string; text: string; staggerDelay: string; }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-5 animate-on-scroll`} data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary-light)] to-white text-[var(--primary-dark)] text-2xl flex items-center justify-center border border-zinc-200/80">
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <h3 className="text-xl font-bold font-iowan text-[var(--primary-dark)] mb-1">{title}</h3>
            <p className="text-zinc-600 text-base">{text}</p>
        </div>
    </div>
);


export const NutritionApproach: React.FC = () => {
    const imageUrlBase = "https://cdn.urbanpiper.com/media/bizmedia/2025/10/15/WT8cK1-62d3e3a9-d9c9-44bc-b500-6573f43c2298.jpg";

    return (
        <section id="nutrition-approach" className="py-20 md:py-28 bg-[var(--section-bg-light-green)] overflow-hidden relative">
             <div className="section-divider">
                <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="shape-fill"></path>
                </svg>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-on-scroll" data-animation="slide-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold font-iowan text-[var(--primary-dark)] inline-block relative pb-2">
                        Our Nutrition-First Approach
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
                    </h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image Column with Decorative Elements */}
                    <div className="relative flex justify-center items-center animate-on-scroll" data-animation="scale-up">
                         {/* Decorative Background */}
                        <div className="absolute w-[90%] h-[90%] bg-gradient-to-br from-green-100 to-lime-100/50 rounded-3xl transform -rotate-6"></div>
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[4/5] w-full max-w-md image-container">
                            <img 
                                src={`${imageUrlBase}?format=webp&w=800&q=80`}
                                srcSet={`${imageUrlBase}?format=webp&w=400&q=80 400w, ${imageUrlBase}?format=webp&w=800&q=80 800w, ${imageUrlBase}?format=webp&w=1200&q=80 1200w`}
                                sizes="(max-width: 640px) 100vw, (max-width: 1023px) 80vw, 450px"
                                alt="A delicious and healthy Taazabites meal in a bowl"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                                loading="lazy"
                                onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                            />
                        </div>
                    </div>

                     {/* Text & Pillars Column */}
                    <div className="flex flex-col gap-8">
                        <PillarCard 
                            staggerDelay="0.1s"
                            icon="fa-microscope"
                            title="Science-Backed Macros"
                            text="Every meal is meticulously calculated by our nutritionists to provide the optimal balance of protein, carbs, and healthy fats for your specific health goals."
                        />
                        <PillarCard 
                            staggerDelay="0.2s"
                            icon="fa-seedling"
                            title="Peak Freshness & Quality"
                            text="We partner with local farms to source the freshest, seasonal ingredients, ensuring maximum flavor and nutrient density in every bite you take."
                        />
                         <PillarCard 
                            staggerDelay="0.3s"
                            icon="fa-utensils"
                            title="Uncompromised Flavor"
                            text="Our expert chefs believe healthy eating should be a delicious experience. We use culinary techniques that enhance natural flavors without sacrificing nutrition."
                        />
                        
                        {/* New CTA Block */}
                        <div className="mt-4 bg-gradient-to-tr from-[var(--primary-dark)] to-[var(--primary)] text-white p-8 rounded-2xl shadow-lg text-center animate-on-scroll" data-animation="slide-fade-in-up" data-stagger-delay="0.4s">
                            <p className="text-white/90 mb-4 text-lg font-semibold">Ready to experience the Taazabites difference?</p>
                            <a 
                                href="https://taazabites.in/menu" 
                                className="inline-flex items-center justify-center gap-2 bg-[var(--accent-secondary)] text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-black/20 hover:scale-105 hover:bg-[#F84D15] hover:shadow-xl transition-all duration-300 text-lg ripple-effect"
                            >
                                <i className="fas fa-shopping-cart"></i> Explore The Menu
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};