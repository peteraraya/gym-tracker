'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement } from '@/types';
import { getTierColor } from '@/lib/achievements/achievements';
import { 
  Trophy, 
  Star, 
  Award, 
  Crown, 
  Gem,
  X
} from 'lucide-react';

interface AchievementNotificationProps {
  achievement: Achievement;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const tierIcons = {
  bronze: Trophy,
  silver: Award,
  gold: Crown,
  platinum: Star,
  diamond: Gem,
};

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const TierIcon = tierIcons[achievement.tier];
  const tierColor = getTierColor(achievement.tier);

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Trigger confetti or celebration animation
      const celebrationTimer = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);

      return () => clearTimeout(celebrationTimer);
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.6
          }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full mx-4"
        >
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl shadow-2xl border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
            
            {/* Header con animación */}
            <div 
              className="px-6 py-4 text-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${tierColor}20, ${tierColor}10)`
              }}
            >
              {/* Partículas de celebración */}
              {isAnimating && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ 
                        opacity: 1, 
                        scale: 0,
                        x: '50%',
                        y: '50%'
                      }}
                      animate={{ 
                        opacity: 0, 
                        scale: 1,
                        x: `${50 + (Math.random() - 0.5) * 200}%`,
                        y: `${50 + (Math.random() - 0.5) * 200}%`,
                        rotate: Math.random() * 360
                      }}
                      transition={{ 
                        duration: 1.5,
                        delay: i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute w-2 h-2 rounded-full"
                      style={{ backgroundColor: tierColor }}
                    />
                  ))}
                </div>
              )}

              {/* Icono principal con animación */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 200, 
                  damping: 10,
                  delay: 0.2
                }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 shadow-lg"
                style={{ backgroundColor: tierColor }}
              >
                <TierIcon className="w-8 h-8 text-white" />
              </motion.div>

              {/* Título */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1"
              >
                🏆 ¡Logro Desbloqueado!
              </motion.h3>

              {/* Nombre del logro */}
              <motion.h4
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-extrabold mb-2"
                style={{ color: tierColor }}
              >
                {achievement.name}
              </motion.h4>

              {/* Descripción */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                {achievement.description}
              </motion.p>

              {/* Botón de cerrar */}
              <button
                onClick={onClose}
                className="absolute top-2 right-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Footer con progreso */}
            <div className="px-6 py-3 bg-white/50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">
                  Progreso: {achievement.progress}/{achievement.target} {achievement.unit}
                </span>
                <span 
                  className="font-bold px-2 py-1 rounded-full text-white text-xs"
                  style={{ backgroundColor: tierColor }}
                >
                  {achievement.tier.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook para manejar múltiples notificaciones de logros
export function useAchievementNotifications() {
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  const showAchievement = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement]);
  };

  const hideAchievement = (achievementId: string) => {
    setNotifications(prev => prev.filter(a => a.id !== achievementId));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showAchievement,
    hideAchievement,
    clearAll,
    AchievementNotifications: () => (
      <>
        {notifications.map((achievement, index) => (
          <AchievementNotification
            key={achievement.id}
            achievement={achievement}
            isVisible={true}
            onClose={() => hideAchievement(achievement.id)}
            autoClose={true}
            duration={5000 + index * 1000} // Escalonar las notificaciones
          />
        ))}
      </>
    ),
  };
}