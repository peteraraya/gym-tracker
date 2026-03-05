'use client';

import React, { useState } from 'react';
import { MuscleGroup, MUSCLE_GROUPS } from '@/data/exercises';

interface BodyMapProps {
  selectedMuscles: MuscleGroup[];
  onMuscleClick: (muscle: MuscleGroup) => void;
}

export const AnatomicalBodyMap: React.FC<BodyMapProps> = ({ 
  selectedMuscles, 
  onMuscleClick 
}) => {
  const [hovered, setHovered] = useState<MuscleGroup | null>(null);
  const [tapped, setTapped] = useState<MuscleGroup | null>(null);
  
  const getMuscleName = (muscle: MuscleGroup): string => {
    return MUSCLE_GROUPS.find(m => m.id === muscle)?.name || muscle;
  };

  const isSelected = (muscle: MuscleGroup) => selectedMuscles.includes(muscle);
  const isActive = (muscle: MuscleGroup) => isSelected(muscle) || hovered === muscle || tapped === muscle;

  const handleAreaClick = (muscle: MuscleGroup, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    // Si ya está tapped, hacer clic lo selecciona
    if (tapped === muscle) {
      onMuscleClick(muscle);
      setTapped(null);
    } else {
      // Primer tap: mostrar tooltip
      setTapped(muscle);
      
      // Auto-ocultar tooltip después de 2 segundos
      setTimeout(() => {
        setTapped(null);
      }, 2000);
    }
  };

  // Cerrar tooltip al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (tapped) {
        setTapped(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [tapped]);

  // Estilos para áreas activas
  const getAreaStyle = (muscle: MuscleGroup) => ({
    fill: isActive(muscle) ? 'rgba(59, 130, 246, 0.4)' : 'transparent',
    stroke: isActive(muscle) ? '#3b82f6' : 'transparent',
    strokeWidth: isActive(muscle) ? '3' : '0',
    filter: isActive(muscle) ? 'url(#glow)' : 'none',
  });

  const displayedMuscle = tapped || hovered;

  return (
    <>
      {/* Tooltip flotante */}
      {displayedMuscle && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold text-lg animate-fade-in border-2 border-blue-400">
            {getMuscleName(displayedMuscle)}
          </div>
        </div>
      )}

      <div className="flex justify-center items-start gap-4 md:gap-8">
        {/* Vista Frontal */}
        <div className="relative">
          <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Vista Frontal
          </h3>
          
          <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 shadow-lg overflow-hidden">
            {/* SVG anatómico con áreas clicables */}
            <svg
              viewBox="70 0 180 500"
              className="w-full h-auto"
              style={{ width: '100%', maxWidth: '180px', height: 'auto', aspectRatio: '180/500' }}
            >
              <defs>
                {/* Efecto de brillo */}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Imagen de fondo del SVG anatómico - solo figura frontal (izquierda) */}
              <image
                href="/svg/human-men.svg"
                x="0"
                y="0"
                width="500"
                height="500"
                preserveAspectRatio="xMidYMid meet"
                opacity="0.9"
              />

              {/* Áreas clicables overlay - Vista Frontal */}
              
              {/* Cuello */}
              <rect
                x="150" y="85" width="40" height="20"
                {...getAreaStyle('cuello')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('cuello')}
                onMouseEnter={() => setHovered('cuello')}
                onMouseLeave={() => setHovered(null)}
                rx="5"
              />

              {/* Hombros */}
              <ellipse
                cx="125" cy="120"
                rx="20" ry="18"
                {...getAreaStyle('hombros')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('hombros')}
                onMouseEnter={() => setHovered('hombros')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="210" cy="120"
                rx="20" ry="18"
                {...getAreaStyle('hombros')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('hombros')}
                onMouseEnter={() => setHovered('hombros')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Pecho */}
              <ellipse
                cx="150" cy="140"
                rx="20" ry="26"
                {...getAreaStyle('pecho')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('pecho')}
                onMouseEnter={() => setHovered('pecho')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="190" cy="140"
                rx="20" ry="26"
                {...getAreaStyle('pecho')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('pecho')}
                onMouseEnter={() => setHovered('pecho')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Bíceps */}
              <ellipse
                cx="115" cy="160"
                rx="14" ry="26"
                {...getAreaStyle('biceps')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('biceps')}
                onMouseEnter={() => setHovered('biceps')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="225" cy="160"
                rx="14" ry="26"
                {...getAreaStyle('biceps')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('biceps')}
                onMouseEnter={() => setHovered('biceps')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Antebrazos */}
              <ellipse
                cx="105" cy="210"
                rx="10" ry="32"
                {...getAreaStyle('antebrazos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('antebrazos')}
                onMouseEnter={() => setHovered('antebrazos')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="230" cy="210"
                rx="10" ry="32"
                {...getAreaStyle('antebrazos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('antebrazos')}
                onMouseEnter={() => setHovered('antebrazos')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Core/Abdominales */}
              <rect
                x="150" y="155" width="40" height="60"
                {...getAreaStyle('core')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('core')}
                onMouseEnter={() => setHovered('core')}
                onMouseLeave={() => setHovered(null)}
                rx="8"
              />

              {/* Piernas (cuádriceps) */}
              <rect
                x="125" y="220" width="32" height="200"
                {...getAreaStyle('piernas')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('piernas')}
                onMouseEnter={() => setHovered('piernas')}
                onMouseLeave={() => setHovered(null)}
                rx="8"
              />
              <rect
                x="180" y="220" width="28" height="200"
                {...getAreaStyle('piernas')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('piernas')}
                onMouseEnter={() => setHovered('piernas')}
                onMouseLeave={() => setHovered(null)}
                rx="8"
              />

              {/* Gemelos */}
              <ellipse
                cx="135" cy="400"
                rx="12" ry="52"
                {...getAreaStyle('gemelos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('gemelos')}
                onMouseEnter={() => setHovered('gemelos')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="201" cy="400"
                rx="12" ry="52"
                {...getAreaStyle('gemelos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('gemelos')}
                onMouseEnter={() => setHovered('gemelos')}
                onMouseLeave={() => setHovered(null)}
              />
            </svg>
          </div>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Toca para ver el nombre, toca de nuevo para seleccionar
          </p>
        </div>

        {/* Vista Trasera */}
        <div className="relative">
          <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Vista Trasera
          </h3>
          
          <div className="relative border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-3 shadow-lg overflow-hidden">
            {/* SVG anatómico con áreas clicables */}
            <svg
              viewBox="245 0 180 500"
              className="w-full h-auto"
              style={{ width: '100%', maxWidth: '180px', height: 'auto', aspectRatio: '180/500' }}
            >
              <defs>
                {/* Efecto de brillo para vista trasera */}
                <filter id="glowBack">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Imagen de fondo del SVG anatómico - solo figura trasera (derecha) */}
              <image
                href="/svg/human-men.svg"
                x="0"
                y="0"
                width="500"
                height="500"
                preserveAspectRatio="xMidYMid meet"
                opacity="0.9"
              />

              {/* Áreas clicables overlay - Vista Trasera */}
              
              {/* Cuello */}
              <rect
                x="300" y="90" width="40" height="18"
                {...getAreaStyle('cuello')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('cuello')}
                onMouseEnter={() => setHovered('cuello')}
                onMouseLeave={() => setHovered(null)}
                rx="5"
              />

              {/* Trapecio */}
              <rect
                x="280" y="110" width="80" height="32"
                {...getAreaStyle('trapecio')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('trapecio')}
                onMouseEnter={() => setHovered('trapecio')}
                onMouseLeave={() => setHovered(null)}
                rx="8"
              />

              {/* Hombros traseros */}
              <ellipse
                cx="270" cy="120"
                rx="20" ry="18"
                {...getAreaStyle('hombros')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('hombros')}
                onMouseEnter={() => setHovered('hombros')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="365" cy="120"
                rx="20" ry="18"
                {...getAreaStyle('hombros')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('hombros')}
                onMouseEnter={() => setHovered('hombros')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Espalda (dorsales) */}
              <rect
                x="280" y="122" width="35" height="88"
                {...getAreaStyle('espalda')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('espalda')}
                onMouseEnter={() => setHovered('espalda')}
                onMouseLeave={() => setHovered(null)}
                rx="6"
              />
              <rect
                x="320" y="122" width="35" height="88"
                {...getAreaStyle('espalda')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('espalda')}
                onMouseEnter={() => setHovered('espalda')}
                onMouseLeave={() => setHovered(null)}
                rx="6"
              />

              {/* Tríceps */}
              <ellipse
                cx="265" cy="170"
                rx="14" ry="26"
                {...getAreaStyle('triceps')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('triceps')}
                onMouseEnter={() => setHovered('triceps')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="375" cy="170"
                rx="14" ry="26"
                {...getAreaStyle('triceps')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('triceps')}
                onMouseEnter={() => setHovered('triceps')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Antebrazos traseros */}
              <ellipse
                cx="255" cy="205"
                rx="10" ry="32"
                {...getAreaStyle('antebrazos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('antebrazos')}
                onMouseEnter={() => setHovered('antebrazos')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="380" cy="205"
                rx="10" ry="32"
                {...getAreaStyle('antebrazos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('antebrazos')}
                onMouseEnter={() => setHovered('antebrazos')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Zona lumbar */}
              <rect
                x="300" y="210" width="40" height="32"
                {...getAreaStyle('core')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('core')}
                onMouseEnter={() => setHovered('core')}
                onMouseLeave={() => setHovered(null)}
                rx="8"
              />

              {/* Glúteos */}
              <ellipse
                cx="300" cy="245"
                rx="25" ry="36"
                {...getAreaStyle('gluteos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('gluteos')}
                onMouseEnter={() => setHovered('gluteos')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="345" cy="245"
                rx="25" ry="36"
                {...getAreaStyle('gluteos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('gluteos')}
                onMouseEnter={() => setHovered('gluteos')}
                onMouseLeave={() => setHovered(null)}
              />

              {/* Piernas traseras (isquiotibiales) */}
              <rect
                x="280" y="260" width="28" height="190"
                {...getAreaStyle('piernas')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('piernas')}
                onMouseEnter={() => setHovered('piernas')}
                onMouseLeave={() => setHovered(null)}
                rx="6"
              />
              <rect
                x="330" y="260" width="28" height="190"
                {...getAreaStyle('piernas')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('piernas')}
                onMouseEnter={() => setHovered('piernas')}
                onMouseLeave={() => setHovered(null)}
                rx="6"
              />

              {/* Gemelos traseros */}
              <ellipse
                cx="285" cy="400"
                rx="12" ry="52"
                {...getAreaStyle('gemelos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('gemelos')}
                onMouseEnter={() => setHovered('gemelos')}
                onMouseLeave={() => setHovered(null)}
              />
              <ellipse
                cx="355" cy="400"
                rx="12" ry="52"
                {...getAreaStyle('gemelos')}
                className="cursor-pointer transition-all duration-200"
                onClick={(e) => handleAreaClick('gemelos')}
                onMouseEnter={() => setHovered('gemelos')}
                onMouseLeave={() => setHovered(null)}
              />
            </svg>
          </div>
          
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Toca para ver el nombre, toca de nuevo para seleccionar
          </p>
        </div>
      </div>
    </>
  );
};
