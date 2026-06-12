"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { Check, ChevronRight } from "lucide-react";

interface SwipeButtonProps {
  onComplete: () => void;
  text?: React.ReactNode;
  completedText?: React.ReactNode;
  disabled?: boolean;
}

export function SwipeButton({
  onComplete,
  text = "Desliza para completar",
  completedText = "¡Completado!",
  disabled = false,
}: SwipeButtonProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  const handleDragEnd = async (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (disabled || isCompleted) return;

    const containerWidth = containerRef.current?.offsetWidth || 300;
    const threshold = containerWidth * 0.6; // 60% para activar

    if (info.offset.x > threshold) {
      setIsCompleted(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
         navigator.vibrate([80, 30, 80]); // Haptic feedback
      }
      await controls.start({ x: containerWidth - 64 }); // 64 es aprox el width del thumb + margen
      onComplete();
    } else {
      // Revertir
      controls.start({ x: 0 });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-[72px] w-full rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl border-2 border-white/20 transition-colors duration-300 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      } ${
        isCompleted
          ? "bg-linear-to-r from-emerald-500 to-green-600"
          : "bg-linear-to-r from-green-600 to-emerald-600"
      }`}
    >
      {/* Texto de fondo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold select-none pl-8">
        {isCompleted ? completedText : text}
      </div>

      {/* Thumb para deslizar */}
      <motion.div
        drag={!disabled && !isCompleted ? "x" : false}
        dragConstraints={containerRef}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
        animate={controls}
        whileTap={!disabled && !isCompleted ? { scale: 0.95 } : undefined}
        className={`absolute left-2 top-2 bottom-2 w-14 rounded-xl flex items-center justify-center shadow-lg transition-colors ${
          disabled ? "bg-gray-200 text-gray-400" : "bg-white text-green-600 cursor-grab active:cursor-grabbing"
        }`}
      >
        {isCompleted ? (
          <Check className="w-7 h-7" />
        ) : (
          <ChevronRight className="w-7 h-7" />
        )}
      </motion.div>
    </div>
  );
}
