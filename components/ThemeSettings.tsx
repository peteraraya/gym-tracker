'use client';

import React from 'react';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Sun, Moon, Clock } from '@/components/icons/lucide';

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      value: 'light',
      label: 'Claro',
      icon: <Sun className="w-5 h-5" />,
      description: 'Tema claro siempre activo'
    },
    {
      value: 'dark',
      label: 'Oscuro',
      icon: <Moon className="w-5 h-5" />,
      description: 'Tema oscuro siempre activo'
    },
    {
      value: 'auto',
      label: 'Automático',
      icon: <Clock className="w-5 h-5" />,
      description: 'Cambia según la hora del día (oscuro 8PM-7AM)'
    }
  ];

  const getCurrentTimeInfo = () => {
    const hour = new Date().getHours();
    const isDarkTime = hour >= 20 || hour < 7;
    return {
      isDarkTime,
      message: isDarkTime 
        ? `🌙 Modo oscuro activo (${hour}:00 - horario nocturno)`
        : `☀️ Modo claro activo (${hour}:00 - horario diurno)`
    };
  };

  const timeInfo = getCurrentTimeInfo();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Sun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          )}
          Apariencia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Elige cómo quieres ver la aplicación
          </p>

          {/* Opciones de tema */}
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  theme === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 ${
                    theme === option.value
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${
                        theme === option.value
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {option.label}
                      </span>
                      {theme === option.value && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                          Activo
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${
                      theme === option.value
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Información del modo automático */}
          {theme === 'auto' && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                    Modo Automático Activo
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                    {timeInfo.message}
                  </p>
                  <div className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                    <p>• Modo claro: 7:00 AM - 7:59 PM</p>
                    <p>• Modo oscuro: 8:00 PM - 6:59 AM</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vista previa del tema actual */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Vista previa actual:
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-8 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center">
                <span className="text-xs text-gray-900 dark:text-gray-100">Texto</span>
              </div>
              <div className="flex-1 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs text-white font-semibold">Botón</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p>💡 El modo automático ayuda a reducir la fatiga visual</p>
            <p>💡 Puedes cambiar el tema en cualquier momento</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
