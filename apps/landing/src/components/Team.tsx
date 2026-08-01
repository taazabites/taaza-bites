import { Briefcase, Camera, ArrowRight } from 'lucide-react';

import React from 'react';
import { LazyImage } from './LazyImage';
import { useCarousel } from '../hooks/useCarousel';

interface TeamMemberProps {
    name: string;
    role: string;
    image: string;
    bio: string;
    specialty: string;
    staggerDelay: string;
}

const TeamMemberCard: React.FC<TeamMemberProps> = ({ name, role, image, bio, specialty, staggerDelay }) => {
    // Generate clean base URL for high quality srcset with modern WebP format
    const baseUrl = image.split('?')[0];
    const srcSet = `${baseUrl}?auto=format&fit=crop&w=400&q=80&fm=webp 400w, ${baseUrl}?auto=format&fit=crop&w=600&q=80&fm=webp 600w, ${baseUrl}?auto=format&fit=crop&w=800&q=80&fm=webp 800w, ${baseUrl}?auto=format&fit=crop&w=1200&q=80&fm=webp 1200w, ${baseUrl}?auto=format&fit=crop&w=1600&q=80&fm=webp 1600w`;

    return (
        <div className="group bg-white rounded-[2rem] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-zinc-100 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-2 transition-all duration-500 animate-on-scroll flex flex-col h-full relative" data-animation="slide-fade-in-up" data-stagger-delay={staggerDelay}>
            <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
                <LazyImage
                    src={`${baseUrl}?auto=format&fit=crop&w=800&q=80&fm=webp`}
                    srcSet={srcSet}
                    alt={`${name}, ${role} at Taazabites`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    wrapperClassName="w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                />
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                
                <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="inline-block px-3 py-1 bg-[var(--primary)] text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-3 shadow-lg ring-1 ring-white/20">
                        {role}
                    </span>
                    <h3 className="text-2xl font-light font-serif mb-1 drop-shadow-md">{name}</h3>
                    <p className="text-white/80 text-sm font-medium">{specialty}</p>
                </div>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between bg-white relative z-10">
                <p className="text-zinc-600 text-sm leading-relaxed mb-4 font-light">
                    {bio}
                </p>
                <div className="flex gap-3 pt-4 border-t border-zinc-50">
                    {/* Social placeholders with improved styling */}
                    <button className="w-11 h-11 rounded-full bg-zinc-50 text-zinc-400 hover:bg-[#0077b5] hover:text-white transition-all flex items-center justify-center text-sm shadow-sm hover:shadow-md" aria-label={`View ${name}'s LinkedIn`}>
                        <Briefcase />
                    </button>
                     <button className="w-11 h-11 rounded-full bg-zinc-50 text-zinc-400 hover:bg-[#E4405F] hover:text-white transition-all flex items-center justify-center text-sm shadow-sm hover:shadow-md" aria-label={`View ${name}'s Instagram`}>
                        <Camera />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Team: React.FC = () => {
    const members = [
        {
            name: "Chef Manju",
            role: "Executive Chef",
            image: "https://images.unsplash.com/photo-1577106263724-2c8e03bfe9f4",
            specialty: "Modern Indian Cuisine",
            bio: "With over 15 years in 5-star kitchens, Chef Manju brings a passion for transforming traditional flavors into healthy, modern masterpieces."
        },
        {
            name: "Sarah Fernandes",
            role: "Lead Nutritionist",
            image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f",
            specialty: "Clinical Nutrition & Keto",
            bio: "Sarah ensures every meal is a powerhouse of nutrients. She specializes in crafting diets that fuel high-performance lifestyles."
        },
        {
            name: "Chef Vikram Singh",
            role: "Sous Chef",
            image: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c",
            specialty: "Continental & Fusion",
            bio: "Vikram is the creative force behind our continental bowls. He believes healthy food should be vibrant, colorful, and exciting."
        },
        {
            name: "Dr. Anjali Rao",
            role: "Wellness Advisor",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
            specialty: "Holistic Health",
            bio: "Dr. Anjali guides our holistic approach, ensuring our plans support not just physical health, but mental clarity and overall well-being."
        }
    ];

    const { 
        scrollContainerRef, 
        activeIndex, 
        goToSlide, 
        handlers 
    } = useCarousel({ itemCount: members.length, slideInterval: 4000 });

    return (
        <section className="py-20 sm:py-28 bg-zinc-50/50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-[var(--primary)]/5 skew-x-12 pointer-events-none"></div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 animate-on-scroll" data-animation="slide-fade-in-up">
                    <span className="text-[var(--primary)] font-bold tracking-widest text-xs uppercase bg-white px-4 py-2 rounded-full mb-4 inline-block shadow-sm border border-zinc-100">
                        The Experts Behind the Flavor
                    </span>
                    <h2 className="text-3xl md:text-5xl font-light font-serif text-[#1A1A1A] mb-6 tracking-tight">
                        Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)]">Culinary Artists</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-zinc-500 font-light leading-relaxed">
                        Our team combines the art of gastronomy with the science of nutrition to bring you the best of both worlds.
                    </p>
                </div>

                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {members.map((member, index) => (
                        <TeamMemberCard 
                            key={index}
                            {...member}
                            staggerDelay={`${index * 0.15}s`}
                        />
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden relative overflow-hidden w-full">
                    <div 
                        ref={scrollContainerRef} 
                        {...handlers}
                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-8 gap-4"
                    >
                        {members.map((member, index) => (
                            <div 
                                key={index} 
                                className="w-[85vw] max-w-[320px] flex-shrink-0 snap-center"
                            >
                                <TeamMemberCard 
                                    {...member}
                                    staggerDelay="0s"
                                />
                            </div>
                        ))}
                        <div className="w-2 flex-shrink-0"></div>
                    </div>

                    <div className="flex justify-center gap-2 -mt-2">
                        {members.map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => goToSlide(i)} 
                                className={`transition-all duration-300 rounded-full h-1.5 ${activeIndex === i ? 'w-6 bg-[var(--primary)]' : 'w-1.5 bg-zinc-300'}`}
                                aria-label={`View team member ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
                
                <div className="mt-16 text-center animate-on-scroll" data-animation="fade-in">
                    <p className="text-zinc-400 italic font-medium">
                        "We cook with our hearts, so you can eat with your mind at ease."
                    </p>
                    <div className="mt-6">
                        <a href="/about" onClick={(e) => { e.preventDefault(); window.history.pushState(null, '', '/about'); window.dispatchEvent(new Event('popstate')); }} className="inline-flex items-center gap-2 text-[var(--primary)] font-bold border-b-2 border-[var(--primary)]/20 hover:border-[var(--primary)] transition-all pb-1 hover:-translate-y-0.5">
                            Read Our Full Story <ArrowRight className="text-xs"/>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};
