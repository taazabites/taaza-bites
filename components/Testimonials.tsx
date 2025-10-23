import React, { useState, useEffect, useRef, useCallback } from 'react';

const TestimonialCard = ({ quote, author, title, avatar, staggerDelay }: { quote: string; author:string; title: string; avatar: string; staggerDelay?: string; }) => (
    <div className={`bg-white p-8 rounded-2xl shadow-lg h-full flex flex-col transition-all duration-300 lg:hover:shadow-2xl lg:hover:-translate-y-2 animate-on-scroll border border-zinc-200/50`} data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
        <div className="flex-grow flex flex-col">
            <blockquote className="flex-grow">
                 <i className="fas fa-quote-left text-3xl text-[var(--primary)]/20"></i>
                <p className="text-zinc-700 font-iowan text-lg italic my-4">"{quote}"</p>
            </blockquote>
            <figcaption className="mt-auto pt-4 border-t border-zinc-200/70">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary-light)] to-green-50 text-[var(--primary-dark)] font-bold flex items-center justify-center text-2xl shrink-0 border-2 border-white shadow-md">
                            {avatar}
                        </div>
                        <div>
                            <cite className="font-bold text-[var(--primary-dark)] not-italic">{author}</cite>
                            <p className="text-sm text-zinc-500">{title}</p>
                        </div>
                    </div>
                     <div className="text-yellow-400 text-sm flex items-center gap-0.5" aria-label="5 out of 5 stars rating">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                    </div>
                </div>
            </figcaption>
        </div>
    </div>
);

export const Testimonials: React.FC = () => {
    const testimonials = [
        { quote: "Taazabites has completely transformed my relationship with food. Getting the right macros used to be a chore. Now I enjoy delicious meals that support my goals.", author: "Ravi Sharma", title: "Fitness Coach", avatar: "R" },
        { quote: "The convenience of having nutritious, chef-prepared meals delivered has been a game-changer for my busy schedule. I've never eaten so well with so little effort!", author: "Sunita Rao", title: "Software Engineer", avatar: "S" },
        { quote: "I appreciate how Taazabites accommodates my dietary needs without compromising on taste. Their vegetarian options are exceptional!", author: "Anika Khanna", title: "Marketing Director", avatar: "A" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);

    useEffect(() => {
        // Autoplay for mobile carousel
        if (window.innerWidth < 1024) {
            resetTimeout();
            timeoutRef.current = setTimeout(
                () => setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1)),
                5000 // Change slide every 5 seconds
            );
        }
        return () => {
            resetTimeout();
        };
    }, [currentIndex, testimonials.length, resetTimeout]);

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    return (
        <section id="testimonials" className="py-20 md:py-28 bg-gradient-to-b from-white to-[var(--section-bg-light-green)]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12 animate-on-scroll" data-animation="slide-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold font-iowan text-[var(--primary-dark)] inline-block relative pb-2">
                        What Our Customers Say
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-[var(--accent)]"></span>
                    </h2>
                </div>

                {/* Mobile Carousel */}
                <div className="relative lg:hidden animate-on-scroll" data-animation="slide-fade-in-up">
                    <div className="overflow-hidden">
                        <div 
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((t, i) => (
                                <div key={i} className="w-full flex-shrink-0 px-2 py-2">
                                    <TestimonialCard {...t} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-center gap-3 mt-8">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === i ? 'bg-[var(--primary)] scale-125' : 'bg-zinc-300 hover:bg-zinc-400'}`}
                                aria-label={`Go to testimonial ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
                    {testimonials.map((t, i) => (
                        <TestimonialCard key={i} {...t} staggerDelay={`${(i + 1) * 0.1}s`} />
                    ))}
                </div>
            </div>
        </section>
    );
};