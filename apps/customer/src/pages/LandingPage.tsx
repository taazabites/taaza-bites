import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Activity, Zap, Play, Sparkles, Star
} from 'lucide-react';
import { Button } from '../components/ui/primitives';
import { Image } from '../components/ui/Image';
import OptimizedImage from '../components/common/OptimizedImage';

// Modular Components
import TrustBadges from '../components/landing/TrustBadges';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturedMeals from '../components/landing/FeaturedMeals';
import MealCarousel from '../components/landing/MealCarousel';
import ComparisonTable from '../components/landing/ComparisonTable';
import SpecializedPlans from '../components/landing/SpecializedPlans';
import PlansPreview from '../components/landing/PlansPreview';
import Reviews from '../components/landing/Reviews';
import TrustSection from '../components/landing/TrustSection';
import FAQ from '../components/landing/FAQ';
import CTA from '../components/landing/CTA';

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-emerald-200 selection:text-emerald-900 w-full overflow-x-hidden relative">
      <Helmet>
        <title>TaazaBites | Fresh Healthy Daily Meals Delivered in Bengaluru</title>
        <meta name="description" content="Fresh, home-cooked, healthy meals delivered daily. Macro-calculated, zero seed oils, customized to your fitness goals." />
      </Helmet>

      <main className="w-full max-w-full overflow-x-hidden pb-24 md:pb-0">
        {/* 1. NEW HERO SECTION */}
        <section className="relative pt-24 md:pt-32 pb-12 px-4 md:px-6 min-h-[90vh] flex flex-col justify-center items-center overflow-hidden w-full bg-white dark:bg-zinc-950">
          <div className="absolute inset-0 pointer-events-none w-full max-w-full overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[600px] bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-900/10 dark:to-transparent" />
          </div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-left"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-700">Bengaluru's #1 Healthy Meal Plan</span>
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.95] mb-8">
                Healthy meals <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600">delivered daily.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-medium max-w-xl mb-12 leading-relaxed">
                Wholesome, chef-curated lunches and dinners tailored to your specific fitness goals. Zero seed oils, fresh ingredients, and macro-calculated for perfection.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  onClick={() => navigate('/health-assessment')}
                  className="w-full sm:w-auto h-16 px-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border-0"
                >
                  Get Free Diet Assessment <Activity className="w-5 h-5" />
                </Button>
                
                <Button 
                  onClick={() => navigate('/plans')}
                  className="w-full sm:w-auto h-16 px-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-black text-sm uppercase tracking-widest border border-zinc-200 transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  Start Subscription <Zap className="h-5 w-5 fill-zinc-900" />
                </Button>
              </div>

              {/* Trust Badges Integration */}
              <div className="hidden lg:block">
                 <TrustBadges />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl shadow-emerald-900/20 border-8 border-white dark:border-zinc-900 aspect-square">
                 <OptimizedImage 
                   src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800" 
                   alt="Healthy Meal" 
                   className="w-full h-full object-cover"
                   priority={true}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                    <div className="text-white">
                       <p className="text-4xl font-black tracking-tighter mb-2">Fresh. Clean. Tasty.</p>
                       <p className="font-bold opacity-80">No more meal prep stress.</p>
                    </div>
                 </div>
              </div>
              {/* Floating Element 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl z-20 border border-zinc-100 dark:border-white/5"
              >
                <p className="text-emerald-600 font-black text-3xl">550</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Calories / Meal</p>
              </motion.div>
              {/* Floating Element 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-zinc-900 p-6 rounded-3xl shadow-xl z-20 border border-zinc-100 dark:border-white/5"
              >
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm font-black text-zinc-900 dark:text-white">"Simply Incredible"</p>
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:hidden w-full">
            <TrustBadges />
          </div>
        </section>

        {/* 2. HOW IT WORKS */}
        <HowItWorks />

        {/* 3. SUBSCRIPTION PLANS PREVIEW */}
        <PlansPreview />

        {/* 4. SPECIALIZED SOLUTIONS */}
        <SpecializedPlans />

        {/* 5. COMPARISON TABLE */}
        <ComparisonTable />

        {/* 5. FEATURED MEALS CAROUSEL */}
        <MealCarousel />

        {/* 6. SOCIAL PROOF (TRANSFORMATIONS & REVIEWS) */}
        <Reviews />

        {/* 6. TRUST SECTION (KITCHEN & HYGIENE) */}
        <TrustSection />

        {/* 7. FAQ */}
        <FAQ />

        {/* 8. FINAL CTA */}
        <CTA />

      </main>

      {/* STICKY BOTTOM CTA (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-100 dark:border-white/5 z-50">
         <Button 
            onClick={() => navigate('/health-assessment')}
            className="w-full h-14 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-transform cursor-pointer"
         >
            Get Free Diet Assessment
         </Button>
      </div>

    </div>
  );
}


