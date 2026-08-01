import { Pen, ArrowRight, Search, Sparkles, Clock, BookOpen, Filter, Hash } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { blogPosts } from './blogData';
import { LazyImage } from './LazyImage';
import { SEO } from './SEO';
import { getOptimizedImageUrl } from './imageOptimizer';

export const Blog: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Get all unique categories dynamically
    const categories = useMemo(() => {
        const cats = new Set(blogPosts.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, []);

    // Filter blog posts based on category and search query
    const filteredPosts = useMemo(() => {
        return blogPosts.filter(post => {
            const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
            const matchesSearch = 
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    // Separate the latest post for a featured layout if no search/filter is active
    const featuredPost = useMemo(() => {
        if (searchQuery || selectedCategory !== 'All' || blogPosts.length === 0) {
            return null;
        }
        return blogPosts[0]; // The latest post is featured
    }, [searchQuery, selectedCategory]);

    const regularPosts = useMemo(() => {
        if (featuredPost) {
            return filteredPosts.filter(p => p.id !== featuredPost.id);
        }
        return filteredPosts;
    }, [featuredPost, filteredPosts]);

    return (
        <main className="min-h-screen bg-[#FBF9F6] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="blog-journal">
            <SEO 
                title="Taazabites Journal | Nutrition Science & Clean Eating Blog"
                description="Insights on nutrition science, clean eating in Bengaluru, and maintaining a high-performance healthy lifestyle. Read the Taazabites blog."
                canonical="https://www.taazabites.in/blog"
                breadcrumbs={[
                    { name: 'Home', item: 'https://www.taazabites.in/' },
                    { name: 'Blog', item: 'https://www.taazabites.in/blog' }
                ]}
            />

            {/* Premium Radial Background Gradients */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#059669]/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
            <div className="absolute bottom-1/3 left-10 w-[600px] h-[600px] bg-orange-400/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                {/* Modern Centered Editorial Header */}
                <header className="text-center mb-16 sm:mb-20">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-[#059669]/10 rounded-full text-xs font-semibold text-[#059669] mb-4 sm:mb-6 uppercase tracking-widest"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        A Biological OS for Nutrition
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-light text-gray-900 mb-6 tracking-tight leading-tight"
                    >
                        The Taazabites <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#059669] to-emerald-600 font-normal">Journal</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-gray-600 font-light max-w-2xl mx-auto text-base sm:text-xl leading-relaxed px-4 sm:px-0"
                    >
                        Deep biological insights on metabolic recovery, fat-loss mathematics, and clean eating in Namma Bengaluru.
                    </motion.p>
                </header>

                {/* Search & Dynamic Filter controls */}
                <section className="mb-12 sm:mb-16 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col gap-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search Field */}
                        <div className="relative w-full md:w-96">
                            <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                                <Search className="w-5 h-5" />
                            </span>
                            <input 
                                type="text" 
                                placeholder="Search articles, keywords, tags..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-[#059669]/40 focus:ring-1 focus:ring-[#059669]/20 focus:outline-none transition-all text-sm text-gray-700 font-light"
                            />
                        </div>

                        {/* Category Navigation */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
                            <Filter className="w-4 h-4 text-gray-400 hidden lg:block shrink-0" />
                            <div className="flex gap-1.5 shrink-0">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 relative whitespace-nowrap ${
                                            selectedCategory === cat 
                                                ? 'text-white' 
                                                : 'text-gray-500 hover:text-[#059669] hover:bg-gray-100'
                                        }`}
                                    >
                                        {selectedCategory === cat && (
                                            <motion.div 
                                                layoutId="activeCategory"
                                                className="absolute inset-0 bg-[#059669] rounded-xl -z-10"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SEO/AEO-Optimized Quick Tags for Fast Navigation */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 text-xs">
                        <span className="text-gray-400 font-mono font-medium uppercase tracking-wider mr-1">Trending Topics:</span>
                        {[
                            { label: "PCOS Diet", term: "pcos" },
                            { label: "High Protein Veg", term: "veg" },
                            { label: "Calorie Deficit Math", term: "math" },
                            { label: "Keto Plan", term: "keto" },
                            { label: "Millets", term: "millet" },
                            { label: "Food Safety (FSSAI)", term: "fssai" },
                            { label: "Eco-Friendly Trays", term: "eco-friendly" }
                        ].map((item) => (
                            <button
                                key={item.term}
                                onClick={() => {
                                    setSearchQuery(item.term);
                                    setSelectedCategory('All');
                                }}
                                className={`px-3 py-1 rounded-full border text-[11px] font-medium transition-all ${
                                    searchQuery.toLowerCase() === item.term 
                                        ? 'bg-[#059669]/10 text-[#059669] border-[#059669]/30 font-bold shadow-sm' 
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                                }`}
                            >
                                #{item.label}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Featured Horizontal Hero Post */}
                {featuredPost && (
                    <motion.article 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        onClick={() => onNavigate('/blog/' + featuredPost.id)}
                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#059669]/20 border border-gray-100 transition-all duration-500 cursor-pointer group mb-16 relative flex flex-col lg:flex-row h-full min-h-[460px]"
                    >
                        {/* Featured Image overlay */}
                        <div className="w-full lg:w-1/2 h-72 sm:h-96 lg:h-auto relative overflow-hidden">
                            <LazyImage 
                                src={getOptimizedImageUrl(featuredPost.imageUrl, 1000)} 
                                alt={featuredPost.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                            />
                            <div className="absolute top-6 left-6 z-10">
                                <span className="bg-[#059669] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                                    Featured Article
                                </span>
                            </div>
                        </div>

                        {/* Featured Details */}
                        <div className="p-8 sm:p-12 lg:w-1/2 flex flex-col justify-center">
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4 font-mono">
                                <span className="text-[#059669] font-bold uppercase tracking-wider">{featuredPost.category}</span>
                                <span>•</span>
                                <time dateTime={new Date(featuredPost.date).toISOString()}>{featuredPost.date}</time>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{featuredPost.readTime}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-gray-900 mb-4 leading-tight group-hover:text-[#059669] transition-colors duration-300">
                                {featuredPost.title}
                            </h2>
                            <p className="text-gray-500 font-light text-base mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669]">
                                        <Pen className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">{featuredPost.author}</p>
                                        <p className="text-[10px] text-gray-400 font-mono">Scientific Board</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#059669] group-hover:translate-x-1.5 transition-transform duration-300">
                                    Read Article <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </motion.article>
                )}

                {/* Grid Section of Blog Posts */}
                {filteredPosts.length > 0 ? (
                    <div className="flex overflow-x-auto pb-10 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 snap-x snap-mandatory scrollbar-hide">
                        <AnimatePresence mode="popLayout">
                            {regularPosts.map((post, index) => (
                                <motion.article 
                                    layout
                                    key={post.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate('/blog/' + post.id);
                                    }}
                                    className="flex-shrink-0 w-[280px] md:w-auto snap-center bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#059669]/20 transition-all duration-500 cursor-pointer group flex flex-col h-full border border-gray-100"
                                    itemScope
                                    itemType="https://schema.org/BlogPosting"
                                >
                                    {/* Card Image */}
                                    <div className="relative h-56 sm:h-64 overflow-hidden shrink-0">
                                        <LazyImage 
                                            src={getOptimizedImageUrl(post.imageUrl, 600)} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            itemProp="image"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold text-[#059669] uppercase tracking-widest shadow-sm" itemProp="articleSection">
                                                {post.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Card content */}
                                    <div className="p-6 sm:p-8 flex flex-col flex-grow">
                                        <div className="flex items-center text-[10px] text-gray-400 mb-3 font-mono tracking-wider">
                                            <time dateTime={new Date(post.date).toISOString()} itemProp="datePublished">{post.date}</time>
                                            <span className="mx-2 text-gray-300">•</span>
                                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{post.readTime}</span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-serif text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-[#059669] transition-colors duration-300" itemProp="headline">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-500 font-light text-xs sm:text-sm line-clamp-3 mb-6 flex-grow leading-relaxed" itemProp="abstract">
                                            {post.excerpt}
                                        </p>
                                        <div className="mt-auto">
                                            {/* Tag badges */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {post.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-55 px-2 py-0.5 rounded flex items-center">
                                                        <Hash className="w-2 h-2 mr-0.5 text-[#059669]/60" /> {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                                <div className="flex items-center gap-2" itemProp="author" itemScope itemType="https://schema.org/Person">
                                                    <div className="w-7 h-7 rounded-full bg-[#059669]/10 flex items-center justify-center">
                                                        <Pen className="text-[10px] text-[#059669]"/>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-none" itemProp="name">{post.author.split(',')[0]}</span>
                                                </div>
                                                <span className="text-[#059669] text-sm group-hover:translate-x-1 transition-transform duration-300">
                                                    <ArrowRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-md mx-auto"
                    >
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-serif text-gray-900 mb-2">No matching posts found</h3>
                        <p className="text-gray-500 font-light text-sm mb-6">We couldn't find any articles matching "{searchQuery}". Try refining your keywords.</p>
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="px-5 py-2.5 bg-[#059669] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm"
                        >
                            Reset Filters
                        </button>
                    </motion.div>
                )}
            </div>
        </main>
    );
};
