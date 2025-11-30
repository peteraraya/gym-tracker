'use client';

import React from 'react';
import { MuscleGroup } from '@/data/exercises';

interface BodyMapProps {
  selectedMuscles: MuscleGroup[];
  onMuscleClick: (muscle: MuscleGroup) => void;
}

export const BodyMap: React.FC<BodyMapProps> = ({ selectedMuscles, onMuscleClick }) => {
  const isSelected = (muscle: MuscleGroup) => selectedMuscles.includes(muscle);

  return (
    <div className="flex justify-center items-center gap-8">
      {/* Vista Frontal */}
      <div className="relative">
        <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Vista Frontal
        </h3>
        <svg
          width="200"
          height="400"
          viewBox="0 0 200 400"
          className="border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          {/* Cabeza */}
          <ellipse cx="100" cy="30" rx="25" ry="30" fill="#f0f0f0" stroke="#333" strokeWidth="1" />
          
          {/* Cuello */}
          <rect x="90" y="55" width="20" height="15" fill="#f0f0f0" stroke="#333" strokeWidth="1" />
          
          {/* Hombros */}
          <g
            onClick={() => onMuscleClick('hombros')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <ellipse
              cx="65"
              cy="85"
              rx="18"
              ry="15"
              fill={isSelected('hombros') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="135"
              cy="85"
              rx="18"
              ry="15"
              fill={isSelected('hombros') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Pecho */}
          <g
            onClick={() => onMuscleClick('pecho')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <path
              d="M 80 90 Q 100 80 120 90 L 120 130 Q 100 135 80 130 Z"
              fill={isSelected('pecho') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Brazos */}
          <g
            onClick={() => onMuscleClick('brazos')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Brazo izquierdo */}
            <ellipse
              cx="55"
              cy="115"
              rx="12"
              ry="35"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="50"
              cy="160"
              rx="10"
              ry="30"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Brazo derecho */}
            <ellipse
              cx="145"
              cy="115"
              rx="12"
              ry="35"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="150"
              cy="160"
              rx="10"
              ry="30"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Core/Abdomen */}
          <g
            onClick={() => onMuscleClick('core')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <rect
              x="80"
              y="135"
              width="40"
              height="50"
              rx="5"
              fill={isSelected('core') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Piernas superiores */}
          <g
            onClick={() => onMuscleClick('piernas')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Pierna izquierda superior */}
            <ellipse
              cx="85"
              cy="230"
              rx="18"
              ry="45"
              fill={isSelected('piernas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Pierna derecha superior */}
            <ellipse
              cx="115"
              cy="230"
              rx="18"
              ry="45"
              fill={isSelected('piernas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Piernas inferiores */}
          <g
            onClick={() => onMuscleClick('pantorrillas')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Pantorrilla izquierda */}
            <ellipse
              cx="85"
              cy="315"
              rx="14"
              ry="40"
              fill={isSelected('pantorrillas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Pantorrilla derecha */}
            <ellipse
              cx="115"
              cy="315"
              rx="14"
              ry="40"
              fill={isSelected('pantorrillas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>

      {/* Vista Trasera */}
      <div className="relative">
        <h3 className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Vista Trasera
        </h3>
        <svg
          width="200"
          height="400"
          viewBox="0 0 200 400"
          className="border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
        >
          {/* Cabeza */}
          <ellipse cx="100" cy="30" rx="25" ry="30" fill="#f0f0f0" stroke="#333" strokeWidth="1" />
          
          {/* Cuello */}
          <rect x="90" y="55" width="20" height="15" fill="#f0f0f0" stroke="#333" strokeWidth="1" />
          
          {/* Hombros traseros */}
          <g
            onClick={() => onMuscleClick('hombros')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <ellipse
              cx="65"
              cy="85"
              rx="18"
              ry="15"
              fill={isSelected('hombros') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="135"
              cy="85"
              rx="18"
              ry="15"
              fill={isSelected('hombros') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Espalda */}
          <g
            onClick={() => onMuscleClick('espalda')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <path
              d="M 75 90 L 125 90 L 120 160 L 80 160 Z"
              fill={isSelected('espalda') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Brazos traseros */}
          <g
            onClick={() => onMuscleClick('brazos')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Brazo izquierdo */}
            <ellipse
              cx="55"
              cy="115"
              rx="12"
              ry="35"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="50"
              cy="160"
              rx="10"
              ry="30"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Brazo derecho */}
            <ellipse
              cx="145"
              cy="115"
              rx="12"
              ry="35"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="150"
              cy="160"
              rx="10"
              ry="30"
              fill={isSelected('brazos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Zona lumbar */}
          <g
            onClick={() => onMuscleClick('core')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <rect
              x="80"
              y="160"
              width="40"
              height="25"
              rx="3"
              fill={isSelected('core') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Glúteos */}
          <g
            onClick={() => onMuscleClick('gluteos')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            <ellipse
              cx="85"
              cy="195"
              rx="16"
              ry="20"
              fill={isSelected('gluteos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            <ellipse
              cx="115"
              cy="195"
              rx="16"
              ry="20"
              fill={isSelected('gluteos') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Piernas traseras superiores */}
          <g
            onClick={() => onMuscleClick('piernas')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Pierna izquierda */}
            <ellipse
              cx="85"
              cy="250"
              rx="18"
              ry="45"
              fill={isSelected('piernas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Pierna derecha */}
            <ellipse
              cx="115"
              cy="250"
              rx="18"
              ry="45"
              fill={isSelected('piernas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
          
          {/* Pantorrillas traseras */}
          <g
            onClick={() => onMuscleClick('pantorrillas')}
            className="cursor-pointer transition-all hover:opacity-80"
          >
            {/* Pantorrilla izquierda */}
            <ellipse
              cx="85"
              cy="325"
              rx="14"
              ry="40"
              fill={isSelected('pantorrillas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
            {/* Pantorrilla derecha */}
            <ellipse
              cx="115"
              cy="325"
              rx="14"
              ry="40"
              fill={isSelected('pantorrillas') ? '#3b82f6' : '#e5e7eb'}
              stroke="#333"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>
    </div>
  );
};
