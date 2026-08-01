import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { FAQService } from '../firebase/services';
import { FAQ } from '../firebase/collections';
import { Button, Card } from '../components/ui/primitives';
import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'subscription', name: 'Subscription', icon: '💳' },
  { id: 'payments', name: 'Payments', icon: '💰' },
  { id: 'delivery', name: 'Delivery', icon: '🚚' },
  { id: 'nutrition', name: 'Nutrition', icon: '🥦' },
  { id: 'refund', name: 'Refund', icon: '🔄' },
  { id: 'wallet', name: 'Wallet', icon: '👛' },
  { id: 'referral', name: 'Referral', icon: '🤝' },
  { id: 'technical', name: 'Technical', icon: '⚙️' },
];

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const data = await FAQService.getFAQs();
        setFaqs(data);
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !activeCategory || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <section className="bg-zinc-900 pt-24 pb-32 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-6">
            <HelpCircle className="h-3 w-3" /> Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            How can we <span className="text-emerald-500 text-glow-emerald">help?</span>
          </h1>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search questions, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-5 pl-14 pr-6 text-white font-bold outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-600"
            />
          </div>
        </motion.div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-16">
        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`p-6 rounded-[32px] border-2 transition-all text-center group ${
                activeCategory === cat.id 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/20' 
                  : 'bg-white border-zinc-100 text-zinc-600 hover:border-zinc-200'
              }`}
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
              <span className="text-xs font-black uppercase tracking-widest">{cat.name}</span>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* FAQ List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-zinc-50 rounded-[28px] animate-pulse" />
              ))
            ) : filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <Card 
                  key={faq.id}
                  className={`overflow-hidden border-2 transition-all ${
                    expandedId === faq.id ? 'border-emerald-500 shadow-xl shadow-emerald-500/5' : 'border-zinc-50'
                  }`}
                >
                  <button 
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4"
                  >
                    <span className="text-sm md:text-base font-black text-zinc-900 leading-snug">{faq.question}</span>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      expandedId === faq.id ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-400'
                    }`}>
                      {expandedId === faq.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedId === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="pt-2 text-zinc-500 text-sm font-medium leading-relaxed">
                          {faq.answer}
                        </div>
                        <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-4">
                          <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1 hover:gap-2 transition-all">
                            Was this helpful? <span className="text-xs">👍</span>
                          </button>
                          <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Not helpful</button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ))
            ) : (
              <div className="text-center py-20 bg-zinc-50 rounded-[40px]">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-zinc-300">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-2">No answers found</h3>
                <p className="text-zinc-500 text-sm font-medium">Try different keywords or contact our support team.</p>
              </div>
            )}
          </div>

          {/* Sidebar Support */}
          <div className="space-y-6">
            <Card className="p-8 border-emerald-100 bg-emerald-50/30 rounded-[40px]">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 text-emerald-600 shadow-lg shadow-emerald-500/10">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-black text-zinc-900 mb-2">Still stuck?</h3>
              <p className="text-sm font-medium text-zinc-500 mb-8">Our support experts are available 24/7 to help you with your meal plan.</p>
              <Button 
                onClick={() => navigate("/dashboard/support")}
                className="w-full rounded-2xl py-4 h-auto font-black text-xs uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-500/20"
              >
                Chat with Support <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4">Direct Contact</h4>
              <Card className="p-6 border-zinc-100 rounded-[32px] flex items-center justify-between hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Call Support</p>
                    <p className="text-[10px] font-bold text-zinc-400">+91 79757 71457</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-300" />
              </Card>

              <Card className="p-6 border-zinc-100 rounded-[32px] flex items-center justify-between hover:border-emerald-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-zinc-900">Email Us</p>
                    <p className="text-[10px] font-bold text-zinc-400">help@taazabites.com</p>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-zinc-300" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
