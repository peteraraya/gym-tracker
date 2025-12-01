'use client';

import React, { useState } from 'react';
import { MuscleGroup } from '@/data/exercises';

interface BodyMapProps {
  selectedMuscles: MuscleGroup[];
  onMuscleClick: (muscle: MuscleGroup) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({ selectedMuscles, onMuscleClick }) => {
  const isSelected = (muscle: MuscleGroup) => selectedMuscles.includes(muscle);
  const [hovered, setHovered] = useState<MuscleGroup | null>(null);
  const isActive = (muscle: MuscleGroup) => isSelected(muscle) || hovered === muscle;

  return (
    <div className="flex justify-center items-center gap-8">
      {/* Vista Frontal */}
      <div className="relative">
        <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Vista Frontal
        </h3>
        <svg
          width="220"
          height="500"
          viewBox="0 0 220 500"
          className="body-map-svg border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-2"
          role="img"
          aria-label="Mapa del cuerpo humano - vista frontal"
        >
          <defs>
            <linearGradient id="muscleGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary-light)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Head - anatomical shape */}
          <g>
            <path d="M 110 10 Q 95 10 88 18 Q 84 24 84 32 Q 84 40 88 46 Q 92 50 98 52 L 98 56 Q 98 60 102 60 L 118 60 Q 122 60 122 56 L 122 52 Q 128 50 132 46 Q 136 40 136 32 Q 136 24 132 18 Q 125 10 110 10 Z" 
              fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            {/* Neck */}
            <path d="M 102 60 L 102 78 L 118 78 L 118 60" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          </g>

          {/* Shoulders (anatomical deltoids) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('hombros')}
            onClick={() => onMuscleClick('hombros')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('hombros'); }}
            onMouseEnter={() => setHovered('hombros')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('hombros')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
            aria-label="Hombros"
          >
            {/* Left shoulder */}
            <path className="muscle" d="M 78 78 Q 68 80 60 88 Q 54 95 54 104 L 60 112 Q 68 110 76 106 Q 82 100 84 92 Z" 
              fill={isActive('hombros') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('hombros') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Hombros</title>
            </path>
            {/* Right shoulder */}
            <path className="muscle" d="M 142 78 Q 152 80 160 88 Q 166 95 166 104 L 160 112 Q 152 110 144 106 Q 138 100 136 92 Z" 
              fill={isActive('hombros') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('hombros') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Hombros</title>
            </path>
          </g>

          {/* Chest (pectorals with anatomical shape) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('pecho')}
            onClick={() => onMuscleClick('pecho')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('pecho'); }}
            onMouseEnter={() => setHovered('pecho')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('pecho')}
            onBlur={() => setHovered(null)}
            aria-label="Pecho"
            className="cursor-pointer"
          >
            {/* Left pec */}
            <path className="muscle" d="M 84 92 Q 88 86 96 82 Q 106 80 110 82 L 110 110 Q 108 120 102 126 Q 96 130 88 128 Q 82 120 82 110 Z" 
              fill={isActive('pecho') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('pecho') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Pecho</title>
            </path>
            {/* Right pec */}
            <path className="muscle" d="M 136 92 Q 132 86 124 82 Q 114 80 110 82 L 110 110 Q 112 120 118 126 Q 124 130 132 128 Q 138 120 138 110 Z" 
              fill={isActive('pecho') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('pecho') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Pecho</title>
            </path>
          </g>

          {/* Arms (biceps + forearms with anatomical curves) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('brazos')}
            onClick={() => onMuscleClick('brazos')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('brazos'); }}
            onMouseEnter={() => setHovered('brazos')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('brazos')}
            onBlur={() => setHovered(null)}
            aria-label="Brazos"
            className="cursor-pointer"
          >
            {/* Left upper arm */}
            <path className="muscle" d="M 60 112 Q 52 114 48 122 Q 44 132 44 145 Q 46 156 52 162 L 60 160 Q 62 150 62 138 Q 62 124 60 112 Z" 
              fill={isActive('brazos') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Left forearm */}
            <path className="muscle" d="M 52 162 Q 48 170 46 182 Q 44 194 44 206 Q 46 214 50 218 L 56 216 Q 58 206 58 194 Q 58 178 56 168 Z" 
              fill={isActive('brazos') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Right upper arm */}
            <path className="muscle" d="M 160 112 Q 168 114 172 122 Q 176 132 176 145 Q 174 156 168 162 L 160 160 Q 158 150 158 138 Q 158 124 160 112 Z" 
              fill={isActive('brazos') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Right forearm */}
            <path className="muscle" d="M 168 162 Q 172 170 174 182 Q 176 194 176 206 Q 174 214 170 218 L 164 216 Q 162 206 162 194 Q 162 178 164 168 Z" 
              fill={isActive('brazos') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
          </g>

          {/* Core (abs with anatomical detail) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('core')}
            onClick={() => onMuscleClick('core')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('core'); }}
            onMouseEnter={() => setHovered('core')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('core')}
            onBlur={() => setHovered(null)}
            aria-label="Core"
            className="cursor-pointer"
          >
            <path className="muscle" d="M 88 128 Q 92 128 96 130 L 102 132 L 108 132 L 110 132 L 112 132 L 118 132 L 124 130 Q 128 128 132 128 L 132 190 Q 128 196 122 200 L 118 202 L 110 202 L 102 202 L 98 200 Q 92 196 88 190 Z M 104 138 L 116 138 M 104 150 L 116 150 M 104 162 L 116 162 M 104 174 L 116 174" 
              fill={isActive('core') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('core') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Core</title>
            </path>
          </g>

          {/* Upper legs (quadriceps with anatomical shape) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('piernas')}
            onClick={() => onMuscleClick('piernas')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('piernas'); }}
            onMouseEnter={() => setHovered('piernas')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('piernas')}
            onBlur={() => setHovered(null)}
            aria-label="Piernas"
            className="cursor-pointer"
          >
            {/* Left thigh */}
            <path className="muscle" d="M 84 202 Q 80 206 76 216 Q 72 230 72 248 Q 72 266 76 284 Q 80 296 86 304 L 94 302 Q 98 290 100 274 Q 102 256 102 238 Q 102 222 100 210 Z" 
              fill={isActive('piernas') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('piernas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5" />
            {/* Right thigh */}
            <path className="muscle" d="M 136 202 Q 140 206 144 216 Q 148 230 148 248 Q 148 266 144 284 Q 140 296 134 304 L 126 302 Q 122 290 120 274 Q 118 256 118 238 Q 118 222 120 210 Z" 
              fill={isActive('piernas') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('piernas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5" />
          </g>

          {/* Calves (anatomical gastrocnemius) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('pantorrillas')}
            onClick={() => onMuscleClick('pantorrillas')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('pantorrillas'); }}
            onMouseEnter={() => setHovered('pantorrillas')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('pantorrillas')}
            onBlur={() => setHovered(null)}
            aria-label="Pantorrillas"
            className="cursor-pointer"
          >
            {/* Left calf */}
            <path className="muscle" d="M 86 304 Q 82 310 78 322 Q 74 338 74 356 Q 74 374 78 390 Q 82 402 88 410 L 94 408 Q 98 396 100 380 Q 102 362 102 344 Q 102 326 100 314 Z" 
              fill={isActive('pantorrillas') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('pantorrillas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Right calf */}
            <path className="muscle" d="M 134 304 Q 138 310 142 322 Q 146 338 146 356 Q 146 374 142 390 Q 138 402 132 410 L 126 408 Q 122 396 120 380 Q 118 362 118 344 Q 118 326 120 314 Z" 
              fill={isActive('pantorrillas') ? 'url(#muscleGrad)' : 'var(--surface-alt)'} 
              stroke={isActive('pantorrillas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
          </g>

          {/* Invisible larger hitboxes for shoulders */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('hombros')}
            onClick={() => onMuscleClick('hombros')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('hombros'); }}
            onMouseEnter={() => setHovered('hombros')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('hombros')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer"
            aria-label="Hombros hitbox"
          >
            <ellipse className="hitbox-desktop" cx="68" cy="96" rx="22" ry="20" fill="transparent" pointerEvents="all">
              <title>Hombro (área de toque)</title>
            </ellipse>
            <ellipse className="hitbox-desktop" cx="152" cy="96" rx="22" ry="20" fill="transparent" pointerEvents="all">
              <title>Hombro (área de toque)</title>
            </ellipse>
            <ellipse className="hitbox-mobile" cx="68" cy="96" rx="18" ry="16" fill="transparent" pointerEvents="all">
              <title>Hombro (área de toque móvil)</title>
            </ellipse>
            <ellipse className="hitbox-mobile" cx="152" cy="96" rx="18" ry="16" fill="transparent" pointerEvents="all">
              <title>Hombro (área de toque móvil)</title>
            </ellipse>
          </g>
        </svg>
      </div>

      {/* Vista Trasera */}
      <div className="relative">
        <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Vista Trasera
        </h3>
        <svg
          width="220"
          height="500"
          viewBox="0 0 220 500"
          className="body-map-svg border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-2"
          role="img"
          aria-label="Mapa del cuerpo humano - vista trasera"
        >
          <defs>
            <linearGradient id="muscleGradBack" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--primary-light)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            <filter id="softShadowBack" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
            </filter>
          </defs>
          
          {/* Head - back view */}
          <g>
            <path d="M 110 10 Q 95 10 88 18 Q 84 24 84 32 Q 84 40 88 46 Q 92 50 98 52 L 98 56 Q 98 60 102 60 L 118 60 Q 122 60 122 56 L 122 52 Q 128 50 132 46 Q 136 40 136 32 Q 136 24 132 18 Q 125 10 110 10 Z" 
              fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
            {/* Neck */}
            <path d="M 102 60 L 102 78 L 118 78 L 118 60" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
          </g>

          {/* Shoulders (back deltoids) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('hombros')}
            onClick={() => onMuscleClick('hombros')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('hombros'); }}
            onMouseEnter={() => setHovered('hombros')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('hombros')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            {/* Left shoulder */}
            <path className="muscle" d="M 78 78 Q 68 80 60 88 Q 54 95 54 104 L 60 112 Q 68 110 76 106 Q 82 100 84 92 Z" 
              fill={isActive('hombros') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('hombros') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Hombros</title>
            </path>
            {/* Right shoulder */}
            <path className="muscle" d="M 142 78 Q 152 80 160 88 Q 166 95 166 104 L 160 112 Q 152 110 144 106 Q 138 100 136 92 Z" 
              fill={isActive('hombros') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('hombros') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Hombros</title>
            </path>
          </g>

          {/* Back (trapezius + lats) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('espalda')}
            onClick={() => onMuscleClick('espalda')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('espalda'); }}
            onMouseEnter={() => setHovered('espalda')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('espalda')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            {/* Upper back trapezius */}
            <path className="muscle" d="M 84 78 Q 88 80 94 82 L 110 84 L 126 82 Q 132 80 136 78 L 134 96 Q 130 102 124 106 L 116 110 L 110 112 L 104 110 L 96 106 Q 90 102 86 96 Z" 
              fill={isActive('espalda') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('espalda') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Espalda superior</title>
            </path>
            {/* Mid/lower back lats */}
            <path className="muscle" d="M 86 96 Q 82 104 80 116 Q 78 130 78 144 Q 78 158 80 170 Q 82 180 86 188 L 94 186 Q 98 176 100 164 Q 102 150 102 136 Q 102 122 100 110 Z" 
              fill={isActive('espalda') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('espalda') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Espalda</title>
            </path>
            <path className="muscle" d="M 134 96 Q 138 104 140 116 Q 142 130 142 144 Q 142 158 140 170 Q 138 180 134 188 L 126 186 Q 122 176 120 164 Q 118 150 118 136 Q 118 122 120 110 Z" 
              fill={isActive('espalda') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('espalda') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Espalda</title>
            </path>
          </g>

          {/* Arms (triceps + forearms back) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('brazos')}
            onClick={() => onMuscleClick('brazos')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('brazos'); }}
            onMouseEnter={() => setHovered('brazos')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('brazos')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            {/* Left upper arm */}
            <path className="muscle" d="M 60 112 Q 52 114 48 122 Q 44 132 44 145 Q 46 156 52 162 L 60 160 Q 62 150 62 138 Q 62 124 60 112 Z" 
              fill={isActive('brazos') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Left forearm */}
            <path className="muscle" d="M 52 162 Q 48 170 46 182 Q 44 194 44 206 Q 46 214 50 218 L 56 216 Q 58 206 58 194 Q 58 178 56 168 Z" 
              fill={isActive('brazos') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Right upper arm */}
            <path className="muscle" d="M 160 112 Q 168 114 172 122 Q 176 132 176 145 Q 174 156 168 162 L 160 160 Q 158 150 158 138 Q 158 124 160 112 Z" 
              fill={isActive('brazos') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Right forearm */}
            <path className="muscle" d="M 168 162 Q 172 170 174 182 Q 176 194 176 206 Q 174 214 170 218 L 164 216 Q 162 206 162 194 Q 162 178 164 168 Z" 
              fill={isActive('brazos') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('brazos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
          </g>

          {/* Lower back / core */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('core')}
            onClick={() => onMuscleClick('core')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('core'); }}
            onMouseEnter={() => setHovered('core')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('core')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            <path className="muscle" d="M 86 188 Q 90 190 96 192 L 110 194 L 124 192 Q 130 190 134 188 L 132 212 Q 128 218 122 220 L 110 222 L 98 220 Q 92 218 88 212 Z" 
              fill={isActive('core') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('core') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Zona lumbar</title>
            </path>
          </g>

          {/* Glutes */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('gluteos')}
            onClick={() => onMuscleClick('gluteos')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('gluteos'); }}
            onMouseEnter={() => setHovered('gluteos')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('gluteos')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            {/* Left glute */}
            <path className="muscle" d="M 84 202 Q 80 206 76 216 Q 72 230 72 248 Q 72 266 76 284 Q 80 296 86 304 L 94 302 Q 98 290 100 274 Q 102 256 102 238 Q 102 222 100 210 Z" 
              fill={isActive('gluteos') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('gluteos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Glúteos</title>
            </path>
            {/* Right glute */}
            <path className="muscle" d="M 136 202 Q 140 206 144 216 Q 148 230 148 248 Q 148 266 144 284 Q 140 296 134 304 L 126 302 Q 122 290 120 274 Q 118 256 118 238 Q 118 222 120 210 Z" 
              fill={isActive('gluteos') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('gluteos') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5">
              <title>Glúteos</title>
            </path>
          </g>

          {/* Hamstrings */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('piernas')}
            onClick={() => onMuscleClick('piernas')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('piernas'); }}
            onMouseEnter={() => setHovered('piernas')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('piernas')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            {/* Left hamstring */}
            <path className="muscle" d="M 86 304 Q 82 310 78 322 Q 74 338 74 356 Q 74 374 78 390 Q 82 402 88 410 L 94 408 Q 98 396 100 380 Q 102 362 102 344 Q 102 326 100 314 Z" 
              fill={isActive('piernas') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('piernas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5" />
            {/* Right hamstring */}
            <path className="muscle" d="M 134 304 Q 138 310 142 322 Q 146 338 146 356 Q 146 374 142 390 Q 138 402 132 410 L 126 408 Q 122 396 120 380 Q 118 362 118 344 Q 118 326 120 314 Z" 
              fill={isActive('piernas') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('piernas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.5" />
          </g>

          {/* Calves (back) */}
          <g
            role="button"
            tabIndex={0}
            aria-pressed={isSelected('pantorrillas')}
            onClick={() => onMuscleClick('pantorrillas')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMuscleClick('pantorrillas'); }}
            onMouseEnter={() => setHovered('pantorrillas')}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered('pantorrillas')}
            onBlur={() => setHovered(null)}
            className="cursor-pointer transition-all"
          >
            {/* Left calf */}
            <path className="muscle" d="M 86 304 Q 82 310 78 322 Q 74 338 74 356 Q 74 374 78 390 Q 82 402 88 410 L 94 408 Q 98 396 100 380 Q 102 362 102 344 Q 102 326 100 314 Z" 
              fill={isActive('pantorrillas') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('pantorrillas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
            {/* Right calf */}
            <path className="muscle" d="M 134 304 Q 138 310 142 322 Q 146 338 146 356 Q 146 374 142 390 Q 138 402 132 410 L 126 408 Q 122 396 120 380 Q 118 362 118 344 Q 118 326 120 314 Z" 
              fill={isActive('pantorrillas') ? 'url(#muscleGradBack)' : 'var(--surface)'} 
              stroke={isActive('pantorrillas') ? 'var(--primary-dark)' : 'var(--border)'} 
              strokeWidth="1.2" />
          </g>
        </svg>
      </div>
    </div>
  );
};
