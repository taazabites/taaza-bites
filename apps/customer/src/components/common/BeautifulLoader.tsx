import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface BeautifulLoaderProps {
  message?: string;
}

export default function BeautifulLoader({ message = "Preparing your nutritional protocol..." }: BeautifulLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {/* Animated Plate */}
      <div className="relative w-24 h-24 mb-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[6px] border-emerald-500/10 border-t-emerald-600 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 bg-gradient-to-br from-emerald-600 to-primary-dark rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/20"
        >
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </motion.div>
      </div>
      
      {/* Animated Dots */}
      <div className="flex gap-2.5 mb-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -6, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-2 h-2 bg-emerald-600 rounded-full"
          />
        ))}
      </div>
      
      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-emerald-950 font-black text-xs uppercase tracking-[0.2em] max-w-[240px] leading-loose"
      >
        {message}
      </motion.p>
    </div>
  );
}
