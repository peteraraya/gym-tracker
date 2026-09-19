'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from '@/components/icons/lucide';
import { soundManager } from '@/lib/audio/soundSystem';

const CONFETTI_COLORS = [
  'bg-yellow-400', 'bg-indigo-400', 'bg-emerald-400',
  'bg-blue-400', 'bg-violet-400', 'bg-orange-400', 'bg-cyan-400',
];

const Particle: React.FC<{ index: number }> = ({ index }) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = `${(index * 7.3 + 5) % 95}%`;
  const delay = (index * 0.1) % 0.8;
  const size = index % 3 === 0 ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const isRect = index % 4 === 0;

  return (
    <motion.div
      className={`absolute top-0 ${size} ${color} ${isRect ? 'rounded-sm' : 'rounded-full'} opacity-90`}
      style={{ left }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: ['0%', '100vh'],
        rotate: [0, index % 2 === 0 ? 360 : -360],
        opacity: [1, 1, 0],
        x: [0, (index % 2 === 0 ? 30 : -30)],
      }}
      transition={{
        duration: 1.5 + (index % 4) * 0.3,
        delay,
        ease: 'easeIn',
      }}
    />
  );
};

export const PRCelebration: React.FC<{
  show: boolean;
  onComplete: () => void;
  title?: string;
  subtitle?: string;
}> = ({ show, onComplete, title = '¡Nuevo Récord!', subtitle = 'Superaste tu marca anterior' }) => {
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, []); 

  useEffect(() => {
    if (show) {
      try {
        navigator.vibrate?.([50, 50, 50, 50, 150]);
        soundManager.playRestCompleteSound(); // Reutilizamos este sonido de campanita
      } catch {}

      const t = setTimeout(() => {
        onCompleteRef.current();
      }, 3000); // Se oculta en 3 segundos

      return () => clearTimeout(t);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {/* Confetti (solo un burst) */}
          {Array.from({ length: 30 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}

          {/* Banner central de PR */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 border-2 border-yellow-400 rounded-3xl p-6 shadow-2xl shadow-yellow-500/20 flex flex-col items-center max-w-[80vw]"
          >
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-yellow-500/40">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 text-center">
              {title}
            </h2>
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 text-center">
              {subtitle}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
