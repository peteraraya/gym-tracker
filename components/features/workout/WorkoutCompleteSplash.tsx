'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Dumbbell, Clock, Zap, CheckCircle } from '@/components/icons/lucide';

export interface CompleteSplashStats {
  routineName: string;
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;
  durationSeconds: number;
}

interface WorkoutCompleteSplashProps extends CompleteSplashStats {
  onComplete: () => void;
  duration?: number; // ms antes de auto-dismiss, default 3800
}

const PHRASES = [
  '¡Lo lograste!',
  '¡Brutal sesión!',
  '¡Imparable!',
  '¡Récord personal!',
  '¡Puro fuego!',
  '¡Sin límites!',
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

/** Partículas de confetti puramente CSS/Framer Motion */
const CONFETTI_COLORS = [
  'bg-yellow-400', 'bg-indigo-400', 'bg-emerald-400',
  'bg-blue-400', 'bg-violet-400', 'bg-orange-400', 'bg-cyan-400',
];

const Particle: React.FC<{ index: number }> = ({ index }) => {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = `${(index * 7.3 + 5) % 95}%`;
  const delay = (index * 0.12) % 1.4;
  const size = index % 3 === 0 ? 'w-2 h-2' : 'w-1.5 h-1.5';
  const isRect = index % 4 === 0;

  return (
    <motion.div
      className={`absolute top-0 ${size} ${color} ${isRect ? 'rounded-sm' : 'rounded-full'} opacity-90`}
      style={{ left }}
      initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: ['0%', '110vh'],
        rotate: [0, index % 2 === 0 ? 360 : -360],
        opacity: [1, 1, 0],
        x: [0, (index % 2 === 0 ? 40 : -40)],
      }}
      transition={{
        duration: 2.5 + (index % 4) * 0.3,
        delay,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay: 0.8,
      }}
    />
  );
};

export const WorkoutCompleteSplash: React.FC<WorkoutCompleteSplashProps> = ({
  routineName,
  exerciseCount,
  totalSets,
  totalVolume,
  durationSeconds,
  onComplete,
  duration = 3800,
}) => {
  const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
  const hasVolume = totalVolume > 0;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Vibración háptica en completar
    try { navigator.vibrate?.([60, 40, 100]); } catch {}

    timerRef.current = setTimeout(onComplete, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [duration, onComplete]);

  const handleTap = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onComplete();
  };

  const stats = [
    { icon: Clock, label: 'Duración', value: formatDuration(durationSeconds), color: 'text-cyan-400' },
    { icon: Dumbbell, label: 'Ejercicios', value: String(exerciseCount), color: 'text-violet-400' },
    { icon: Zap, label: 'Series', value: String(totalSets), color: 'text-yellow-400' },
    ...(hasVolume
      ? [{ icon: Flame, label: 'Volumen', value: `${totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}t` : `${totalVolume}kg`}`, color: 'text-orange-400' }]
      : []),
  ];

  return (
    <motion.div
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #1a1060 40%, #302b63 70%, #24243e 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={handleTap}
    >
      {/* Partículas de confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 22 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </div>

      {/* Glow de fondo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-violet-500/20 blur-2xl" />
      </div>

      {/* Contenido principal */}
      <div className="relative flex flex-col items-center px-6 text-center">
        {/* Trofeo animado */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/40">
              <Trophy className="w-12 h-12 text-white" strokeWidth={1.8} />
            </div>
            {/* Anillo pulsante */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-yellow-400/60"
              animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-yellow-300/40"
              animate={{ scale: [1, 1.7, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Frase motivacional */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-yellow-400 font-bold text-xl tracking-wide mb-1"
        >
          {phrase}
        </motion.p>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-white font-extrabold text-3xl leading-tight mb-1"
        >
          Entrenamiento
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white font-extrabold text-3xl leading-tight mb-2"
        >
          Completado
        </motion.h1>

        {/* Nombre de la rutina */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-white/90 text-sm font-medium">{routineName}</span>
        </motion.div>

        {/* Estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`grid gap-3 w-full max-w-xs ${stats.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          {stats.map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center gap-1 border border-white/10"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-white font-bold text-lg leading-none">{value}</span>
              <span className="text-white/50 text-[10px] uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Toca para continuar */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 1.2, duration: 1.2, repeat: Infinity }}
          className="mt-8 text-white/40 text-xs tracking-widest uppercase"
        >
          Toca para continuar
        </motion.p>
      </div>
    </motion.div>
  );
};
