'use client';

import { Achievement } from '@/types';
import { getTierColor } from '@/lib/achievements/achievements';
import * as LucideIcons from '@/components/icons/lucide';
import { useState } from 'react';
import type { LucideIcon } from '@/components/icons/lucide';

interface AchievementBadgeProps {
  achievement: Achievement;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementBadge({ 
  achievement, 
  showProgress = true,
  size = 'md'
}: AchievementBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const tierColor = getTierColor(achievement.tier);
  const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);
  
  // Obtener el ícono dinámicamente
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  const IconComponent = icons[achievement.icon] || LucideIcons.Award;

  // Tamaños según prop
  const sizes = {
    sm: {
      container: 'w-16 h-16',
      icon: 'w-6 h-6',
      text: 'text-xs',
      badge: 'w-14 h-14'
    },
    md: {
      container: 'w-24 h-24',
      icon: 'w-10 h-10',
      text: 'text-sm',
      badge: 'w-20 h-20'
    },
    lg: {
      container: 'w-32 h-32',
      icon: 'w-14 h-14',
      text: 'text-base',
      badge: 'w-28 h-28'
    }
  };

  const sizeClasses = sizes[size];

  return (
    <div className="relative inline-block">
      <div
        className={`relative ${sizeClasses.container} cursor-pointer transition-transform duration-200 ${
          isHovered ? 'scale-110' : 'scale-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badge circular */}
        <div
          className={`${sizeClasses.badge} rounded-full flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
            achievement.unlocked
              ? 'shadow-lg'
              : 'opacity-40 grayscale'
          }`}
          style={{
            background: achievement.unlocked
              ? `linear-gradient(135deg, ${tierColor}20, ${tierColor}40)`
              : '#374151',
            border: `3px solid ${achievement.unlocked ? tierColor : '#6B7280'}`
          }}
        >
          {/* Brillo animado cuando está desbloqueado */}
          {achievement.unlocked && (
            <div
              className="absolute inset-0 bg-linear-to-tr from-transparent via-white to-transparent opacity-20 animate-pulse"
            />
          )}

          {/* Ícono */}
          <IconComponent
            className={sizeClasses.icon}
            style={{ color: achievement.unlocked ? tierColor : '#9CA3AF' }}
          />
        </div>

        {/* Barra de progreso circular (si no está desbloqueado) */}
        {!achievement.unlocked && showProgress && (
          <svg
            className="absolute top-0 left-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#374151"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={tierColor}
              strokeWidth="6"
              strokeDasharray={`${progressPercentage * 2.827} 282.7`}
              className="transition-all duration-500"
              opacity="0.6"
            />
          </svg>
        )}

        {/* Tooltip al hacer hover */}
        {isHovered && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 z-50 animate-fadeIn">
            <div
              className="bg-zinc-900 text-white rounded-lg p-3 shadow-2xl border"
              style={{ borderColor: tierColor }}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent className="w-4 h-4" style={{ color: tierColor }} />
                <h4 className="font-bold text-sm">{achievement.name}</h4>
              </div>
              <p className="text-xs text-zinc-300 mb-2">{achievement.description}</p>
              
              {/* Progreso */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Progreso</span>
                  <span style={{ color: tierColor }}>
                    {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()} {achievement.unit}
                  </span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercentage}%`,
                      backgroundColor: tierColor
                    }}
                  />
                </div>
              </div>

              {/* Tier */}
              <div className="mt-2 text-xs text-center">
                <span
                  className="px-2 py-0.5 rounded-full font-semibold uppercase"
                  style={{
                    backgroundColor: `${tierColor}30`,
                    color: tierColor
                  }}
                >
                  {achievement.tier}
                </span>
              </div>
            </div>
            {/* Flecha del tooltip */}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-8 border-transparent"
              style={{ borderTopColor: tierColor }}
            />
          </div>
        )}
      </div>

      {/* Etiqueta de nombre (opcional, solo para tamaño lg) */}
      {size === 'lg' && (
        <p className={`text-center mt-2 font-semibold ${sizeClasses.text} ${
          achievement.unlocked ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-500'
        }`}>
          {achievement.name}
        </p>
      )}
    </div>
  );
}
