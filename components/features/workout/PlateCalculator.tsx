'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEquipment } from '@/context/EquipmentContext';

interface PlateCalculatorProps {
  targetWeight: number; // Peso total objetivo (barra + discos)
  barWeight?: number; // Peso de la barra vacía (por defecto 20kg)
  availablePlates?: number[]; // Discos disponibles (por defecto [25, 20, 15, 10, 5, 2.5, 1.25])
}

interface PlateCalculation {
  plateWeight: number;
  count: number; // Por lado
  color: string;
}

const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATE_COLORS: Record<number, string> = {
  25: 'bg-red-500',
  20: 'bg-blue-600',
  15: 'bg-yellow-500',
  10: 'bg-green-500',
  5: 'bg-white border-2 border-gray-300 dark:border-gray-600 text-gray-800',
  2.5: 'bg-gray-800 border border-gray-600 text-white',
  1.25: 'bg-gray-400 text-gray-900',
};

export function PlateCalculator({
  targetWeight,
  barWeight = 20,
  availablePlates = DEFAULT_PLATES,
}: PlateCalculatorProps) {
  
  const calculation = useMemo(() => {
    if (targetWeight <= barWeight) {
      return { plates: [], remainingWeight: targetWeight - barWeight };
    }

    const weightForPlates = targetWeight - barWeight;
    const weightPerSide = weightForPlates / 2;
    
    let currentWeight = weightPerSide;
    const platesToUse: PlateCalculation[] = [];
    
    // Sort plates descending
    const sortedPlates = [...availablePlates].sort((a, b) => b - a);
    
    for (const plate of sortedPlates) {
      if (currentWeight >= plate) {
        const count = Math.floor(currentWeight / plate);
        platesToUse.push({
          plateWeight: plate,
          count,
          color: PLATE_COLORS[plate] || 'bg-gray-700 text-white'
        });
        currentWeight -= count * plate;
      }
    }
    
    // Si no logramos exactitud, la remainingWeight será > 0 (por lado)
    // Multiplicamos por 2 para el remaining total
    return { plates: platesToUse, remainingWeight: currentWeight * 2 };
  }, [targetWeight, barWeight, availablePlates]);

  if (targetWeight <= 0) return null;

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl p-3 shadow-inner">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Calculadora de Discos</span>
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Barra: {barWeight}kg</span>
      </div>
      
      {targetWeight < barWeight ? (
        <div className="text-center py-2 text-sm text-red-500 font-semibold">
          El peso es menor que la barra vacía ({barWeight}kg)
        </div>
      ) : targetWeight === barWeight ? (
        <div className="text-center py-2 text-sm text-blue-500 font-semibold">
          Solo la barra vacía ({barWeight}kg)
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Visualización de la barra */}
          <div className="flex items-center justify-center h-16 w-full max-w-[280px]">
            {/* Barra izquierda (resto de barra) */}
            <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-l-sm min-w-[20px]" />

            {/* Discos (lado izquierdo) */}
            <div className="flex items-center">
              <AnimatePresence>
                {[...calculation.plates.flatMap((p, plateIdx) => 
                  Array.from({ length: p.count }).map((_, i) => {
                    const height = p.plateWeight >= 20 ? 'h-14' : p.plateWeight >= 10 ? 'h-10' : p.plateWeight >= 5 ? 'h-8' : 'h-6';
                    const width = p.plateWeight >= 15 ? 'w-3' : 'w-2';
                    return { key: `${p.plateWeight}-${plateIdx}-${i}`, height, width, color: p.color };
                  })
                )].reverse().map((p) => (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, x: 10 }}
                    animate={{ scale: 1, opacity: 1, x: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={`left-${p.key}`}
                    className={`${p.height} ${p.width} ${p.color} mx-[1px] rounded-sm shadow-sm flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10`}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {/* Tope izquierdo */}
            <div className="w-1.5 h-6 bg-gray-400 dark:bg-gray-500 rounded-sm z-10" />
            
            {/* Espacio para la cabeza/manos (centro de la barra) */}
            <div className="w-12 h-3 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-[8px] font-bold text-gray-500">{barWeight}</span>
            </div>
            
            {/* Tope derecho */}
            <div className="w-1.5 h-6 bg-gray-400 dark:bg-gray-500 rounded-sm z-10" />
            
            {/* Discos (lado derecho) */}
            <div className="flex items-center">
              <AnimatePresence>
                {calculation.plates.flatMap((p, plateIdx) => 
                  Array.from({ length: p.count }).map((_, i) => {
                    const height = p.plateWeight >= 20 ? 'h-14' : p.plateWeight >= 10 ? 'h-10' : p.plateWeight >= 5 ? 'h-8' : 'h-6';
                    const width = p.plateWeight >= 15 ? 'w-3' : 'w-2';
                    const key = `${p.plateWeight}-${plateIdx}-${i}`;
                    
                    return (
                      <motion.div
                        initial={{ scale: 0, opacity: 0, x: -10 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        key={`right-${key}`}
                        className={`${height} ${width} ${p.color} mx-[1px] rounded-sm shadow-sm flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10`}
                      />
                    );
                  })
                )}
              </AnimatePresence>
            </div>
            
            {/* Resto de la barra derecha */}
            <div className="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-r-sm min-w-[20px]" />
          </div>
          
          {/* Leyenda (por lado) */}
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {calculation.plates.map(p => (
              <div key={p.plateWeight} className="flex items-center gap-1 bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                <span className={`w-2 h-2 rounded-full ${p.color}`} />
                <span className="text-[10px] font-bold">{p.count} × {p.plateWeight}kg</span>
              </div>
            ))}
          </div>
          
          {calculation.remainingWeight > 0 && (
            <div className="mt-1 text-[10px] text-orange-500 font-semibold">
              Faltan {calculation.remainingWeight}kg (no hay discos exactos)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
