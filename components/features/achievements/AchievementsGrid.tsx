'use client';

import { Achievement, AchievementCategory } from '@/types';
import AchievementBadge from './AchievementBadge';
import { getCategoryProgress } from '@/lib/achievements/achievements';
import { Trophy, Flame, Calendar, Target } from '@/components/icons/lucide';

interface AchievementsGridProps {
  achievements: Achievement[];
  compact?: boolean;
}

const CATEGORY_INFO: Record<AchievementCategory, { name: string; icon: typeof Trophy; color: string }> = {
  consistency: {
    name: 'Consistencia',
    icon: Trophy,
    color: '#4da6ff' // blue-400
  },
  volume: {
    name: 'Volumen',
    icon: Flame,
    color: '#EF4444' // red
  },
  streak: {
    name: 'Rachas',
    icon: Calendar,
    color: '#10B981' // green
  },
  milestone: {
    name: 'Hitos',
    icon: Target,
    color: '#F59E0B' // amber
  }
};

export default function AchievementsGrid({ achievements, compact = false }: AchievementsGridProps) {
  const categories: AchievementCategory[] = ['consistency', 'volume', 'streak', 'milestone'];

  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const overallProgress = totalAchievements > 0 
    ? Math.round((unlockedAchievements / totalAchievements) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Progreso General */}
      <div className="bg-linear-to-r from-blue-50 to-purple-50 dark:from-zinc-800 dark:to-zinc-800 rounded-xl p-6 border border-blue-200 dark:border-zinc-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Progreso Total
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {unlockedAchievements} de {totalAchievements} logros desbloqueados
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {overallProgress}%
            </div>
          </div>
        </div>
        <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3">
          <div
            className="bg-linear-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-700"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Logros por Categoría */}
      {categories.map(category => {
        const categoryAchievements = achievements
          .filter(a => a.category === category)
          .sort((a, b) => {
            // Primero los desbloqueados, luego por tier
            if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
            const tierOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
            return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
          });

        const categoryProgress = getCategoryProgress(achievements, category);
        const categoryInfo = CATEGORY_INFO[category];
        const CategoryIcon = categoryInfo.icon;

        if (categoryAchievements.length === 0) return null;

        return (
          <div key={category} className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800">
            {/* Header de categoría */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${categoryInfo.color}20` }}
                >
                  <CategoryIcon
                    className="w-6 h-6"
                    style={{ color: categoryInfo.color }}
                  />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {categoryInfo.name}
                  </h4>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {categoryAchievements.filter(a => a.unlocked).length} / {categoryAchievements.length} desbloqueados
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold"
                  style={{ color: categoryInfo.color }}
                >
                  {categoryProgress}%
                </div>
              </div>
            </div>

            {/* Barra de progreso de categoría */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 mb-4">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${categoryProgress}%`,
                  backgroundColor: categoryInfo.color
                }}
              />
            </div>

            {/* Grid de badges */}
            <div className={`grid gap-4 ${
              compact 
                ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8' 
                : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
            }`}>
              {categoryAchievements.map(achievement => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  size={compact ? 'sm' : 'md'}
                  showProgress={true}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Mensaje si no hay logros */}
      {achievements.length === 0 && (
        <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">Aún no hay logros disponibles</p>
          <p className="text-sm">¡Comienza a entrenar para desbloquearlos!</p>
        </div>
      )}
    </div>
  );
}
