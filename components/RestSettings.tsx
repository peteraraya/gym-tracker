'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { requestNotificationPermission } from '@/lib/restCalculator';

/**
 * Componente para gestionar las preferencias de notificaciones
 * y otras configuraciones del sistema de descanso
 */
export const RestSettings: React.FC = () => {
  const getInitialNotificationStatus = (): NotificationPermission => {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  };

  const getInitialSoundEnabled = (): boolean => {
    const saved = localStorage.getItem('restSoundEnabled');
    return saved === null ? true : saved === 'true';
  };

  const getInitialMotivationEnabled = (): boolean => {
    const saved = localStorage.getItem('restMotivationEnabled');
    return saved === null ? true : saved === 'true';
  };

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(getInitialNotificationStatus);
  const [soundEnabled, setSoundEnabled] = useState(getInitialSoundEnabled);
  const [motivationEnabled, setMotivationEnabled] = useState(getInitialMotivationEnabled);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  const handleSoundToggle = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('restSoundEnabled', String(newValue));
  };

  const handleMotivationToggle = () => {
    const newValue = !motivationEnabled;
    setMotivationEnabled(newValue);
    localStorage.setItem('restMotivationEnabled', String(newValue));
  };

  const getNotificationStatusText = () => {
    switch (notificationStatus) {
      case 'granted':
        return { text: 'Activadas ✅', color: 'text-green-600 dark:text-green-400' };
      case 'denied':
        return { text: 'Bloqueadas ❌', color: 'text-red-600 dark:text-red-400' };
      default:
        return { text: 'No configuradas', color: 'text-gray-600 dark:text-gray-400' };
    }
  };

  const statusInfo = getNotificationStatusText();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">⏱️</span>
          Configuración de Descansos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notificaciones del navegador */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Notificaciones
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recibe alertas cuando termine el descanso
              </p>
            </div>
            <div className={`font-semibold ${statusInfo.color}`}>
              {statusInfo.text}
            </div>
          </div>

          {notificationStatus !== 'granted' && (
            <Button
              variant="primary"
              onClick={handleRequestNotifications}
              disabled={notificationStatus === 'denied'}
              className="w-full"
            >
              {notificationStatus === 'denied' 
                ? '🔒 Debes habilitarlas en la configuración del navegador'
                : '🔔 Activar Notificaciones'
              }
            </Button>
          )}

          {notificationStatus === 'denied' && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                💡 Para activar las notificaciones, ve a la configuración de tu navegador y permite las notificaciones para este sitio.
              </p>
            </div>
          )}
        </div>

        {/* Sonido de alerta */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Sonido de Alerta
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reproduce un sonido al terminar el descanso
              </p>
            </div>
            <button
              onClick={handleSoundToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mensajes motivacionales */}
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Mensajes Motivacionales
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Muestra mensajes de ánimo durante el descanso
              </p>
            </div>
            <button
              onClick={handleMotivationToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                motivationEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  motivationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🧠 Sistema de Descanso Inteligente
            </h3>
            <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <li>✅ Calcula tiempos óptimos según ejercicio</li>
              <li>✅ Ajusta según tu nivel de entrenamiento</li>
              <li>✅ Detecta ejercicios compuestos automáticamente</li>
              <li>✅ Diferencia entre series y ejercicios</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Hook personalizado para acceder a las preferencias de descanso
 */
export function useRestSettings() {
  const getInitialSoundEnabled = (): boolean => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('restSoundEnabled');
    return saved === null ? true : saved === 'true';
  };

  const getInitialMotivationEnabled = (): boolean => {
    if (typeof window === 'undefined') return true;
    const saved = localStorage.getItem('restMotivationEnabled');
    return saved === null ? true : saved === 'true';
  };

  const [soundEnabled] = useState(getInitialSoundEnabled);
  const [motivationEnabled] = useState(getInitialMotivationEnabled);

  return {
    soundEnabled,
    motivationEnabled
  };
}
