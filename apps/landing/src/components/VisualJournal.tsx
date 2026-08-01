import { MobileSwipeContainer } from './MobileSwipeContainer';
import { ArrowRight, Newspaper } from 'lucide-react';
import { WHATSAPP_NUMBER, PORTAL_LINKS } from '../config';
import React from 'react';
import { LazyImage } from './LazyImage';
import { useCarousel } from '../hooks/useCarousel';

interface JournalPost {
    tag: string;
    nodeId: string;
    title: string;
    desc: string;
    img: string;
    date: string;
    readTime: string;
    impact: number;
    url: string;
}

const journalPosts: JournalPost[] = [
    {
        tag: "PREMIUM_LIVING",
        nodeId: "LOG_01",
        title: "From Farm to Plate: Our Sourcing Story",
        desc: "Meet the local farmers who grow the 100% premium produce used in every Taazabites healthy meal plan.",
        img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
        date: "04_MAR_25",
        readTime: "04_MIN",
        impact: 94,
        url: `https://wa.me/${WHATSAPP_NUMBER}`
    },
    {
        tag: "FRESH_DELIVERY",
        nodeId: "LOG_02",
        title: "The Cold-Chain Promise: Peak Freshness",
        desc: "Discover how our thermal Bio-Pods ensure your meals remain perfectly chilled from our kitchen to your door in Bengaluru.",
        img: "https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?auto=format&fit=crop&w=800&q=80",
        date: "28_FEB_25",
        readTime: "06_MIN",
        impact: 88,
        url: `https://wa.me/${WHATSAPP_NUMBER}`
    },
    {
        tag: "HEALTHY_BENEFITS",
        nodeId: "LOG_03",
        title: "Clean Eating: More Than Just a Diet",
        desc: "Exploring the long-term benefits of a high-protein, premium diet for sustained energy levels and better physical performance.",
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
        date: "22_FEB_25",
        readTime: "05_MIN",
        impact: 91,
        url: `https://wa.me/${WHATSAPP_NUMBER}`
    }
];

const ArchiveCard: React.FC<{ post: JournalPost; index: number; isActive?: boolean }> = ({ post, index, isActive = true }) => {
    return (
        <div 
            className={`group relative flex flex-col h-full bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:border-zinc-200 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] animate-on-scroll ${!isActive ? 'opacity-30 scale-95 grayscale blur-[2px]' : 'opacity-100 scale-100 grayscale-0 blur-0'}`}
            data-animation="slide-fade-in-up"
            data-stagger-delay={`${index * 0.1}s`}
        >
            <div className="px-6 py-6 sm:px-8 sm:pt-8 sm:pb-6 flex justify-between items-center border-b border-zinc-50 bg-zinc-50/30">
                <div className="flex flex-col">
                    <span className="text-[6px] sm:text-[7px] font-mono font-black text-zinc-300 uppercase tracking-[0.4em] mb-0.5">POST_REF</span>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#1A1A1A]">{post.nodeId}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#FF7A00] animate-pulse"></div>
                    <span className="text-[7px] sm:text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] font-mono">{post.date}</span>
                </div>
            </div>

            <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden bg-[#1A1A1A]">
                <LazyImage 
                    src={post.img} 
                    alt={post.title} 
                    className="w-full h-full object-cover opacity-80 transition-all duration-[8s] group-hover:scale-105 group-hover:opacity-100"
                    wrapperClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                     <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[6px] sm:text-[7px] font-black text-white uppercase tracking-[0.3em]">
                        {post.tag}
                     </span>
                </div>
            </div>

            <div className="p-6 sm:p-10 flex flex-col flex-grow">
                <h3 className="text-xl sm:text-3xl font-extrabold font-sans uppercase text-[#1A1A1A] mb-3 tracking-tight leading-tight group-hover:text-[#FF7A00] transition-colors">
                    {post.title}
                </h3>
                <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed mb-8 font-semibold line-clamp-3">
                    "{post.desc}"
                </p>
                <div className="mt-auto pt-6 border-t border-zinc-50 flex items-center justify-between">
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <span className="text-[5px] sm:text-[6px] font-black text-zinc-300 uppercase tracking-widest">POPULARITY</span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-[#1A1A1A]">{post.impact}%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[5px] sm:text-[6px] font-black text-zinc-300 uppercase tracking-widest">READ</span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-[#1A1A1A]">{post.readTime}</span>
                        </div>
                    </div>
                    <a 
                        href={PORTAL_LINKS.order}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[8px] font-black text-[#1A1A1A] uppercase tracking-[0.4em] group/btn"
                    >
                        <span>READ MORE</span>
                        <ArrowRight className="text-[7px] text-[#FF7A00] transition-transform duration-500 group-hover/btn:translate-x-1"/>
                    </a>
                </div>
            </div>
        </div>
    );
};

export const VisualJournal: React.FC = () => {
    const { scrollContainerRef, activeIndex, handlers, goToSlide } = useCarousel({ itemCount: journalPosts.length, slideInterval: 0 });

    return (
        <section className="py-20 sm:py-48 bg-[#F5F2ED] relative overflow-hidden" id="journal">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:40px_40px]"></div>
            <div className="max-w-site mx-auto px-6 relative z-10 w-full">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 sm:mb-24 gap-10">
                    <div className="animate-on-scroll">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white border border-zinc-100 text-zinc-400 text-[8px] font-black uppercase tracking-[0.4em] mb-8 shadow-sm">
                            <Newspaper className="text-[#FF7A00]"/> Healthy Living Archive
                        </div>
                        <h2 className="text-5xl sm:text-8xl lg:text-[10rem] font-extrabold font-sans uppercase text-[#1A1A1A] tracking-tighter leading-[0.85] mb-4">
                            The Fresh <br/> <span className="text-[#FF7A00] font-script normal-case tracking-normal">Journal.</span>
                        </h2>
                    </div>
                    <div className="max-w-md text-left flex flex-col gap-6 animate-on-scroll">
                        <p className="text-zinc-800 text-base sm:text-xl font-bold leading-relaxed">
                            Updates on healthy living, premium sourcing, and maximizing your physical well-being.
                        </p>
                    </div>
                </div>

                <div className="hidden lg:grid grid-cols-3 gap-12">
                    {journalPosts.map((post, i) => (
                        <ArchiveCard key={post.nodeId} post={post} index={i} />
                    ))}
                </div>

                <div className="lg:hidden w-full">
                    <MobileSwipeContainer itemCount={journalPosts.length} className="gap-5 pb-10">
                        {journalPosts.map((post, i) => (
                            <div key={post.nodeId} className="w-[82vw] flex-shrink-0 snap-center">
                                <ArchiveCard post={post} index={i} isActive={activeIndex === i} />
                            </div>
                        ))}
                    </MobileSwipeContainer>
                </div>
            </div>
        </section>
    );
};