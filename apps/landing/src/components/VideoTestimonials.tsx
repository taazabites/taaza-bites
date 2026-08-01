import { Circle, X } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LazyImage } from './LazyImage';
import { useCarousel } from '../hooks/useCarousel';
import { MobileSwipeContainer } from './MobileSwipeContainer';

interface VideoReview {
    id: string;
    thumbnail: string;
    videoUrl: string;
    name: string;
    role: string;
    duration: string;
}

const videoReviews: VideoReview[] = [
    {
        id: 'v1',
        thumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        videoUrl: '#',
        name: 'Sarah Johnson',
        role: 'Marathon Runner',
        duration: '0:45'
    },
    {
        id: 'v2',
        thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        videoUrl: '#',
        name: 'Michael Chen',
        role: 'Tech Lead',
        duration: '1:12'
    },
    {
        id: 'v3',
        thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        name: 'Emily Davis',
        role: 'Yoga Instructor',
        videoUrl: '#',
        duration: '0:58'
    }
];

export const VideoTestimonials: React.FC = () => {
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const { scrollContainerRef, activeIndex, goToSlide, handlers } = useCarousel({
        itemCount: videoReviews.length,
        slideInterval: 0
    });

    return (
        <section className="py-24 sm:py-32 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div className="animate-on-scroll">
                        <span className="text-[#059669] text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Visual Proof</span>
                        <h2 className="text-4xl sm:text-6xl font-extrabold font-sans text-[#1A1A1A] tracking-tight uppercase">
                            Real Stories. <br/> <span className="text-[#FF7A00] font-script normal-case tracking-normal text-5xl sm:text-7xl">Real Results.</span>
                        </h2>
                    </div>
                    <p className="max-w-md text-gray-500 font-light leading-relaxed animate-on-scroll">
                        Watch how Taazabites is helping people across Bengaluru achieve their health and fitness goals through premium nutrition.
                    </p>
                </div>

                {/* Desktop View (screens starting from sm) */}
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
                    {videoReviews.map((video, i) => (
                        <motion.div 
                            key={video.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative aspect-[9/16] rounded-[2.5rem] overflow-hidden bg-zinc-100 shadow-xl cursor-pointer"
                            onClick={() => setActiveVideo(video.id)}
                        >
                            <LazyImage 
                                src={video.thumbnail} 
                                alt={video.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                wrapperClassName="w-full h-full absolute inset-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                            
                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-[#FF7A00] group-hover:border-[#FF7A00]">
                                    <Circle className="text-white text-xl translate-x-0.5"/>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="absolute bottom-8 left-8 right-8">
                                <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest mb-1 block">{video.duration} VIDEO STORY</span>
                                <h3 className="text-white text-xl font-medium mb-1">{video.name}</h3>
                                <p className="text-white/70 text-xs font-light">{video.role}</p>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-[#059669]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile View: Slide Carousel (screens under sm) */}
                <div className="sm:hidden relative w-full">
                    <MobileSwipeContainer itemCount={videoReviews.length} className="gap-5">
                        {videoReviews.map((video) => (
                            <div key={video.id} className="w-[80vw] flex-shrink-0 snap-center">
                                <div 
                                    className="group relative aspect-[9/16] rounded-[2.5rem] overflow-hidden bg-zinc-100 shadow-xl cursor-pointer"
                                    onClick={() => setActiveVideo(video.id)}
                                >
                                    <LazyImage 
                                        src={video.thumbnail} 
                                        alt={video.name}
                                        className="w-full h-full object-cover transition-transform duration-700"
                                        wrapperClassName="w-full h-full absolute inset-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
                                    
                                    {/* Play Button */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center transition-all duration-500">
                                            <Circle className="text-white text-xl translate-x-0.5"/>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="absolute bottom-8 left-8 right-8 text-left">
                                        <span className="text-white/60 text-[8px] font-bold uppercase tracking-widest mb-1 block">{video.duration} VIDEO STORY</span>
                                        <h3 className="text-white text-xl font-medium mb-1">{video.name}</h3>
                                        <p className="text-white/70 text-xs font-light">{video.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </MobileSwipeContainer>
                </div>
            </div>

            {/* Video Modal Placeholder */}
            <AnimatePresence>
                {activeVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setActiveVideo(null)}
                    >
                        <button className="absolute top-8 right-8 text-white text-2xl hover:text-[#FF7A00] transition-colors">
                            <X />
                        </button>
                        <div className="w-full max-w-lg aspect-[9/16] bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                <Circle className="text-white/20 text-6xl mb-6"/>
                                <h3 className="text-white text-2xl font-serif mb-4">Video Loading...</h3>
                                <p className="text-white/50 text-sm font-light">This is a placeholder for the video testimonial player.</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};
