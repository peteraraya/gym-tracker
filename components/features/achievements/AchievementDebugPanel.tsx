"use client";

import React, { useState } from "react";
import { useGym } from "@/context/GymContext";
import { calculateAchievements, calculateStreak } from "@/lib/achievements/achievements";
import { calculateTotalVolume } from "@/lib/utils/dateUtils";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Bug,
  Trophy,
  Flame,
  Weight,
  Calendar,
  RefreshCw,
  Plus,
} from "@/components/icons/lucide";

export const AchievementDebugPanel: React.FC = () => {
  const { sessions, addSession } = useGym();
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const achievements = calculateAchievements(sessions);
  const streak = calculateStreak(sessions);
  const totalVolume = calculateTotalVolume(sessions);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  // Función para crear una sesión de prueba
  const createTestSession = async () => {
    const testSession = {
      routineId: "test-routine",
      routineName: "Rutina de Prueba",
      date: new Date(),
      exercises: [
        {
          exerciseId: "test-exercise-1",
          exerciseName: "Press de Banca",
          completedSets: 3,
          actualReps: [10, 8, 6],
          actualWeight: [60, 65, 70],
        },
        {
          exerciseId: "test-exercise-2",
          exerciseName: "Sentadillas",
          completedSets: 3,
          actualReps: [12, 10, 8],
          actualWeight: [80, 85, 90],
        },
      ],
      notes: "Sesión de prueba para logros",
      totalDuration: 3600, // 1 hora
      totalPausedTime: 300, // 5 minutos
    };

    try {
      await addSession(testSession);
      console.log("[Debug] Test session created");
    } catch (error) {
      console.error("[Debug] Error creating test session:", error);
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="secondary"
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        >
          <Bug className="w-4 h-4 mr-2" />
          Debug Logros
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white dark:bg-gray-800 shadow-2xl border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-purple-600" />
              Debug Panel - Logros
            </div>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Estadísticas actuales */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-blue-600" />
                <span className="font-medium">Sesiones</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {sessions.length}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <Weight className="w-3 h-3 text-purple-600" />
                <span className="font-medium">Volumen</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {Math.round(totalVolume)}kg
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="w-3 h-3 text-orange-600" />
                <span className="font-medium">Racha</span>
              </div>
              <div className="text-lg font-bold text-orange-600">
                {streak.current}d
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-3 h-3 text-green-600" />
                <span className="font-medium">Logros</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {unlockedCount}/{totalCount}
              </div>
            </div>
          </div>

          {/* Próximos logros */}
          <div>
            <h4 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
              Próximos Logros:
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {achievements
                .filter((a) => !a.unlocked)
                .sort((a, b) => b.progress / b.target - a.progress / a.target)
                .slice(0, 3)
                .map((achievement) => {
                  const progress =
                    (achievement.progress / achievement.target) * 100;
                  return (
                    <div key={achievement.id} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium truncate">
                          {achievement.name}
                        </span>
                        <span className="text-gray-500">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="text-gray-500 mt-1">
                        {achievement.progress}/{achievement.target}{" "}
                        {achievement.unit}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Acciones de debug */}
          <div className="space-y-2">
            <Button
              onClick={createTestSession}
              variant="primary"
              size="sm"
              className="w-full text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Crear Sesión de Prueba
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="secondary"
              size="sm"
              className="w-full text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Recargar Datos
            </Button>
          </div>

          {/* Log de debug */}
          <div className="text-xs text-gray-500">
            <div>Última actualización: {new Date().toLocaleTimeString()}</div>
            <div>
              Modo:{" "}
              {process.env.NEXT_PUBLIC_ENABLE_DATABASE === "true"
                ? "Database"
                : "LocalStorage"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
