'use client';

import { useState } from 'react';
import { Bell, Send, CheckCircle, XCircle } from '@/components/icons/lucide';

// Definición local para evitar dependencia de tipos de DOM ausentes
type PushNotificationAction = { action: string; title: string; icon?: string };

export function PushNotificationTester() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Verificar permiso actual
  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  // Solicitar permiso manualmente
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      setMessage('Las notificaciones no están soportadas en este navegador');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setMessage('✓ Permiso concedido');
        setStatus('success');
      } else {
        setMessage('✗ Permiso denegado');
        setStatus('error');
      }
    } catch (error) {
      setMessage('Error al solicitar permiso');
      setStatus('error');
    }
  };

  // Enviar notificación de prueba local
  const sendLocalNotification = async () => {
    if (Notification.permission !== 'granted') {
      setMessage('Primero debes conceder permiso para notificaciones');
      setStatus('error');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const options: NotificationOptions & { vibrate?: number[]; actions?: PushNotificationAction[] } = {
        body: 'Esta es una notificación de prueba desde Gym Tracker',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        tag: 'test',
        requireInteraction: false,
        actions: [
          { action: 'open', title: 'Abrir' },
          { action: 'close', title: 'Cerrar' }
        ]
      };

      await registration.showNotification('Notificación de Prueba 🔔', options);

      setMessage('✓ Notificación local enviada');
      setStatus('success');
    } catch (error) {
      console.error('Error sending local notification:', error);
      setMessage('✗ Error al enviar notificación local');
      setStatus('error');
    }
  };

  // Enviar notificación push desde servidor
  const sendPushNotification = async () => {
    if (Notification.permission !== 'granted') {
      setMessage('Primero debes conceder permiso para notificaciones');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setMessage('Enviando notificación push...');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setMessage('✗ No hay suscripción activa');
        setStatus('error');
        return;
      }

      const response = await fetch('/api/push-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription,
          notification: {
            title: '¡Notificación Push! 🚀',
            body: 'Esta es una notificación push desde el servidor',
            tag: 'push-test',
            data: { url: '/dashboard' }
          }
        })
      });

      if (response.ok) {
        setMessage('✓ Notificación push enviada correctamente');
        setStatus('success');
      } else {
        const error = await response.json();
        setMessage(`✗ Error: ${error.error}`);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
      setMessage('✗ Error al enviar notificación push');
      setStatus('error');
    }
  };

  // Verificar suscripción
  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        setMessage(`✓ Suscrito: ${subscription.endpoint.substring(0, 50)}...`);
        setStatus('success');
      } else {
        setMessage('✗ No hay suscripción activa');
        setStatus('error');
      }
    } catch (error) {
      setMessage('✗ Error al verificar suscripción');
      setStatus('error');
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Bell className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Probador de Notificaciones Push
        </h3>
      </div>

      {/* Estado del permiso */}
      <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Estado del permiso:
          </span>
          <button
            onClick={checkPermission}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Actualizar
          </button>
        </div>
        <div className="flex items-center gap-2">
          {permission === 'granted' && (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 dark:text-green-400">Concedido</span>
            </>
          )}
          {permission === 'denied' && (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400">Denegado</span>
            </>
          )}
          {permission === 'default' && (
            <>
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">No solicitado</span>
            </>
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2">
        <button
          onClick={requestPermission}
          disabled={permission === 'granted'}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Bell className="w-4 h-4" />
          Solicitar Permiso
        </button>

        <button
          onClick={checkSubscription}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Verificar Suscripción
        </button>

        <button
          onClick={sendLocalNotification}
          disabled={permission !== 'granted'}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          Enviar Notificación Local
        </button>

        <button
          onClick={sendPushNotification}
          disabled={permission !== 'granted' || status === 'sending'}
          className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {status === 'sending' ? 'Enviando...' : 'Enviar Push desde Servidor'}
        </button>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
          status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' :
          'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
        }`}>
          {message}
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 pt-4 border-t border-zinc-200 dark:border-zinc-700">
        <p>• Las notificaciones locales se muestran inmediatamente</p>
        <p>• Las notificaciones push requieren conexión al servidor</p>
        <p>• En móviles, las notificaciones funcionan incluso con la app cerrada</p>
      </div>
    </div>
  );
}
