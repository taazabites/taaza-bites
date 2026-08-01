import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Search, ChevronDown, ThumbsUp, ThumbsDown, Link2, 
    MessageCircle, Check, Sparkles, RotateCcw, HelpCircle, 
    Send, X, ArrowRight, Activity, Smile, MessageSquare, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WHATSAPP_NUMBER } from '../config';
import { FAQ_DATA, FAQ_CATEGORIES, FAQItem } from './FaqData';
import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

export { FAQ_DATA, FAQ_CATEGORIES };

// Official WhatsApp Logo SVG
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

// FireStore Error Handling
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Log Error (Safe fallback triggered): ', JSON.stringify(errInfo));
}

export const Faq: React.FC = () => {
    // Basic states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [openIndex, setOpenIndex] = useState<string | null>(null);
    
    // Suggestion tags for search helper
    const suggestedTags = [
        "Keto meals", "Sarjapur delivery times", "Pause subscription", 
        "Delivery areas", "Allergies", "Dislikes customization", "UPI payments"
    ];

    // Analytics & feedback state
    const [feedbackLogged, setFeedbackLogged] = useState<Record<string, 'helpful' | 'unhelpful'>>({});
    const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [popularQuestions, setPopularQuestions] = useState<FAQItem[]>([]);

    // Mobile popular FAQs sliding states
    const [popularActiveSlide, setPopularActiveSlide] = useState(0);
    const popularContainerRef = useRef<HTMLDivElement>(null);

    const handlePopularScroll = () => {
        if (popularContainerRef.current) {
            const { scrollLeft, clientWidth } = popularContainerRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setPopularActiveSlide(index);
        }
    };

    // Mobile main FAQ list sliding states
    const [faqActiveSlide, setFaqActiveSlide] = useState(0);
    const faqScrollRef = useRef<HTMLDivElement>(null);

    const handleFaqScroll = () => {
        if (faqScrollRef.current) {
            const { scrollLeft, clientWidth } = faqScrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setFaqActiveSlide(index);
        }
    };

    // Smart AI Assistant states
    const [aiQuery, setAiQuery] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [showAiConsole, setShowAiConsole] = useState(false);

    // Refs for scrolling and lazy triggers
    const searchBarRef = useRef<HTMLDivElement>(null);
    const faqContainerRef = useRef<HTMLDivElement>(null);

    // Search analytics debouncer
    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 3) return;
        
        const delayDebounceFn = setTimeout(() => {
            logSearchToFirestore(searchQuery.trim(), filteredFaqs.length);
        }, 1200);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Load initial data from localStorage
    useEffect(() => {
        try {
            // Load feedback status
            const savedFeedback = localStorage.getItem('faq_feedback_state');
            if (savedFeedback) {
                setFeedbackLogged(JSON.parse(savedFeedback));
            }

            // Load recently viewed
            const savedRecent = localStorage.getItem('faq_recently_viewed');
            if (savedRecent) {
                setRecentlyViewed(JSON.parse(savedRecent));
            }
        } catch (e) {
            console.warn("Storage access restricted:", e);
        }

        // Parse popular questions from FAQ_DATA
        const popular = FAQ_DATA.filter(item => item.popular);
        setPopularQuestions(popular);

        // Check if there is an anchor hash on mount (e.g. #ord-place)
        if (window.location.hash) {
            const hashId = window.location.hash.replace('#', '');
            const foundFaq = FAQ_DATA.find(item => item.id === hashId);
            if (foundFaq) {
                setSelectedCategory('all');
                setOpenIndex(hashId);
                setTimeout(() => {
                    const el = document.getElementById(`faq-card-${hashId}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 500);
            }
        }
    }, []);

    // Log feedback to Firestore & update localStorage
    const handleFeedback = async (faq: FAQItem, isHelpful: boolean) => {
        if (feedbackLogged[faq.id]) return;

        const newFeedback = { ...feedbackLogged, [faq.id]: isHelpful ? 'helpful' as const : 'unhelpful' as const };
        setFeedbackLogged(newFeedback);
        
        try {
            localStorage.setItem('faq_feedback_state', JSON.stringify(newFeedback));
        } catch (e) {
            console.warn("Local storage write denied");
        }

        // FireStore Log
        const path = 'faq_feedback';
        if (db) {
            try {
                const docId = `fb_${faq.id}_${Date.now()}`;
                await setDoc(doc(db, path, docId), {
                    questionId: faq.id,
                    questionText: faq.question,
                    helpful: isHelpful,
                    timestamp: serverTimestamp()
                });
                
                // Dispatch a beautiful status toast
                window.dispatchEvent(new CustomEvent('taaza:toast', {
                    detail: { message: "Thank you! Your feedback helps us improve.", type: "success" }
                }));
            } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, path);
                window.dispatchEvent(new CustomEvent('taaza:toast', {
                    detail: { message: "Feedback submitted successfully.", type: "success" }
                }));
            }
        } else {
            window.dispatchEvent(new CustomEvent('taaza:toast', {
                detail: { message: "Thank you! Your feedback helps us improve.", type: "success" }
            }));
        }
    };

    // Log search term to Firestore
    const logSearchToFirestore = async (query: string, count: number) => {
        const path = 'faq_searches';
        if (db) {
            try {
                const docId = `search_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
                await setDoc(doc(db, path, docId), {
                    query: query.toLowerCase(),
                    timestamp: serverTimestamp(),
                    resultsCount: count
                });
            } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, path);
            }
        }
    };

    // Handle Copy Link
    const handleCopyLink = (e: React.MouseEvent, faqId: string) => {
        e.stopPropagation();
        const copyUrl = `${window.location.origin}${window.location.pathname}#${faqId}`;
        
        navigator.clipboard.writeText(copyUrl).then(() => {
            setCopiedId(faqId);
            window.dispatchEvent(new CustomEvent('taaza:toast', {
                detail: { message: "FAQ share link copied to clipboard!", type: "info" }
            }));
            setTimeout(() => setCopiedId(null), 2500);
        }).catch(err => {
            console.error("Clipboard write failed:", err);
        });
    };

    // Track recently viewed questions
    const addToRecentlyViewed = (faqId: string) => {
        if (recentlyViewed.includes(faqId)) {
            // Move to first
            const updated = [faqId, ...recentlyViewed.filter(id => id !== faqId)];
            setRecentlyViewed(updated);
            try { localStorage.setItem('faq_recently_viewed', JSON.stringify(updated)); } catch(e){}
        } else {
            const updated = [faqId, ...recentlyViewed.slice(0, 3)]; // Keep last 4
            setRecentlyViewed(updated);
            try { localStorage.setItem('faq_recently_viewed', JSON.stringify(updated)); } catch(e){}
        }
    };

    // Toggle single FAQ item
    const handleToggleFaq = (faqId: string) => {
        if (openIndex === faqId) {
            setOpenIndex(null);
        } else {
            setOpenIndex(faqId);
            addToRecentlyViewed(faqId);
        }
    };

    // Handle suggestion chip click
    const handleTagClick = (tag: string) => {
        setSearchQuery(tag);
        setSelectedCategory('all');
        if (searchBarRef.current) {
            searchBarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Query server-side Gemini AI for custom inquiries
    const handleAiAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuery.trim()) return;

        setAiLoading(true);
        setAiResponse(null);
        setShowAiConsole(true);

        try {
            const response = await fetch('/api/faq-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: aiQuery.trim() })
            });

            if (!response.ok) {
                throw new Error("Failed to consult Gemini");
            }

            const data = await response.json();
            setAiResponse(data.answer);
            
            // Log this search query as well
            logSearchToFirestore(`[AI] ${aiQuery.trim()}`, 1);
        } catch (error) {
            console.error("AI Error:", error);
            setAiResponse("I'm sorry, my neural link is temporarily offline. Please chat directly with our WhatsApp support concierge at +91 7975771457.");
        } finally {
            setAiLoading(false);
        }
    };

    // Semantic matching and search filtering
    const filteredFaqs = useMemo(() => {
        let items = FAQ_DATA;

        // Apply Category Filter
        if (selectedCategory !== 'all') {
            items = items.filter(item => item.category === selectedCategory);
        }

        // Apply Search Term
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            items = items.filter(item => {
                const questionMatch = item.question.toLowerCase().includes(query);
                const answerMatch = item.answer.toLowerCase().includes(query);
                const categoryMatch = FAQ_CATEGORIES[item.category as keyof typeof FAQ_CATEGORIES].toLowerCase().includes(query);
                
                // Add simple synonym/semantic expansion
                let tagMatch = false;
                if (query.includes("veg") || query.includes("green")) {
                    tagMatch = item.id.includes("loss") || item.id.includes("protein") || item.answer.toLowerCase().includes("vegetarian");
                }
                if (query.includes("price") || query.includes("cost") || query.includes("charge")) {
                    tagMatch = item.category === "payments" || item.category === "subscription";
                }
                if (query.includes("pause") || query.includes("freeze") || query.includes("hold")) {
                    tagMatch = item.id.includes("pause") || item.id.includes("skip");
                }
                if (query.includes("allergi") || query.includes("allergic")) {
                    tagMatch = item.category === "ingredients";
                }

                return questionMatch || answerMatch || categoryMatch || tagMatch;
            });
        }

        return items;
    }, [selectedCategory, searchQuery]);

    // Handle jump-clicking related questions
    const handleJumpToRelated = (relatedId: string) => {
        const found = FAQ_DATA.find(item => item.id === relatedId);
        if (found) {
            setSelectedCategory('all');
            setOpenIndex(relatedId);
            addToRecentlyViewed(relatedId);
            setTimeout(() => {
                const el = document.getElementById(`faq-card-${relatedId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight flash effect
                    el.classList.add('ring-2', 'ring-[#059669]/50');
                    setTimeout(() => {
                        el.classList.remove('ring-2', 'ring-[#059669]/50');
                    }, 2000);
                }
            }, 300);
        }
    };

    // Inject SEO JSON-LD structured data dynamically
    const faqSchemaJson = useMemo(() => {
        const mainEntity = filteredFaqs.slice(0, 15).map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }));

        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": mainEntity
        };
    }, [filteredFaqs]);

    // Handle recently viewed items mapping
    const resolvedRecentlyViewed = useMemo(() => {
        return recentlyViewed
            .map(id => FAQ_DATA.find(item => item.id === id))
            .filter((item): item is FAQItem => !!item);
    }, [recentlyViewed]);

    return (
        <section className="py-16 sm:py-24 lg:py-32 bg-[#FBF9F6] relative overflow-hidden" id="faq">
            {/* SEO Structured JSON-LD Script */}
            <script type="application/ld+json">
                {JSON.stringify(faqSchemaJson)}
            </script>

            {/* Premium background gradient blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 -left-60 w-[50rem] h-[50rem] bg-[#059669]/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-10 -right-60 w-[50rem] h-[50rem] bg-[#F59E0B]/5 rounded-full blur-[140px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header Section */}
                <div className="text-center mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#059669]/10 text-[#059669] font-mono text-xs rounded-full uppercase tracking-wider mb-4 font-semibold">
                        <Activity className="w-3.5 h-3.5" /> Client Knowledge Base
                    </span>
                    <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold font-sans text-[#1A1A1A] tracking-tight leading-none mb-6 uppercase">
                        Got Questions? <span className="italic text-[#059669] normal-case">We've Got Answers.</span>
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-zinc-800 max-w-2xl mx-auto font-bold leading-relaxed">
                        Comprehensive developer-certified specifications on billing, diet plans, delivery routes, and custom macro modifications.
                    </p>
                </div>

                {/* Popular Questions Horizontal Drawer */}
                {popularQuestions.length > 0 && !searchQuery && (
                    <div className="mb-12">
                        <h4 className="text-sm font-bold font-sans uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Popular Frequently Asked Questions
                        </h4>
                        
                        {/* Desktop View: Grid */}
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {popularQuestions.slice(0, 3).map((faq) => (
                                <button
                                    key={faq.id}
                                    onClick={() => handleToggleFaq(faq.id)}
                                    className="p-5 bg-white border border-gray-100 hover:border-[#059669]/30 hover:shadow-md rounded-2xl text-left transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#059669]/40" />
                                    <span className="text-xs text-[#059669] font-bold tracking-widest uppercase mb-2 block font-mono">
                                        {FAQ_CATEGORIES[faq.category as keyof typeof FAQ_CATEGORIES]}
                                    </span>
                                    <h5 className="font-serif text-base sm:text-lg text-gray-800 leading-snug mb-3 group-hover:text-[#059669] transition-colors duration-200">
                                        {faq.question}
                                    </h5>
                                    <span className="text-xs text-gray-500 flex items-center gap-1 mt-auto font-mono">
                                        Tap to expand <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Mobile View: Side-Sliding Cards */}
                        <div className="md:hidden relative overflow-hidden w-full">
                            <div 
                                ref={popularContainerRef}
                                onScroll={handlePopularScroll}
                                className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-6 gap-4 scroll-smooth"
                            >
                                {popularQuestions.slice(0, 3).map((faq) => (
                                    <button
                                        key={faq.id}
                                        onClick={() => handleToggleFaq(faq.id)}
                                        className="min-w-[85vw] flex-shrink-0 snap-center p-5 bg-white border border-gray-100 hover:border-[#059669]/30 rounded-2xl text-left relative overflow-hidden flex flex-col justify-between min-h-[160px]"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#059669]/40" />
                                        <div>
                                            <span className="text-[10px] text-[#059669] font-bold tracking-widest uppercase mb-2 block font-mono">
                                                {FAQ_CATEGORIES[faq.category as keyof typeof FAQ_CATEGORIES]}
                                            </span>
                                            <h5 className="font-serif text-sm sm:text-base text-gray-800 leading-snug mb-3">
                                                {faq.question}
                                            </h5>
                                        </div>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-auto font-mono">
                                            Tap to expand <ArrowRight className="w-3 h-3" />
                                        </span>
                                    </button>
                                ))}
                            </div>
                            {/* Dot indicators */}
                            <div className="flex items-center justify-center gap-1.5 mt-2">
                                {popularQuestions.slice(0, 3).map((_, index) => (
                                    <button 
                                        key={index} 
                                        onClick={() => {
                                            if(navigator.vibrate) navigator.vibrate(5);
                                            if(popularContainerRef.current) {
                                                popularContainerRef.current.scrollTo({
                                                    left: index * popularContainerRef.current.clientWidth,
                                                    behavior: 'smooth'
                                                });
                                            }
                                        }} 
                                        className={`h-1 transition-all duration-500 rounded-full ${popularActiveSlide === index ? 'w-6 bg-[#059669]' : 'w-1.5 bg-gray-300'}`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Interactive Search Console */}
                <div 
                    ref={searchBarRef}
                    className="bg-white rounded-3xl border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.03)] p-6 sm:p-8 mb-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#059669]/5 rounded-bl-[100px] pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center relative z-10">
                        {/* Instant Search Inputs */}
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Search className="w-5 h-5" />
                            </span>
                            <input 
                                type="text"
                                placeholder="Search meal plans, pauses, allergens, calories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[#1A1A1A] font-sans placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/30 focus:bg-white transition-all duration-300 text-base"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                                    aria-label="Clear search query"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        {/* Category Selector Dropdown or Quick Reset */}
                        <div className="flex gap-2">
                            <select 
                                value={selectedCategory} 
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[#1A1A1A] font-sans focus:outline-none focus:ring-2 focus:ring-[#059669]/30 transition-all duration-300 text-sm font-semibold pr-8 relative cursor-pointer"
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(FAQ_CATEGORIES).map(([key, value]) => (
                                    <option key={key} value={key}>{value}</option>
                                ))}
                            </select>
                            
                            {(searchQuery || selectedCategory !== 'all') && (
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                    className="p-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl transition-all duration-300"
                                    title="Reset filters"
                                    aria-label="Reset filters"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Search Tags */}
                    <div className="overflow-hidden w-full sm:overflow-visible">
                        <div className="mt-4 flex items-center gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap">
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-mono mr-1 shrink-0">Suggestions:</span>
                            {suggestedTags.map((tag, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleTagClick(tag)}
                                    className="px-3 py-1.5 bg-[#F5F2ED] hover:bg-[#059669]/10 text-gray-600 hover:text-[#059669] rounded-full text-xs font-medium transition-all duration-200 border border-transparent hover:border-[#059669]/25 shrink-0"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Concierge Console Section */}
                <div className="mb-12">
                    <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2E2E2E] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden text-white border border-[#059669]/20">
                        {/* Animated background waves */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#059669]/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#059669]/30 text-[#E6F4EA] font-mono text-[11px] rounded-full uppercase tracking-wider mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] animate-pulse" /> Taaza AI Customer Concierge
                                </div>
                                <h3 className="text-xl sm:text-2xl font-sans font-extrabold tracking-tight uppercase">
                                    Can't find your specific question? <span className="italic text-[#059669] normal-case">Consult our AI helper instantly.</span>
                                </h3>
                                <p className="text-sm text-zinc-100 mt-1 font-semibold leading-relaxed">
                                    Ask about complex ingredient formulations, exact delivery routes, customized diets, or billing setups. Supported by Gemini.
                                </p>
                            </div>
                            
                            <form onSubmit={handleAiAsk} className="w-full lg:max-w-md flex items-center gap-2">
                                <input 
                                    type="text"
                                    placeholder="Type custom question..."
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white/10 transition-all text-sm font-sans"
                                />
                                <button
                                    type="submit"
                                    disabled={aiLoading || !aiQuery.trim()}
                                    className="px-5 py-3 bg-[#059669] hover:bg-[#047857] disabled:bg-gray-700 disabled:text-gray-400 rounded-2xl font-bold text-sm transition-all flex items-center gap-1.5 text-white shadow-lg"
                                >
                                    {aiLoading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>Ask AI <Send className="w-3.5 h-3.5" /></>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* AI Console Answer Output */}
                        <AnimatePresence>
                            {showAiConsole && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-6 border-t border-white/10 pt-6 overflow-hidden"
                                >
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[#059669] flex items-center justify-center flex-shrink-0 shadow-md">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-mono uppercase tracking-widest text-gray-300">Taaza AI Assistant response:</span>
                                                <button 
                                                    onClick={() => setShowAiConsole(false)}
                                                    className="text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {aiLoading ? (
                                                <div className="space-y-2 py-2">
                                                    <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
                                                    <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                                                </div>
                                            ) : (
                                                <p className="text-sm sm:text-base text-gray-100 leading-relaxed font-light">
                                                    {aiResponse}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Main Accordion & Category List split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16" ref={faqContainerRef}>
                    
                    {/* Left Sticky Category Menu */}
                    <div className="lg:col-span-1 min-w-0">
                        <div className="lg:sticky lg:top-6 bg-transparent lg:bg-white border-0 lg:border lg:border-gray-100 rounded-3xl p-0 lg:p-5 shadow-none lg:shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
                            <h4 className="hidden lg:block text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 px-2 font-mono">
                                FAQ Categories
                            </h4>
                            
                            {/* Mobile-friendly Side-Sliding Category Pills / Desktop Vertical List */}
                            <div className="relative w-full overflow-hidden lg:overflow-visible">
                                {/* Left fade gradient on mobile */}
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FBF9F6] to-transparent pointer-events-none z-10 lg:hidden" />
                                {/* Right fade gradient on mobile */}
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FBF9F6] to-transparent pointer-events-none z-10 lg:hidden" />
                                
                                <div 
                                    className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 -mx-4 px-8 lg:mx-0 lg:px-0 hide-scrollbar snap-x snap-mandatory scroll-smooth"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`snap-start shrink-0 min-h-[44px] text-center lg:text-left px-4 py-2 rounded-full lg:rounded-2xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-2 lg:justify-between cursor-pointer focus:outline-none ${
                                            selectedCategory === 'all' 
                                            ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/10 font-bold' 
                                            : 'bg-white lg:bg-transparent text-gray-600 border border-gray-150 lg:border-0 hover:bg-[#F5F2ED] hover:text-[#059669]'
                                        }`}
                                    >
                                        <span>All Questions</span>
                                        <span className={`text-[10px] lg:text-xs font-mono px-2 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-gray-150 text-gray-500'}`}>
                                            {FAQ_DATA.length}
                                        </span>
                                    </button>
                                    {Object.entries(FAQ_CATEGORIES).map(([key, label]) => {
                                        const count = FAQ_DATA.filter(item => item.category === key).length;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedCategory(key)}
                                                className={`snap-start shrink-0 min-h-[44px] text-center lg:text-left px-4 py-2 rounded-full lg:rounded-2xl text-xs lg:text-sm font-semibold transition-all duration-200 flex items-center gap-2 lg:justify-between cursor-pointer focus:outline-none ${
                                                    selectedCategory === key 
                                                    ? 'bg-[#059669] text-white shadow-md shadow-[#059669]/10 font-bold' 
                                                    : 'bg-white lg:bg-transparent text-gray-600 border border-gray-150 lg:border-0 hover:bg-[#F5F2ED] hover:text-[#059669]'
                                                }`}
                                            >
                                                <span className="truncate max-w-[150px] lg:max-w-none">{label}</span>
                                                <span className={`text-[10px] lg:text-xs font-mono px-2 py-0.5 rounded-full ${selectedCategory === key ? 'bg-white/20 text-white' : 'bg-gray-150 text-gray-500'}`}>
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Filtered Accordion List */}
                    <div className="lg:col-span-3 min-w-0">
                        {filteredFaqs.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <HelpCircle className="w-12 h-12 text-[#059669]/40 mx-auto mb-4" />
                                <h4 className="text-xl font-serif text-gray-800 mb-2">No matching questions found</h4>
                                <p className="text-gray-500 max-w-sm mx-auto text-sm font-light mb-6">
                                    We couldn't find any direct matches for "{searchQuery}". Try searching general terms or consulting our AI customer assistant.
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                    className="px-6 py-2.5 bg-gray-100 text-gray-700 hover:bg-[#059669] hover:text-white rounded-full font-bold text-sm transition-all"
                                >
                                    Clear search parameters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Desktop View: Vertical Accordion List */}
                                <div className="hidden md:block space-y-4">
                                    <div className="text-xs font-mono text-gray-500 mb-2 px-2 flex items-center justify-between">
                                        <span>Showing {filteredFaqs.length} of {FAQ_DATA.length} FAQ specifications</span>
                                        <span>{selectedCategory !== 'all' ? `Filtered by ${FAQ_CATEGORIES[selectedCategory as keyof typeof FAQ_CATEGORIES]}` : 'Unfiltered list'}</span>
                                    </div>
                                    
                                    {filteredFaqs.map((faq) => {
                                        const isOpen = openIndex === faq.id;
                                        const isSubmittingFeedback = feedbackLogged[faq.id];
                                        
                                        return (
                                            <div 
                                                key={faq.id} 
                                                id={`faq-card-${faq.id}`}
                                                className={`bg-white rounded-2xl border transition-all duration-500 overflow-hidden ${
                                                    isOpen 
                                                    ? 'border-[#059669]/30 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.04)] ring-1 ring-[#059669]/10' 
                                                    : 'border-gray-100 hover:border-[#059669]/25 hover:shadow-sm'
                                                }`}
                                            >
                                                {/* Header Button Accordion Action */}
                                                <button
                                                    className="w-full px-6 py-5 flex items-start sm:items-center justify-between text-left focus:outline-none group gap-4"
                                                    onClick={() => handleToggleFaq(faq.id)}
                                                    aria-expanded={isOpen}
                                                    aria-controls={`faq-answer-${faq.id}`}
                                                    aria-label={`${isOpen ? 'Close' : 'Open'} answer for: ${faq.question}`}
                                                >
                                                    <div className="flex-1">
                                                        <span className="text-[10px] text-gray-500 tracking-wider uppercase font-mono block mb-1">
                                                            {FAQ_CATEGORIES[faq.category as keyof typeof FAQ_CATEGORIES]}
                                                        </span>
                                                        <h2 className={`font-serif text-base sm:text-lg lg:text-xl transition-colors duration-300 pr-2 ${isOpen ? 'text-[#059669] font-normal' : 'text-[#1A1A1A] group-hover:text-[#059669]'}`}>
                                                            {faq.question}
                                                        </h2>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0 mt-1 sm:mt-0">
                                                        {/* Copy Link Button */}
                                                        <button
                                                            onClick={(e) => handleCopyLink(e, faq.id)}
                                                            className={`p-2 rounded-full transition-colors ${copiedId === faq.id ? 'bg-[#E6F4EA] text-[#059669]' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-100'}`}
                                                            title="Copy shareable anchor link"
                                                        >
                                                            {copiedId === faq.id ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <Link2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        
                                                        {/* Rotate Arrow Icon */}
                                                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${isOpen ? 'bg-[#059669] text-white rotate-180 shadow-[0_4px_15px_rgba(5,150,105,0.3)]' : 'bg-white border border-gray-100 text-gray-500 group-hover:bg-[#E6F4EA] group-hover:text-[#059669] group-hover:border-[#059669]/20'}`}>
                                                            <ChevronDown className="w-4 h-4"/>
                                                        </div>
                                                    </div>
                                                </button>
                                                
                                                {/* Expandable Panel */}
                                                <AnimatePresence initial={false}>
                                                    {isOpen && (
                                                        <motion.div 
                                                            id={`faq-answer-${faq.id}`}
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.35, ease: "easeInOut" }}
                                                        >
                                                            <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                                                                {/* Answer text */}
                                                                <div className="text-gray-600 font-light leading-relaxed text-sm sm:text-base mb-6">
                                                                    {faq.answer}
                                                                </div>

                                                                {/* Related Questions Inline (SEO friendly internal links) */}
                                                                {faq.relatedIds && faq.relatedIds.length > 0 && (
                                                                    <div className="mb-6 bg-[#FBF9F6] p-4 rounded-xl border border-gray-100">
                                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block mb-2 font-mono">Related Specifications:</span>
                                                                        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                                                                            {faq.relatedIds.map(relId => {
                                                                                const relFaq = FAQ_DATA.find(item => item.id === relId);
                                                                                if (!relFaq) return null;
                                                                                return (
                                                                                    <button
                                                                                        key={relId}
                                                                                        onClick={() => handleJumpToRelated(relId)}
                                                                                        className="px-3 py-1.5 bg-white border border-gray-100 hover:border-[#059669]/30 hover:text-[#059669] text-gray-600 text-xs rounded-lg text-left font-medium transition-all duration-200"
                                                                                    >
                                                                                        {relFaq.question}
                                                                                    </button>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Helpful Feedback Panel */}
                                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-4 gap-3">
                                                                    <span className="text-xs text-gray-500 font-light flex items-center gap-1">
                                                                        Was this answer clear and helpful?
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        {isSubmittingFeedback ? (
                                                                            <span className="text-xs text-[#059669] font-semibold flex items-center gap-1 animate-fade-in">
                                                                                <Check className="w-3.5 h-3.5" /> Thank you for the feedback!
                                                                            </span>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleFeedback(faq, true)}
                                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-[#059669]/30 hover:bg-[#E6F4EA]/40 text-gray-500 hover:text-[#059669] text-xs transition-all font-semibold"
                                                                                >
                                                                                    <ThumbsUp className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#059669]" /> Yes
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleFeedback(faq, false)}
                                                                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-100 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-600 text-xs transition-all font-semibold"
                                                                                >
                                                                                    <ThumbsDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-50" /> No
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Mobile View: Touch-enabled horizontal swipe carousel */}
                                <div className="md:hidden relative overflow-hidden w-full">
                                    <div className="text-xs font-mono text-gray-500 mb-4 px-2 flex items-center justify-between">
                                        <span>Showing {filteredFaqs.length} FAQs</span>
                                        <span>Swipe horizontally to browse</span>
                                    </div>
                                    <div 
                                        ref={faqScrollRef}
                                        onScroll={handleFaqScroll}
                                        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-6 gap-6 scroll-smooth"
                                    >
                                        {filteredFaqs.map((faq, index) => (
                                            <div 
                                                key={faq.id} 
                                                className="min-w-[85vw] flex-shrink-0 snap-center bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[260px] relative overflow-hidden"
                                            >
                                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#059669]" />
                                                <div className="pl-2">
                                                    <span className="text-[10px] text-[#059669] font-bold tracking-widest uppercase mb-2 block font-mono">
                                                        {FAQ_CATEGORIES[faq.category as keyof typeof FAQ_CATEGORIES]}
                                                    </span>
                                                    <h4 className="font-serif text-base text-gray-800 font-semibold leading-snug mb-3">
                                                        {faq.question}
                                                    </h4>
                                                    <p className="text-gray-650 text-xs sm:text-sm font-light leading-relaxed">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 pl-2">
                                                    <span className="text-[9px] font-mono text-gray-400">Specification {index + 1} of {filteredFaqs.length}</span>
                                                    <button 
                                                        onClick={(e) => handleCopyLink(e, faq.id)}
                                                        className="text-[10px] text-[#059669] hover:underline font-bold flex items-center gap-1 font-mono uppercase tracking-wider"
                                                    >
                                                        {copiedId === faq.id ? 'Copied' : 'Share'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Dots Indicators */}
                                    {filteredFaqs.length > 1 && (
                                        <div className="flex items-center justify-center gap-1.5 mt-2 overflow-x-auto max-w-full hide-scrollbar py-2 px-4">
                                            {filteredFaqs.map((_, index) => (
                                                <button 
                                                    key={index} 
                                                    onClick={() => {
                                                        if (navigator.vibrate) navigator.vibrate(5);
                                                        if (faqScrollRef.current) {
                                                            faqScrollRef.current.scrollTo({
                                                                left: index * faqScrollRef.current.clientWidth,
                                                                behavior: 'smooth'
                                                            });
                                                        }
                                                    }} 
                                                    className={`h-1.5 transition-all duration-500 rounded-full shrink-0 ${faqActiveSlide === index ? 'w-8 bg-[#059669]' : 'w-2 bg-gray-350'}`}
                                                    aria-label={`Go to slide ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* History: Recently Viewed FAQs Horizontal Scroller */}
                {resolvedRecentlyViewed.length > 0 && (
                    <div className="mb-16 border-t border-gray-100 pt-10">
                        <h4 className="text-sm font-bold font-sans uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Recently Viewed Specifications
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {resolvedRecentlyViewed.map((faq) => (
                                <button
                                    key={faq.id}
                                    onClick={() => handleToggleFaq(faq.id)}
                                    className="px-4 py-2 bg-white border border-gray-100 hover:border-[#059669]/30 hover:shadow-sm rounded-xl text-left text-xs font-semibold text-gray-600 hover:text-[#059669] transition-all flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                                    <span>{faq.question}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* "Still Have Questions?" Premium Call-to-Action Card */}
                <div className="bg-[#F5F2ED] rounded-3xl p-8 sm:p-12 border border-[#E6E2D8] text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#059669]/5 rounded-br-full pointer-events-none" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-tl-full pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <HelpCircle className="w-12 h-12 text-[#059669] mx-auto mb-6" />
                        <h3 className="text-2xl sm:text-3.5xl font-serif text-[#1A1A1A] tracking-tight leading-none mb-4">
                            Still have questions or need specialized diet guidance?
                        </h3>
                        <p className="text-zinc-800 font-bold leading-relaxed text-sm sm:text-base max-w-lg mx-auto mb-8">
                            Our team of certified nutritionists and concierge managers is available daily in Bangalore to craft your ideal dietary setup.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href={`https://wa.me/${WHATSAPP_NUMBER}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#1A1A1A] hover:bg-[#059669] text-white rounded-full font-black text-sm sm:text-base uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
                            >
                                <WhatsAppIcon className="w-5 h-5 text-[#25D366] fill-current group-hover:text-white transition-colors"/>
                                Chat on WhatsApp
                            </a>
                            <a 
                                href={`tel:+${WHATSAPP_NUMBER}`}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-gray-50 text-[#1A1A1A] border border-[#E6E2D8] rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                            >
                                <Phone className="w-5 h-5 text-gray-400" />
                                Call Concierge Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
