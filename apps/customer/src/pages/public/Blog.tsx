import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/src/context/ToastContext";

const categories = ["Nutrition", "Metabolism", "Lifestyle", "Science", "Recipes"];

const posts = [
  {
    title: "Understanding the Glycemic Index for Longevity",
    excerpt: "How managing your insulin spikes today can add years to your life tomorrow.",
    author: "Dr. Ananya Sharma",
    date: "July 20, 2026",
    readTime: "8 min",
    category: "Science",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fm=webp&fit=crop&q=80&w=800"
  },
  {
    title: "5 Hidden Ingredients Wrecking Your Focus",
    excerpt: "Refined oils and hidden sugars are the silent killers of cognitive performance.",
    author: "Vikram Mehta",
    date: "July 15, 2026",
    readTime: "5 min",
    category: "Nutrition",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fm=webp&fit=crop&q=80&w=800"
  },
  {
    title: "Morning Routines of High-Performing Leaders",
    excerpt: "Why what you eat before 9 AM defines your entire day's output.",
    author: "Rohan Das",
    date: "July 12, 2026",
    readTime: "12 min",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fm=webp&fit=crop&q=80&w=800"
  }
];

export default function Blog() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [email, setEmail] = useState("");

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === "All" || post.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    showToast("Subscribed successfully to the TaazaBites Newsletter!", "success");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="pt-20 sm:pt-24 pb-20">
        {/* Hero Section */}
        <section className="px-6 py-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-widest mb-6">
                  Knowledge Hub
                </span>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-zinc-950 mb-8 leading-[0.85]">
                  The Science of <br/> <span className="text-emerald-600">Thriving</span>.
                </h1>
                <p className="text-xl text-zinc-500 leading-relaxed">
                  Deep dives into nutrition, biology, and lifestyle optimization from India's leading health experts.
                </p>
              </motion.div>
            </div>
            
            <div className="w-full md:w-80 relative group">
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full h-14 bg-zinc-50 border border-zinc-100 rounded-2xl pl-12 pr-4 text-sm font-medium focus:border-emerald-500 transition-all outline-none"
                placeholder="Search articles..."
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            </div>
          </div>

          {/* Featured Categories */}
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar mb-20">
            {["All", ...categories].map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCat(cat)}
                className={`px-6 py-2.5 rounded-full border text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedCat === cat 
                    ? "bg-zinc-950 text-white border-zinc-950" 
                    : "bg-white border-zinc-100 text-zinc-500 hover:border-emerald-500 hover:text-emerald-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-40">
            {filteredPosts.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                onClick={() => showToast(`Opening article: "${post.title}"`, "info")}
                className="group cursor-pointer"
              >
                <div className="aspect-[16/10] rounded-[2.5rem] overflow-hidden mb-8 relative">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-tight text-zinc-950">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </div>
                    <span>•</span>
                    <div>{post.date}</div>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-zinc-950 group-hover:text-emerald-600 transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="pt-4 flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all">
                    Read Story <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="bg-zinc-950 py-32 px-6 overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <Sparkles className="h-12 w-12 text-emerald-500 mx-auto mb-8" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-8">Get smarter about <br/> your biology.</h2>
            <p className="text-zinc-400 text-xl mb-12 max-w-xl mx-auto">
              Join 50,000+ members who receive our weekly insights on metabolic health.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <input 
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 text-white px-6 focus:border-emerald-500 outline-none" 
                placeholder="Enter your email" 
              />
              <button type="submit" className="h-16 px-10 rounded-2xl bg-emerald-600 text-white font-black text-lg hover:bg-emerald-700 transition-all cursor-pointer">
                Join Now
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
