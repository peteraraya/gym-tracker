'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreparationCountdownProps {
  duration?: number; // segundos, default 3
  onComplete: () => void;
  exerciseName: string;
  setNumber: number;
}

export function PreparationCountdown({ 
  duration = 3, 
  onComplete, 
  exerciseName,
  setNumber 
}: PreparationCountdownProps) {
  const [count, setCount] = useState(duration);
  const [isActive, setIsActive] = useState(true);
  const onCompleteRef = React.useRef(onComplete);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Inicializar AudioContext una sola vez y cerrarlo al desmontar
  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Mantener la referencia actualizada sin causar re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isActive) return;

    if (count === 0) {
      // Llamar después de un pequeño delay para mostrar "¡YA!"
      const completeTimer = setTimeout(() => {
        onCompleteRef.current();
      }, 500);
      return () => clearTimeout(completeTimer);
    }

    // Vibración en cada segundo (si está disponible)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Sonido opcional (beep) — usa el AudioContext ya inicializado arriba
    try {
      const ctx = audioCtxRef.current;
      if (ctx) {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = count === 1 ? 800 : 600; // Tono más alto en el último segundo
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      // Silenciar errores de audio
    }

    const timer = setTimeout(() => {
      setCount(count - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, isActive]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="text-center px-6">
        {/* Nombre del ejercicio */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-5"
        >
          <h2 className="text-2xl font-bold text-white mb-2">
            {exerciseName}
          </h2>
          <p className="text-lg text-zinc-300">
            Serie {setNumber}
          </p>
        </motion.div>

        {/* Countdown */}
        <AnimatePresence mode="wait">
          {count > 0 ? (
            <motion.div
              key={count}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mb-5"
            >
              <div className="text-9xl font-bold text-white drop-shadow-2xl">
                {count}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="go"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="mb-5"
            >
              <div className="text-7xl font-bold text-green-400 drop-shadow-2xl">
                ¡YA!
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instrucción */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-zinc-300 text-lg"
        >
          {count > 0 ? 'Prepárate...' : 'Ejecuta tu serie'}
        </motion.p>
      </div>
    </motion.div>
  );
}
