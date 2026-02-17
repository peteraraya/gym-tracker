'use client';

import { Settings } from '@/components/icons/lucide';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeSettings } from '@/components/ThemeSettings';
import { PushNotificationTester } from '@/components/PushNotificationTester';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Configuración
            </h1>
          </div>

          {/* Secciones */}
          <div className="space-y-6">
            {/* Tema */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Apariencia
              </h2>
              <ThemeSettings />
            </section>

            {/* Notificaciones Push */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Notificaciones Push
              </h2>
              <PushNotificationTester />
            </section>

            {/* Información de la PWA */}
            <section>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
                Aplicación Web Progresiva (PWA)
              </h2>
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      Instalable
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Puedes instalar esta app en tu dispositivo para acceso rápido
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      Funciona Offline
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Accede a tus rutinas y datos sin conexión a internet
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      Notificaciones Push
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Recibe recordatorios sobre tus entrenamientos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      Sincronización en Background
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      Tus datos se sincronizan automáticamente cuando vuelves online
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
