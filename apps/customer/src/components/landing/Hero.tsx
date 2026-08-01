import { motion } from 'framer-motion';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../common/OptimizedImage';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-zinc-950">
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=70&w=1200&fm=webp" 
          alt="Healthy food bowl" 
          className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          containerClassName="w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-6 sm:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12 pt-20">
        
        <div className="flex-1 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="bg-[#FF6B35] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              🌿 100% Fresh • Zero Preservatives
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter"
          >
            Eat Clean.<br />
            <span className="text-[#F4A261]">Live With Vitality.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl leading-relaxed font-medium"
          >
            Chef-crafted, macro-calculated meals delivered fresh to your door every day in Bengaluru. 
            <br className="hidden sm:block" />
            <span className="text-[#F4A261] font-bold mt-2 inline-block">Join 10,000+ healthy eaters making the switch.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full"
          >
            <button 
              onClick={() => navigate('/plans')}
              className="group bg-[#FF6B35] hover:bg-[#E55A2B] text-white font-black py-4 sm:py-5 px-6 sm:px-10 rounded-2xl text-lg sm:text-xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#FF6B35]/40 hover:-translate-y-1"
            >
              Start Subscription
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/how-it-works')}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-bold py-4 sm:py-5 px-6 sm:px-10 rounded-2xl text-lg sm:text-xl transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
              How It Works
            </button>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-6 max-w-xl border-t border-white/10 pt-8"
          >
            {[
              { value: '10K+', label: 'Happy Eaters' },
              { value: '4.7★', label: 'Swiggy Rating' },
              { value: '100%', label: 'FSSAI Certified' },
            ].map((stat, i) => (
              <div key={i} className="text-left group cursor-default">
                <div className="text-2xl md:text-3xl font-black text-[#F4A261] mb-1 group-hover:scale-110 origin-left transition-transform">{stat.value}</div>
                <div className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring' }}
          className="hidden lg:block flex-1 relative"
        >
           <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full transform -rotate-12 translate-x-12 translate-y-12"></div>
           <OptimizedImage 
            src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=70&w=800&fm=webp" 
            alt="Healthy meal presentation" 
            className="w-full h-auto object-cover rounded-[3rem] shadow-2xl border-4 border-white/10 relative z-10"
            containerClassName="w-full h-auto"
            priority
           />
        </motion.div>

      </div>
    </section>
  );
}
