import { MobileSwipeContainer } from './MobileSwipeContainer';
import { Star, Quote, ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../config';
import React from 'react';
import { useCarousel } from '../hooks/useCarousel';
import { LazyImage } from './LazyImage';
import { motion } from 'motion/react';

interface TestimonialCardProps {
    quote: string;
    author: string;
    title: string;
    initial: string;
    date: string;
    source: string;
    isActive?: boolean;
    isGrid?: boolean;
    avatarUrl?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = React.memo(({ quote, author, title, initial, date, source, isActive, isGrid, avatarUrl }) => (
    <figure className={`relative p-8 sm:p-10 rounded-[2.5rem] border transition-all duration-700 flex flex-col h-full group ${isGrid ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : isActive ? 'bg-white/10 border-white/20 shadow-2xl scale-100' : 'bg-white/5 border-white/5 scale-95 opacity-30 blur-[1px]'} backdrop-blur-md`}>
        {/* Verified Badge */}
        <div className="absolute top-8 right-8 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-bold text-white/60 uppercase tracking-[0.2em]">
            <div className="w-1 h-1 rounded-full bg-[#059669] animate-pulse"></div>
            Verified
        </div>

        <div className="flex-grow">
            <div className="flex text-[#F59E0B] text-[10px] mb-6 gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} />
                ))}
            </div>
            <blockquote className="mb-8">
                <p className="text-white font-script text-2xl sm:text-3xl leading-relaxed opacity-95 tracking-wide">
                    "{quote}"
                </p>
            </blockquote>
        </div>

        <figcaption className="mt-auto pt-6 border-t border-white/10 flex items-center gap-4">
            {avatarUrl ? (
                <LazyImage 
                    src={avatarUrl} 
                    alt={author} 
                    theme="dark"
                    className="w-full h-full object-cover" 
                    wrapperClassName="w-12 h-12 rounded-full border border-white/20 shrink-0 overflow-hidden bg-zinc-800" 
                />
            ) : (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#059669] text-white flex items-center justify-center font-bold text-xl border border-white/20 shrink-0">
                    {initial}
                </div>
            )}
            <div className="min-w-0">
                <cite className="font-medium text-white not-italic block text-sm mb-0.5">{author}</cite>
                <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold uppercase tracking-widest">
                    <span>{title}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>{date}</span>
                </div>
            </div>
        </figcaption>
    </figure>
));

export const Testimonials: React.FC = () => {
    const testimonials = [
        { 
            quote: "Food is really good and fresh. Neatly packed. Very healthy options and the taste is surprisingly great for a healthy meal.", 
            author: "Rahul M. · Koramangala", 
            title: "✓ Verified Swiggy order", 
            initial: "R", 
            date: "2 days ago", 
            source: "Swiggy",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        },
        { 
            quote: "I've tried many meal prep services in HSR, but Taazabites is the most consistent. The keto bowls are highly recommended.", 
            author: "Sneha V. · HSR Layout", 
            title: "✓ Verified Google review", 
            initial: "S", 
            date: "1 week ago", 
            source: "Google",
            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
        },
        { 
            quote: "Good portion sizes and on-time delivery every single day. The paneer dishes are my absolute favorite.", 
            author: "Amit K. · Bellandur", 
            title: "✓ Verified Zomato order", 
            initial: "A", 
            date: "3 days ago", 
            source: "Zomato",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"
        },
        { 
            quote: "Finally a place that doesn't use seed oils! You can literally feel the difference in energy levels after a week.", 
            author: "Deepak S. · Indiranagar", 
            title: "✓ Verified Google review", 
            initial: "D", 
            date: "Yesterday", 
            source: "Google",
            avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"
        },
        { 
            quote: "Very healthy and hygienic. Ordering from here almost every day for lunch at office. Keep it up!", 
            author: "Pooja N. · Whitefield", 
            title: "✓ Verified Swiggy order", 
            initial: "P", 
            date: "5 days ago", 
            source: "Swiggy",
            avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
        },
        { 
            quote: "Worth the subscription. Saves me 2 hours of cooking daily and I'm actually hitting my protein goals now.", 
            author: "Karthik R. · Jayanagar", 
            title: "✓ Verified Google review", 
            initial: "K", 
            date: "2 weeks ago", 
            source: "Google",
            avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"
        },
    ];

    const { 
        scrollContainerRef, 
        activeIndex, 
        goToSlide, 
        goToNext,
        goToPrevious,
        handlers 
    } = useCarousel({ itemCount: testimonials.length, slideInterval: 5000 });

    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden" id="testimonials">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-[#059669]/10 rounded-full blur-[160px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#FF7A00]/5 rounded-full blur-[140px] translate-y-1/2"></div>
                <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            </div>

            <div className="max-w-site mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-24 sm:mb-32 gap-12">
                    <div className="animate-on-scroll">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[8px] font-black uppercase tracking-[0.4em] mb-8">
                            <Star className="text-[#F59E0B]"/> Verified Success Stories
                        </div>
                        <h2 className="text-5xl sm:text-8xl lg:text-[8.5rem] font-extrabold font-sans text-white tracking-tighter leading-[0.85] uppercase">
                            The Wall of <br/> <span className="text-[#059669] font-script normal-case tracking-normal">Vitality.</span>
                        </h2>
                    </div>
                    <div className="max-w-md text-left lg:text-right flex flex-col gap-8 animate-on-scroll">
                        <p className="text-white/50 text-base sm:text-xl font-light leading-relaxed">
                            Join thousands of high-performers in Bengaluru who have engineered their nutrition with Taazabites.
                        </p>
                        <div className="flex flex-col sm:flex-row lg:justify-end items-start sm:items-center gap-8 sm:gap-12">
                            <div className="flex flex-col items-start lg:items-end">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-4xl sm:text-6xl font-serif text-white">4.8</span>
                                    <div className="flex flex-col">
                                        <div className="flex text-[#F59E0B] text-[8px] gap-0.5">
                                            {[...Array(5)].map((_, i) => <Star key={i} />)}
                                        </div>
                                        <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">524 REVIEWS</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-[#059669] uppercase tracking-[0.3em]">Top Rated in Bengaluru</span>
                            </div>
                            
                            <div className="hidden sm:block w-px h-16 bg-white/10"></div>
                            
                            <div className="flex flex-col items-start lg:items-end gap-2">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3">
                                        {testimonials.slice(0, 3).map((t, i) => (
                                            <LazyImage 
                                                key={i}
                                                src={t.avatarUrl}
                                                alt={t.author}
                                                theme="dark"
                                                className="w-full h-full object-cover"
                                                wrapperClassName="w-8 h-8 rounded-full border-2 border-[#0A0A0A] shrink-0 overflow-hidden"
                                            />
                                        ))}
                                    </div>
                                    <span className="text-2xl font-serif text-white">98%</span>
                                </div>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">RECOMMENDATION RATE</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Editorial Review */}
                <div className="mb-32 animate-on-scroll">
                    <div className="relative p-12 sm:p-24 rounded-[4rem] bg-white/5 border border-white/10 overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#059669]/10 rounded-full -mr-48 -mt-48 blur-[100px] transition-transform duration-1000 group-hover:scale-110"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 sm:gap-24">
                            <LazyImage 
                                src="https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300"
                                alt="Dr. Anjali Verma"
                                theme="dark"
                                className="w-full h-full object-cover"
                                wrapperClassName="w-48 h-48 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 border-white/10 shrink-0 bg-zinc-800"
                            />
                            <div className="flex-grow">
                                <Quote className="text-4xl sm:text-6xl text-[#059669]/30 mb-8 block"/>
                                <blockquote className="text-2xl sm:text-4xl font-script text-white leading-[1.2] mb-12 tracking-wide font-normal">
                                    "Taazabites is not just a meal service; it's a nutrition upgrade. My productivity and energy levels have never been higher. It's the perfect plan for my diet."
                                </blockquote>
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-px bg-[#059669]"></div>
                                    <div>
                                        <cite className="font-sans font-bold text-xl sm:text-2xl text-white not-italic block mb-1">Dr. Anjali Verma</cite>
                                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Clinical Nutritionist • 6 Months Subscriber</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-3 gap-8 mb-32">
                    {testimonials.map((t, i) => (
                        <div key={`grid-${i}`} className="animate-on-scroll" data-stagger-delay={`${i * 0.1}s`}>
                            <TestimonialCard {...t} isGrid />
                        </div>
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden w-full mb-20">
                    <MobileSwipeContainer itemCount={testimonials.length} className="gap-5 pb-12" theme="dark">
                        {testimonials.map((t, i) => (
                            <div key={`carousel-${i}`} className="w-[85vw] flex-shrink-0 snap-center">
                                <TestimonialCard {...t} isActive={activeIndex === i} />
                            </div>
                        ))}
                    </MobileSwipeContainer>
                </div>

                {/* CTA */}
                <div className="max-w-4xl mx-auto text-center animate-on-scroll">
                    <div className="p-12 sm:p-20 rounded-[3rem] bg-white/5 border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#059669]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className="relative z-10">
                            <h3 className="text-3xl sm:text-5xl font-sans font-extrabold text-white mb-6 uppercase tracking-tight">Share Your Journey</h3>
                            <p className="text-white/40 text-sm sm:text-lg font-light mb-12 max-w-md mx-auto">
                                Your feedback helps us engineer better nutrition for everyone in Bengaluru.
                            </p>
                            <a 
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-[#059669] hover:text-white transition-all duration-500 group/btn"
                            >
                                <MessageCircle className="text-lg"/>
                                <span>Leave a Review</span>
                                <ArrowRight className="text-[8px] transition-transform group-hover/btn:translate-x-1"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testimonials;