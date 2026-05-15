'use client';

import { useState } from 'react';
import type { SetType } from '@/types';

interface SetTypeCycleButtonProps {
  value: SetType;
  onChange: (type: SetType) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const SET_TYPES: SetType[] = ['normal', 'warmup', 'dropset', 'failure', 'amrap', 'rest-pause', 'cluster'];

const SET_TYPE_INFO: Record<SetType, { icon: string; label: string; description: string; color: string }> = {
  normal: {
    icon: '💪',
    label: 'Normal',
    description: 'Serie estándar de trabajo',
    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
  },
  warmup: {
    icon: '🔥',
    label: 'Calentamiento',
    description: 'Serie de calentamiento con peso ligero',
    color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700'
  },
  dropset: {
    icon: '⬇️',
    label: 'Drop Set',
    description: 'Reducir peso y continuar sin descanso',
    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700'
  },
  failure: {
    icon: '🔴',
    label: 'Al Fallo',
    description: 'Serie hasta el fallo muscular',
    color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
  },
  amrap: {
    icon: '♾️',
    label: 'AMRAP',
    description: 'Máximas repeticiones posibles',
    color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
  },
  'rest-pause': {
    icon: '⏸️',
    label: 'Rest-Pause',
    description: 'Pausas cortas dentro de la serie',
    color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700'
  },
  cluster: {
    icon: '🔗',
    label: 'Cluster',
    description: 'Mini-series con descansos breves',
    color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-700'
  }
};

export default function SetTypeCycleButton({
  value,
  onChange,
  size = 'md',
  showLabel = true
}: SetTypeCycleButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const currentInfo = SET_TYPE_INFO[value];
  
  const handleClick = () => {
    const currentIndex = SET_TYPES.indexOf(value);
    const nextIndex = (currentIndex + 1) % SET_TYPES.length;
    onChange(SET_TYPES[nextIndex]);
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          flex items-center gap-1.5 rounded-lg border-2 font-semibold
          transition-all active:scale-95 hover:shadow-md
          ${sizeClasses[size]}
          ${currentInfo.color}
        `}
        title={`${currentInfo.label}: ${currentInfo.description}`}
      >
        <span className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}>
          {currentInfo.icon}
        </span>
        {showLabel && (
          <span className="font-semibold">{currentInfo.label}</span>
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-900 dark:bg-gray-950 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap shadow-lg pointer-events-none">
          <div className="font-semibold">{currentInfo.label}</div>
          <div className="text-gray-300 text-[10px]">{currentInfo.description}</div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-950"></div>
        </div>
      )}
    </div>
  );
}
