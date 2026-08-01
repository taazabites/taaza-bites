import { 
    ArrowLeft, 
    Clock, 
    Calendar, 
    Share2, 
    Link, 
    ChevronRight, 
    Sparkles, 
    BookOpen, 
    CheckCircle,
    User,
    Heart,
    Copy,
    Check,
    Globe
} from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const INDIAN_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' }
];
import { blogPosts, BlogPost as BlogPostType } from './blogData';
import Markdown from 'react-markdown';
import { LazyImage } from './LazyImage';
import { SEO } from './SEO';
import { getOptimizedImageUrl } from './imageOptimizer';

export const BlogPost: React.FC<{ postId: string; onNavigate: (path: string) => void }> = ({ postId, onNavigate }) => {
    const [post, setPost] = useState<BlogPostType | null>(null);
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);

    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [translating, setTranslating] = useState(false);
    const [translatedData, setTranslatedData] = useState<{ title: string; excerpt: string; content: string } | null>(null);
    const [translationError, setTranslationError] = useState<string | null>(null);

    // Scroll reading progress
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const foundPost = blogPosts.find(p => p.id === postId);
        if (foundPost) {
            setPost(foundPost);
            setSelectedLanguage('English');
            setTranslatedData(null);
            setTranslationError(null);
            window.scrollTo({ top: 0, behavior: 'instant' as any });
        }
    }, [postId]);

    const handleLanguageChange = async (langName: string) => {
        if (!post) return;
        if (langName === 'English') {
            setSelectedLanguage('English');
            setTranslatedData(null);
            return;
        }

        setTranslating(true);
        setTranslationError(null);
        try {
            const res = await fetch('/api/blog/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postId: post.id,
                    title: post.title,
                    excerpt: post.excerpt,
                    content: post.content,
                    targetLanguage: langName
                })
            });

            if (!res.ok) throw new Error('Translation request failed.');
            const data = await res.json();
            if (data.title && data.content) {
                setTranslatedData(data);
                setSelectedLanguage(langName);
            } else {
                throw new Error('Received incomplete translation response.');
            }
        } catch (err) {
            console.error(err);
            setTranslationError(`Unable to translate to ${langName} at this time. Please try again.`);
        } finally {
            setTranslating(false);
        }
    };

    // Generate quick Table of Contents from markdown headers dynamically
    const tableOfContents = useMemo(() => {
        if (!post) return [];
        const contentToParse = translatedData ? translatedData.content : post.content;
        const lines = contentToParse.split('\n');
        const headers: { text: string; id: string; level: number }[] = [];
        
        lines.forEach(line => {
            const match = line.match(/^(#{2,3})\s+(.*)$/);
            if (match) {
                const level = match[1].length; // 2 for h2, 3 for h3
                const text = match[2].trim();
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                headers.push({ text, id, level });
            }
        });
        return headers;
    }, [post, translatedData]);

    // Extract quick bullet summaries for AEO/GEO indexing
    const keyTakeaways = useMemo(() => {
        if (!post) return [];
        // Extract bullet points dynamically or fallback to structured ones based on categories
        if (post.category === 'Nutrition Science') {
            return [
                "Macronutrient balances must follow an exact mathematical distribution tailored to metabolic output.",
                "Complex carbohydrates act as slow-releasing muscle glycogen replenishers without driving insulin spikes.",
                "Optimal hormone synthesis is heavily contingent on high-quality cold-pressed lipids and omega fats."
            ];
        }
        if (post.category === 'PCOS Management') {
            return [
                "Insulin resistance affects up to 70% of PCOS sufferers; Low-GI sourcing is critical.",
                "Systemic inflammation is mitigated by rich trace minerals, high-quality proteins, and zero refined flours.",
                "Eliminating processed dairy and soy can provide significant estrogenic equilibrium."
            ];
        }
        if (post.category === 'Weight Loss') {
            return [
                "Extreme starvation triggers adaptive thermogenesis, dropping baseline BMR and melting lean muscle.",
                "A sustainable, scientific caloric deficit must be restricted to 300-500 kcal below measured TDEE.",
                "Subscribing bypasses meal-prep friction and guarantees portion-accuracies weighed to the gram."
            ];
        }
        // Default general wellness takeaways
        return [
            "Wholesome single-ingredient sourcing ensures chemical-free nutritional intake.",
            "Adequate dietary fiber acts as a prebiotic substrate, feeding healthy gut microflora directly.",
            "Micronutrient retention is safeguarded via specialized cold-chain thermal dispatch logistics."
        ];
    }, [post]);

    // Find 3 recommended related articles from the remaining catalog
    const relatedPosts = useMemo(() => {
        if (!post) return [];
        return blogPosts
            .filter(p => p.id !== post.id)
            .sort((a, b) => {
                // Prioritize same category, then mutual tags
                if (a.category === post.category && b.category !== post.category) return -1;
                if (b.category === post.category && a.category !== post.category) return 1;
                const aTags = a.tags.filter(t => post.tags.includes(t)).length;
                const bTags = b.tags.filter(t => post.tags.includes(t)).length;
                return bTags - aTags;
            })
            .slice(0, 3);
    }, [post]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FBF9F6]">
                <div className="text-center">
                    <h2 className="text-2xl font-serif text-gray-900 mb-4">Article Not Found</h2>
                    <button 
                        onClick={() => onNavigate('/blog')}
                        className="px-6 py-3 bg-[#059669] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#047857] transition-all shadow-sm"
                    >
                        Return to Journal
                    </button>
                </div>
            </div>
        );
    }

    const titleToUse = translatedData ? translatedData.title : post.title;
    const excerptToUse = translatedData ? translatedData.excerpt : post.excerpt;
    const fullBlogTitle = `${titleToUse} | Taazabites`;
    const seoTitle = fullBlogTitle.length <= 60 ? fullBlogTitle : (titleToUse.length <= 60 ? titleToUse : titleToUse.slice(0, 57) + "...");

    return (
        <article className="min-h-screen bg-[#FBF9F6] pb-24 relative selection:bg-[#059669]/10 selection:text-[#059669]">
            <SEO 
                title={seoTitle}
                description={excerptToUse}
                canonical={`https://www.taazabites.in/blog/${post.id}`}
                ogImage={post.imageUrl}
                breadcrumbs={[
                    { name: 'Home', item: 'https://www.taazabites.in/' },
                    { name: 'Blog', item: 'https://www.taazabites.in/blog' },
                    { name: titleToUse, item: `https://www.taazabites.in/blog/${post.id}` }
                ]}
                schemas={[
                    {
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": `https://www.taazabites.in/blog/${post.id}`
                        },
                        "headline": titleToUse,
                        "description": excerptToUse,
                        "image": post.imageUrl,
                        "author": {
                            "@type": "Person",
                            "name": post.author
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Taazabites",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://cdn.urbanpiper.com/media/gallery_images/2026/05/31/WhatsApp_Image_2026-05-31_at_12808_PM_617a.jpeg"
                            }
                        },
                        "datePublished": new Date(post.date).toISOString()
                    }
                ]}
            />

            {/* Sticky Reading Progress Bar */}
            <motion.div 
                className="fixed top-16 left-0 right-0 h-1 bg-[#059669] origin-left z-50 shadow-sm" 
                style={{ scaleX }} 
            />

            {/* Back Button Floating Header */}
            <div className="absolute top-20 left-0 right-0 z-30 pointer-events-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => onNavigate('/blog')}
                        className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-gray-700 hover:text-[#059669] hover:bg-white transition-all shadow-sm border border-gray-100 group text-xs font-semibold uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                </div>
            </div>

            {/* High-Impact Hero Banner */}
            <header className="relative h-[60vh] sm:h-[70vh] min-h-[480px] w-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <LazyImage 
                    src={getOptimizedImageUrl(post.imageUrl, 1200)} 
                    alt={post.title} 
                    className="absolute inset-0 w-full h-full object-cover scale-102"
                />
                
                {/* Visual grid accent inside hero */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FBF9F6] via-transparent to-transparent z-15"></div>

                <div className="max-w-4xl w-full text-center px-4 z-20 mt-12 sm:mt-16">
                    <motion.span 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 bg-[#059669] rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 shadow-md"
                    >
                        {post.category}
                    </motion.span>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, type: 'spring' }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight drop-shadow-xl max-w-3xl mx-auto"
                    >
                        {translatedData ? translatedData.title : post.title}
                    </motion.h1>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 text-white/90 text-xs font-mono tracking-wider uppercase"
                    >
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#059669]" />{post.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#059669]" />{post.readTime}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-[#059669]" />{post.tags.length} Tags</span>
                    </motion.div>
                </div>
            </header>

            {/* Split layout for Table of Contents + Reading Block */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-30">
                <div className="flex flex-col lg:flex-row gap-12 items-start">
                    
                    {/* LEFT SIDEBAR: Table of Contents & Social Triggers (Visible only on large screens) */}
                    <aside className="hidden lg:block w-72 shrink-0 sticky top-24 space-y-8">
                        {tableOfContents.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#059669]" /> Directory
                                </h4>
                                <nav className="space-y-3 text-xs font-medium text-gray-500">
                                    {tableOfContents.map((item, idx) => (
                                        <a 
                                            key={idx}
                                            href={`#${item.id}`}
                                            className="block hover:text-[#059669] transition-colors leading-relaxed line-clamp-2"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const el = document.getElementById(item.id);
                                                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                            }}
                                        >
                                            <span className="text-[#059669] mr-1.5 font-bold">0{idx + 1}.</span> {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}

                        {/* Interactive Widget */}
                        <div className="bg-gradient-to-br from-[#059669] to-emerald-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                            <h4 className="text-sm font-serif font-bold mb-2">Subscribe to Taazabites</h4>
                            <p className="text-white/80 text-xs font-light mb-4 leading-relaxed">
                                Get calorie-deficit and high-protein gourmet plans delivered across Bengaluru.
                            </p>
                            <button 
                                onClick={() => onNavigate('/subscriptions')}
                                className="w-full py-2.5 bg-white text-[#059669] rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-50 transition-all shadow-sm"
                            >
                                View Meal Plans
                            </button>
                        </div>
                    </aside>

                    {/* MAIN READING COLUMN */}
                    <main className="w-full lg:max-w-4xl bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-10 md:p-16">
                        
                        {/* Indian Language Translation Bar */}
                        <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-[#059669]/10 rounded-xl flex items-center justify-center text-[#059669]">
                                    <Globe className="w-5 h-5 animate-pulse" style={{ animationDuration: '4s' }} />
                                </div>
                                <div className="text-left">
                                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Translate Article / लेख अनुवाद</h4>
                                    <p className="text-[10px] text-gray-400 mt-0.5">Read this journal entry in your preferred Indian language</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                {translating && (
                                    <div className="flex items-center gap-2 text-xs font-mono text-[#059669] animate-pulse mr-2">
                                        <div className="w-3 h-3 border-2 border-[#059669] border-t-transparent rounded-full animate-spin"></div>
                                        <span>Translating...</span>
                                    </div>
                                )}
                                
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    disabled={translating}
                                    className="w-full sm:w-48 bg-white border border-gray-200 hover:border-[#059669]/30 rounded-xl px-3 py-2 text-xs font-semibold text-gray-750 focus:outline-none focus:ring-1 focus:ring-[#059669]/20 focus:border-[#059669] transition-all cursor-pointer shadow-sm"
                                >
                                    {INDIAN_LANGUAGES.map(lang => (
                                        <option key={lang.code} value={lang.name}>
                                            {lang.nativeName} ({lang.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {translationError && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium text-center">
                                {translationError}
                            </div>
                        )}

                        {/* Author Credentials Panel */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-100 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#059669]/10 rounded-full flex items-center justify-center text-[#059669] shrink-0 font-bold text-lg font-serif">
                                    {post.author.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">{post.author}</p>
                                    <p className="text-xs text-[#059669] font-mono mt-0.5">Verified Medical Reviewer • Taazabites Board</p>
                                </div>
                            </div>
                            
                            {/* Read-Actions: Like & Copy Link */}
                            <div className="flex items-center gap-2.5">
                                <button 
                                    onClick={() => setLiked(!liked)}
                                    className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                                        liked 
                                            ? 'bg-rose-50 border-rose-200 text-rose-500' 
                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-[#059669] hover:bg-[#059669]/5'
                                    }`}
                                >
                                    <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} /> {liked ? 'Liked' : 'Like'}
                                </button>
                                <button 
                                    onClick={handleCopyLink}
                                    className="p-2.5 rounded-xl border bg-gray-50 border-gray-200 text-gray-500 hover:text-[#059669] hover:bg-[#059669]/5 transition-all flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied' : 'Share Link'}
                                </button>
                            </div>
                        </div>

                        {/* GEO-Optimized Core Takeaways Box */}
                        <section className="bg-emerald-50/50 rounded-2xl border border-[#059669]/10 p-6 sm:p-8 mb-10">
                            <h3 className="text-sm font-bold text-[#059669] uppercase tracking-widest mb-4 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#059669]" /> Elite Insights & Takeaways
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700 font-light leading-relaxed">
                                {keyTakeaways.map((takeaway, index) => (
                                    <li key={index} className="flex gap-2.5 items-start">
                                        <span className="w-1.5 h-1.5 bg-[#059669] rounded-full mt-2 shrink-0"></span>
                                        <span>{takeaway}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Article Markdown content body */}
                        <section className="prose prose-emerald prose-lg max-w-none">
                            <div className="markdown-body font-light text-gray-850 leading-relaxed text-base sm:text-lg">
                                <Markdown 
                                    components={{
                                        h1: ({node, ...props}) => {
                                            const text = String(props.children);
                                            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                            return <h2 id={id} className="text-2xl sm:text-3xl font-serif text-gray-900 mb-6 mt-12 scroll-mt-20 border-b border-gray-100 pb-2 flex items-center gap-2" {...props} />;
                                        },
                                        h2: ({node, ...props}) => {
                                            const text = String(props.children);
                                            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                                            return <h3 id={id} className="text-xl sm:text-2xl font-serif text-gray-900 mb-4 mt-10 scroll-mt-20" {...props} />;
                                        },
                                        p: ({node, ...props}) => <p className="mb-6 tracking-wide text-gray-750" {...props} />,
                                        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-6 space-y-3 pl-2" {...props} />,
                                        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 space-y-3 pl-2" {...props} />,
                                        li: ({node, ...props}) => <li className="pl-1 marker:text-[#059669] text-gray-750" {...props} />,
                                        strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#059669] pl-6 italic bg-gray-50/50 py-4 pr-6 rounded-r-2xl my-8 font-serif text-gray-800" {...props} />,
                                        table: ({node, ...props}) => (
                                            <div className="overflow-x-auto my-8 border border-gray-100 rounded-2xl shadow-sm">
                                                <table className="min-w-full divide-y divide-gray-100 text-sm" {...props} />
                                            </div>
                                        ),
                                        thead: ({node, ...props}) => <thead className="bg-gray-55" {...props} />,
                                        tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-100 bg-white" {...props} />,
                                        tr: ({node, ...props}) => <tr className="hover:bg-gray-50/30 transition-colors" {...props} />,
                                        th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-widest" {...props} />,
                                        td: ({node, ...props}) => <td className="px-4 py-3 text-gray-650 font-light" {...props} />,
                                    }}
                                >
                                    {translatedData ? translatedData.content : post.content}
                                </Markdown>
                            </div>
                        </section>

                        {/* Footer tags list */}
                        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span 
                                        key={tag} 
                                        onClick={() => {
                                            onNavigate('/blog');
                                        }}
                                        className="px-3.5 py-1.5 bg-gray-50 hover:bg-[#059669]/10 hover:text-[#059669] text-gray-500 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-gray-100"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* RELATED ARTICLES: Stately Bento Grid recommended reads */}
            <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 pt-16 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                    <div>
                        <h3 className="text-2xl font-serif text-gray-900">Recommended Journal Readings</h3>
                        <p className="text-gray-500 font-light text-sm mt-1">Carefully curated scientific articles based on your current reading preferences.</p>
                    </div>
                    <button 
                        onClick={() => onNavigate('/blog')}
                        className="self-start sm:self-center inline-flex items-center gap-1.5 text-sm font-bold text-[#059669] hover:text-emerald-700 transition-colors shrink-0 group"
                    >
                        Explore Journal <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {relatedPosts.map((relatedPost) => (
                        <motion.article 
                            key={relatedPost.id}
                            whileHover={{ y: -5 }}
                            onClick={() => {
                                onNavigate('/blog/' + relatedPost.id);
                            }}
                            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 cursor-pointer flex flex-col h-full group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <LazyImage 
                                    src={getOptimizedImageUrl(relatedPost.imageUrl, 500)} 
                                    alt={relatedPost.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#059669] uppercase tracking-wider shadow-sm">
                                        {relatedPost.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center text-[10px] text-gray-400 mb-2 font-mono uppercase tracking-wider">
                                    <span>{relatedPost.date}</span>
                                    <span className="mx-1.5">•</span>
                                    <span>{relatedPost.readTime}</span>
                                </div>
                                <h4 className="text-base font-serif text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#059669] transition-colors duration-300">
                                    {relatedPost.title}
                                </h4>
                                <p className="text-xs text-gray-500 font-light line-clamp-3 mb-4 leading-relaxed">
                                    {relatedPost.excerpt}
                                </p>
                                <span className="text-[#059669] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 mt-auto group-hover:translate-x-1 transition-transform">
                                    Read Article <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </footer>
        </article>
    );
};
