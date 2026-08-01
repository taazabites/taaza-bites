import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function SuccessConfetti() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      color: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 4)],
      rotation: Math.random() * 360,
      duration: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ 
            opacity: 1, 
            y: '100vh', 
            x: `${p.x}vw`, 
            rotate: 0,
            scale: 0
          }}
          animate={{ 
            opacity: 0, 
            y: '-10vh', 
            x: `${p.x + (Math.random() * 20 - 10)}vw`,
            rotate: p.rotation + 720,
            scale: 1
          }}
          transition={{ 
            duration: p.duration, 
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
}
