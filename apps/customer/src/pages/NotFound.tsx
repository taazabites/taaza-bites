import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Utensils } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Utensils className="w-12 h-12 text-emerald-600" />
        </motion.div>
        
        <h1 className="text-8xl font-black text-zinc-950 tracking-tightest mb-4">404</h1>
        <h2 className="text-2xl font-black text-zinc-900 mb-6">Oops! This meal is missing.</h2>
        <p className="text-zinc-500 font-medium mb-12">
          The page you're looking for doesn't exist or has been moved to a new metabolic protocol.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 h-14 rounded-2xl border-2 border-zinc-100 font-bold text-zinc-600 flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
          <button 
            onClick={() => navigate('/')}
            className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" /> Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
