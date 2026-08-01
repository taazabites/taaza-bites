import { Star } from 'lucide-react';
import React from 'react';
import { useCarousel } from '../hooks/useCarousel';
import { LazyImage } from './LazyImage';

const FEEDBACK_DATA = [
    {
        name: "Sarah Jenkins",
        role: "Fitness Enthusiast",
        content: "Taazabites has completely transformed my diet. The meals are not only incredibly healthy but also delicious. I've seen a noticeable difference in my energy levels.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
    },
    {
        name: "Michael Chen",
        role: "Software Engineer",
        content: "As a busy professional, I never had time to cook. Taazabites saves me hours every week, and I feel great knowing I'm eating balanced, nutritious meals.",
        rating: 5,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
    },
    {
        name: "Priya Sharma",
        role: "Working Mother",
        content: "The variety is amazing! My kids even love the healthy options. It's a lifesaver for our family dinners when we're short on time.",
        rating: 4,
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
    }
];

export const Feedback: React.FC = () => {
    const { scrollContainerRef, activeIndex, handlers } = useCarousel({ itemCount: FEEDBACK_DATA.length, slideInterval: 5000 });

    return (
        <section className="py-24 sm:py-32 bg-white overflow-hidden" id="feedback">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 sm:mb-24">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                        What Our Customers Say
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
                        Don't just take our word for it. Hear from those who have experienced the Taazabites difference.
                    </p>
                </div>

                <div className="relative overflow-hidden w-full">
                    <div ref={scrollContainerRef} {...handlers} className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-12 gap-6 scroll-smooth">
                        {FEEDBACK_DATA.map((feedback, index) => (
                            <div key={index} className="w-[85vw] md:w-[60vw] lg:w-[40vw] flex-shrink-0 snap-center">
                                <div className={`bg-white rounded-3xl p-8 sm:p-12 shadow-lg border transition-all duration-300 h-full flex flex-col ${index === activeIndex ? 'border-orange-200 scale-100' : 'border-gray-100 opacity-60 scale-95'}`}>
                                    <div className="flex items-center gap-2 mb-6 text-orange-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 fill-current ${i < feedback.rating ? '' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-700 text-lg leading-relaxed mb-8 flex-grow italic">
                                        "{feedback.content}"
                                    </p>
                                    <div className="flex items-center gap-4 mt-auto">
                                        <LazyImage src={feedback.image} alt={feedback.name} className="w-14 h-14 rounded-full object-cover border-2 border-orange-100" wrapperClassName="w-14 h-14 rounded-full overflow-hidden" />
                                        <div>
                                            <h4 className="font-bold text-gray-900">{feedback.name}</h4>
                                            <p className="text-sm text-gray-500">{feedback.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    <div className="flex justify-center gap-3 mt-8">
                        {FEEDBACK_DATA.map((_, idx) => (
                            <button
                                key={idx}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    idx === activeIndex ? 'bg-orange-600 w-8' : 'bg-gray-300 hover:bg-orange-400'
                                }`}
                                onClick={() => {
                                    if (scrollContainerRef.current) {
                                        const scrollWidth = scrollContainerRef.current.scrollWidth;
                                        const itemWidth = scrollWidth / FEEDBACK_DATA.length;
                                        scrollContainerRef.current.scrollTo({
                                            left: itemWidth * idx,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
