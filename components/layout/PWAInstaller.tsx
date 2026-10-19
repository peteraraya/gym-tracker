'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X } from '@/components/icons/lucide';
import { useTranslations } from '@/context/LocaleContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const t = useTranslations('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installationError, setInstallationError] = useState(false);
  const promptTimeoutRef = useRef<number | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia('(display-mode: standalone)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar el prompt después de un delay
      promptTimeoutRef.current = window.setTimeout(() => {
        let dismissed = false;
        try {
          dismissed = localStorage.getItem('pwa-install-dismissed') === 'true';
        } catch (error) {
          console.warn('[PWA] Could not read install prompt preference:', error);
        }
        if (!dismissed) {
          setShowInstallPrompt(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando se instala
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      if (promptTimeoutRef.current !== null) {
        window.clearTimeout(promptTimeoutRef.current);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      setInstallationError(false);
    } catch (error) {
      console.error('[PWA] Installation prompt failed:', error);
      setInstallationError(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    try {
      localStorage.setItem('pwa-install-dismissed', 'true');
    } catch (error) {
      console.warn('[PWA] Could not save install prompt preference:', error);
    }
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-in-top">
      <div className="bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800 text-white rounded-2xl shadow-2xl p-6 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
          aria-label={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-blue-500/20 border border-blue-400/30 rounded-xl flex items-center justify-center shrink-0 text-blue-200">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">
              {t('installTitle')}
            </h3>
            <p className="text-sm text-white/90">
              {t('installDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{t('homeBenefit')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{t('offlineBenefit')}</span>
          </div>
        </div>

        {installationError && (
          <p role="alert" className="mb-3 rounded-lg bg-red-950/50 p-2 text-sm text-red-100">
            {t('installError')}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1"
            variant="primary"
          >
            {t('install')}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            {t('later')}
          </Button>
        </div>
      </div>
    </div>
  );
}
