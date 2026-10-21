'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, X } from '@/components/icons/lucide';
import { useTranslations } from '@/context/LocaleContext';
import { Card } from '@/components/ui/Card';

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
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

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
      }, 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

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
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-in-bottom">
      <Card className="bg-linear-to-br from-neutral-900 via-neutral-800 to-neutral-950 border border-neutral-700 shadow-2xl p-5 relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          aria-label={t('close')}
        >
          <X className="w-5 h-5 text-neutral-300" />
        </button>

        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-brand-500/20 border border-brand-400/30 rounded-xl flex items-center justify-center shrink-0 text-brand-300">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-50 mb-0.5 text-sm">
              {t('installTitle')}
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {t('installDescription')}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-brand-400">✓</span>
            <span className="text-neutral-300">{t('homeBenefit')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-brand-400">✓</span>
            <span className="text-neutral-300">{t('offlineBenefit')}</span>
          </div>
        </div>

        {installationError && (
          <p role="alert" className="mb-2 rounded-lg bg-red-900/30 p-2 text-[11px] text-red-100 border border-red-500/20">
            {t('installError')}
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleInstallClick}
            className="flex-1 min-h-[44px]"
            variant="primary"
          >
            {t('install')}
          </Button>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            className="text-neutral-300 hover:bg-white/10 min-h-[44px]"
          >
            {t('later')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
