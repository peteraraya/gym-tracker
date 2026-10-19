'use client';

import { Settings } from '@/components/icons/lucide';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { ThemeSettings } from '@/components/features/settings/ThemeSettings';
import { SoundSettingsContent } from '@/components/features/settings/SoundSettings';
import { DevTools } from '@/components/shared/DevTools';
import { PageHeader, PageLayout, PageContent } from '@/layouts';
import { useTranslations } from '@/context/LocaleContext';

export default function SettingsPage() {
  const t = useTranslations('settingsPage');

  return (
    <ProtectedRoute>
      <PageLayout>
        <PageHeader
          title={t('title')}
          subtitle={t('subtitle')}
          icon={<Settings className="w-6 h-6 text-white" />}
        />
        <PageContent>
        {/* Secciones */}
        <div className="space-y-4">
          {/* Sonidos y Notificaciones */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">{t('soundNotifications')}</h2>
            <SoundSettingsContent showCloseButton={false} />
          </section>
          {/* Tema */}
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
              {t('appearance')}
            </h2>
            <ThemeSettings />
          </section>

            {/* Información de la PWA */}
            <section>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">
                {t('pwa')}
              </h2>
              <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {t('installable')}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t('installableDescription')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h3 className="font-medium text-zinc-900 dark:text-white">
                      {t('offline')}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t('offlineDescription')}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Herramientas de Desarrollo - Solo visible en dev */}
            <DevTools />
          </div>
        </PageContent>
      </PageLayout>
    </ProtectedRoute>
  );
}
