'use client';

import { Settings } from '@/components/icons/lucide';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { ThemeSettings } from '@/components/features/settings/ThemeSettings';
import { SoundSettingsContent } from '@/components/features/settings/SoundSettings';
import { PushNotificationTester } from '@/components/shared/PushNotificationTester';
import { DevTools } from '@/components/shared/DevTools';
import { PageLayout } from '@/components/layout/PageLayout';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <PageLayout
        title="Configuración"
        description="Personaliza tu experiencia"
        icon={<Settings className="w-6 h-6 text-blue-500" />}
      >
        {/* Secciones */}
        <div className="space-y-4">
          {/* Sonidos y Notificaciones */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Sonidos y Notificaciones</h2>
            <SoundSettingsContent showCloseButton={false} />
          </section>
          {/* Tema */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              Apariencia
            </h2>
            <ThemeSettings />
          </section>

            {/* Notificaciones Push */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                Notificaciones Push
              </h2>
              <PushNotificationTester />
            </section>

            {/* Información de la PWA */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                Aplicación Web Progresiva (PWA)
              </h2>
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-4 space-y-3">
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

            {/* Herramientas de Desarrollo - Solo visible en dev */}
            <DevTools />
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }
