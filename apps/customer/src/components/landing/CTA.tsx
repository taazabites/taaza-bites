import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 px-4 bg-emerald-700 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-white rounded-full blur-[100px] md:blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-yellow-400 rounded-full blur-[100px] md:blur-[120px] translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-yellow-300 font-bold uppercase tracking-widest text-sm mb-6 block">Ready to eat better?</span>
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black mb-8 tracking-tighter leading-tight md:leading-none px-4">
            Start Your Healthy <br className="hidden md:block" /> Eating Journey Today
          </h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-10 md:mb-12 max-w-2xl mx-auto font-medium opacity-90 leading-relaxed px-4">
            Join thousands of happy people in Bengaluru who enjoy fresh, delicious meals delivered daily.
          </p>
          
          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-12 md:mb-16 max-w-3xl mx-auto px-4">
            {[
              "Easy to Start",
              "No Hidden Fees",
              "Cancel Anytime",
            ].map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10"
              >
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                <span className="text-xs md:text-sm font-bold uppercase tracking-wide">{benefit}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-6 sm:px-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/menu')}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-black py-4 md:py-5 px-8 md:px-12 rounded-full text-lg md:text-xl transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              See Our Menu
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/support')}
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black py-4 md:py-5 px-8 md:px-12 rounded-full text-lg md:text-xl transition-all border border-white/20 text-center cursor-pointer"
            >
              Contact Us
            </motion.button>
          </div>
          
          {/* Trust Ticker */}
          <div className="mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-90 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-emerald-700 font-black text-lg md:text-xl">4.9</span>
              </div>
              <div className="text-left">
                <div className="font-black text-white text-base md:text-lg">Google</div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-yellow-300">Reviews</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" />
              </div>
              <div className="text-left">
                <div className="font-black text-white text-base md:text-lg">FSSAI</div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-yellow-300">Certified</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-emerald-700" />
              </div>
              <div className="text-left">
                <div className="font-black text-white text-base md:text-lg">10K+</div>
                <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-yellow-300">Happy Users</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
