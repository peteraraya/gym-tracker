'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import type { Achievement } from '@/types';
import { Trophy, Shield } from '@/components/icons/lucide';

interface AchievementCardProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  onClick?: (achievement: Achievement) => void;
}

const tierColors = {
  bronze: {
    bg: 'from-amber-700 to-amber-900',
    text: 'text-amber-100',
    border: 'border-amber-600',
    icon: 'text-amber-300',
    progress: 'bg-amber-600',
    glow: '0 0 18px 4px rgba(180,83,9,0.55), 0 0 40px 8px rgba(180,83,9,0.2)',
  },
  silver: {
    bg: 'from-gray-400 to-gray-600',
    text: 'text-gray-100',
    border: 'border-gray-400',
    icon: 'text-gray-200',
    progress: 'bg-gray-500',
    glow: '0 0 18px 4px rgba(156,163,175,0.5), 0 0 40px 8px rgba(156,163,175,0.2)',
  },
  gold: {
    bg: 'from-yellow-400 to-yellow-600',
    text: 'text-yellow-900',
    border: 'border-yellow-500',
    icon: 'text-yellow-200',
    progress: 'bg-yellow-500',
    glow: '0 0 20px 6px rgba(234,179,8,0.65), 0 0 50px 12px rgba(234,179,8,0.25)',
  },
  platinum: {
    bg: 'from-cyan-400 to-cyan-600',
    text: 'text-cyan-100',
    border: 'border-cyan-400',
    icon: 'text-cyan-200',
    progress: 'bg-cyan-500',
    glow: '0 0 20px 6px rgba(6,182,212,0.6), 0 0 50px 12px rgba(6,182,212,0.25)',
  },
  diamond: {
    bg: 'from-blue-400 to-purple-600',
    text: 'text-white',
    border: 'border-purple-400',
    icon: 'text-purple-200',
    progress: 'bg-purple-500',
    glow: '0 0 22px 8px rgba(139,92,246,0.65), 0 0 60px 16px rgba(139,92,246,0.25)',
  }
};

const sizeClasses = {
  sm: {
    card: 'p-3',
    icon: 'w-10 h-10 text-2xl',
    title: 'text-sm',
    description: 'text-xs',
    progress: 'h-1.5'
  },
  md: {
    card: 'p-4',
    icon: 'w-14 h-14 text-3xl',
    title: 'text-base',
    description: 'text-sm',
    progress: 'h-2'
  },
  lg: {
    card: 'p-6',
    icon: 'w-20 h-20 text-5xl',
    title: 'text-xl',
    description: 'text-base',
    progress: 'h-3'
  }
};

export function AchievementCard({
  achievement,
  size = 'md',
  showProgress = false,
  onClick
}: AchievementCardProps) {
  const colors = tierColors[achievement.tier];
  const sizes = sizeClasses[size];
  const progressPercentage = Math.min((achievement.progress / achievement.target) * 100, 100);
  const isUnlocked = achievement.unlocked;

  return (
    <motion.div
      animate={isUnlocked ? {
        boxShadow: [colors.glow, colors.glow.replace(/0\.65/, '0.35').replace(/0\.55/, '0.25').replace(/0\.6/, '0.3'), colors.glow],
      } : {}}
      transition={isUnlocked ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : {}}
      style={{ borderRadius: '0.75rem' }}
      whileHover={isUnlocked ? { scale: 1.03 } : {}}
    >
    <Card
      className={`
        relative overflow-hidden transition-all duration-300
        ${isUnlocked 
          ? `bg-linear-to-br ${colors.bg} border-2 ${colors.border}` 
          : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 grayscale opacity-40'
        }
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={() => onClick?.(achievement)}
    >
      <CardContent className={sizes.card}>
        {/* Shield overlay for locked achievements */}
        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
            <Shield className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`
            ${sizes.icon} shrink-0 rounded-full flex items-center justify-center
            ${isUnlocked 
              ? `bg-white/20 backdrop-blur-sm ${colors.icon}` 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
            }
          `}>
            {isUnlocked ? (
              <Trophy className="w-full h-full p-2" />
            ) : (
              <Shield className="w-full h-full p-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className={`
              ${sizes.title} font-bold mb-1
              ${isUnlocked ? colors.text : 'text-gray-600 dark:text-gray-400'}
            `}>
              {achievement.name}
            </h3>

            {/* Description */}
            <p className={`
              ${sizes.description} mb-2
              ${isUnlocked ? colors.text : 'text-gray-500 dark:text-gray-500'}
            `}>
              {achievement.description}
            </p>

            {/* Tier badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                inline-block px-2 py-0.5 rounded-full text-xs font-bold uppercase
                ${isUnlocked 
                  ? 'bg-white/30 backdrop-blur-sm' 
                  : 'bg-gray-300 dark:bg-gray-700'
                }
                ${isUnlocked ? colors.text : 'text-gray-600 dark:text-gray-400'}
              `}>
                {achievement.tier}
              </span>
              {isUnlocked && achievement.unlockedAt && (
                <span className={`text-xs ${colors.text}`}>
                  {new Date(achievement.unlockedAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {showProgress && !isUnlocked && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Progreso</span>
                  <span className="font-semibold">
                    {achievement.progress} / {achievement.target} {achievement.unit}
                  </span>
                </div>
                <div className={`w-full ${sizes.progress} bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${colors.progress} transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-right">
                  {progressPercentage.toFixed(0)}%
                </div>
              </div>
            )}

            {/* Unlocked checkmark */}
            {isUnlocked && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${colors.text}`}>
                <span>✓</span>
                <span>Desbloqueado</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </motion.div>
  );
}
