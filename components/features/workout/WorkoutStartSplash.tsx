'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell } from 'lucide-react';

interface WorkoutStartSplashProps {
  routineName: string;
  exerciseCount: number;
  totalSets: number;
  /** Duración en ms antes de auto-cerrar. Default: 2800 */
  duration?: number;
  onComplete: () => void;
}

const MOTIVATIONAL = [
  '¡Hoy te superas!',
  '¡A por todas!',
  '¡Tú puedes!',
  '¡Vamos con todo!',
  '¡Es hora de brillar!',
  '¡Sin excusas!',
];

/**
 * Pantalla de inicio animada al comenzar un nuevo entrenamiento.
 * Se auto-cierra tras `duration` ms o al tocar la pantalla.
 */
export function WorkoutStartSplash({
  routineName,
  exerciseCount,
  totalSets,
  duration = 2800,
  onComplete,
}: WorkoutStartSplashProps) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);

  // Frase motivacional aleatoria (fija para este montaje)
  const [phrase] = useState(
    () => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)],
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Barra de progreso y auto-cierre
  useEffect(() => {
    const step = 16; // ~60fps
    const increment = (step / duration) * 100;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      setProgress(Math.min(current, 100));
      if (current >= 100) {
        clearInterval(interval);
        onCompleteRef.current();
      }
    }, step);

    return () => clearInterval(interval);
  }, [duration]);

  // Vibración suave al aparecer (mobile)
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  }, []);

  // Dimensiones del SVG de progreso circular
  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.25 }}
      onClick={() => onCompleteRef.current()}
      className="fixed inset-0 z-9999 flex flex-col items-center justify-center cursor-pointer select-none"
      aria-label="Iniciando entrenamiento — toca para empezar ya"
    >
      {/* Fondo degradado animado */}
      <motion.div
        className="absolute inset-0 bg-linear-to-br from-indigo-900 via-blue-900 to-purple-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Partículas decorativas */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10"
          style={{
            width: 8 + i * 4,
            height: 8 + i * 4,
            top: `${15 + i * 12}%`,
            left: `${10 + ((i * 37) % 80)}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Contenido central */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">

        {/* Ícono con ring de progreso */}
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            className="-rotate-90"
          >
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth={strokeWidth}
            />
            {/* Progreso */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#splashGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.016s linear' }}
            />
            <defs>
              <linearGradient id="splashGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>

          {/* Ícono central */}
          <motion.div
            className="absolute flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <Dumbbell className="w-10 h-10 text-white" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Frase motivacional */}
        <motion.p
          className="text-blue-300 font-semibold text-lg tracking-wide uppercase"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {phrase}
        </motion.p>

        {/* Nombre de la rutina */}
        <motion.h1
          className="text-white font-bold text-3xl leading-tight drop-shadow-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
        >
          {routineName}
        </motion.h1>

        {/* Estadísticas */}
        <motion.div
          className="flex gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex flex-col items-center">
            <span className="text-white font-bold text-2xl">{exerciseCount}</span>
            <span className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">
              {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
            </span>
          </div>
          {totalSets > 0 && (
            <>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-white font-bold text-2xl">{totalSets}</span>
                <span className="text-blue-200 text-xs uppercase tracking-wide mt-0.5">
                  {totalSets === 1 ? 'serie' : 'series'}
                </span>
              </div>
            </>
          )}
        </motion.div>

        {/* Tap to start hint */}
        <motion.p
          className="text-white/50 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0] }}
          transition={{ delay: 0.8, duration: 1.6, repeat: Infinity }}
        >
          Toca para empezar ya
        </motion.p>
      </div>
    </motion.div>
  );
}
