"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useSoundSettings, SoundType, AVAILABLE_SOUNDS } from '@/lib/audio/soundSystem';
import { useRestNotifications } from '@/lib/notifications/pwaNotifications';
import { useTranslations } from '@/context/LocaleContext';
import {
  Volume2,
  VolumeX,
  Play,
  Bell,
  Check,
  AlertCircle
} from '@/components/icons/lucide';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundSettingsContent: React.FC<{ showCloseButton?: boolean; onClose?: () => void }> = ({ showCloseButton = true, onClose }) => {
  const soundSettings = useSoundSettings();
  const notifications = useRestNotifications();
  const t = useTranslations('notifications');
  
  const [currentSound, setCurrentSound] = useState<SoundType>(() => 'bell');
  const [volume, setVolume] = useState<number>(1);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<{
    granted: boolean;
    denied: boolean;
    prompt: boolean;
  }>({ granted: false, denied: false, prompt: true });
  const [isTestingSound, setIsTestingSound] = useState(false);

  useEffect(() => {
    // Inicializar estado al montar
    setCurrentSound(soundSettings.getCurrentSound());
    setVolume(soundSettings.getVolume());
    setIsEnabled(soundSettings.isEnabled());
    setNotificationPermission(notifications.getPermissionState());
  }, []);

  const handleSoundTypeChange = (soundType: SoundType) => {
    setCurrentSound(soundType);
    soundSettings.setSoundType(soundType);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    soundSettings.setVolume(newVolume);
  };

  const handleEnabledChange = (enabled: boolean) => {
    setIsEnabled(enabled);
    soundSettings.setEnabled(enabled);
  };

  const handleTestSound = async () => {
    if (isTestingSound) return;
    
    setIsTestingSound(true);
    try {
      await soundSettings.testSound();
    } catch (error) {
      console.warn('Error probando sonido:', error);
    } finally {
      setTimeout(() => setIsTestingSound(false), 1000);
    }
  };

  const handleRequestNotificationPermission = async () => {
    await notifications.requestPermission();
    setNotificationPermission(notifications.getPermissionState());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            {t('soundsTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('enableSounds')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('soundDescription')}
              </p>
            </div>
            <Button
              variant={isEnabled ? 'primary' : 'secondary'}
              onClick={() => handleEnabledChange(!isEnabled)}
              className="flex items-center gap-2"
            >
              {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {isEnabled ? t('enabled') : t('disabled')}
            </Button>
          </div>

          {isEnabled && (
            <>
              <div>
                <h4 className="font-medium mb-3">{t('soundType')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(AVAILABLE_SOUNDS).map(([key]) => (
                    <div
                      key={key}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        currentSound === key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleSoundTypeChange(key as SoundType)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {currentSound === key && <Check className="w-4 h-4 text-blue-500" />}
                            {t(`soundNames.${key}`)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t(`soundDescriptions.${key}`)}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSoundTypeChange(key as SoundType);
                            handleTestSound();
                          }}
                          disabled={isTestingSound}
                          className="ml-2"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">{t('volume').replace('{value}', String(Math.round(volume * 100)))}</h4>
                <div className="flex items-center gap-4">
                  <VolumeX className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    aria-label={t('volumeControl')}
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <Volume2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleTestSound}
                disabled={isTestingSound}
                className="w-full flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                {isTestingSound ? t('playing') : t('testSound')}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {t('pwaTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{t('permissionStatus')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {notificationPermission.granted && t('permissionGranted')}
                {notificationPermission.denied && t('permissionDenied')}
                {notificationPermission.prompt && t('permissionPrompt')}
              </p>
            </div>
            {!notificationPermission.granted && (
              <Button
                variant="primary"
                onClick={handleRequestNotificationPermission}
                disabled={notificationPermission.denied}
                className="flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                {notificationPermission.denied ? t('blocked') : t('enable')}
              </Button>
            )}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm">
                <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  {t('restNoticeTitle')}
                </h5>
                <ul className="text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {t('restNotice')}</li>
                  <li>• {t('permissionRequired')}</li>
                  <li>• {t('backgroundAvailability')}</li>
                </ul>
              </div>
            </div>
          </div>

          {notificationPermission.denied && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="text-sm">
                  <h5 className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                    {t('blockedTitle')}
                  </h5>
                  <p className="text-orange-700 dark:text-orange-300">
                    {t('blockedDescription')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showCloseButton && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      )}
    </div>
  );
};

export const SoundSettings: React.FC<SoundSettingsProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración de Sonidos y Notificaciones">
      <SoundSettingsContent showCloseButton onClose={onClose} />
    </Modal>
  );
};

// Hook para abrir la configuración de sonidos
export function useSoundSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    openSettings: () => setIsOpen(true),
    closeSettings: () => setIsOpen(false),
    SoundSettingsModal: () => (
      <SoundSettings isOpen={isOpen} onClose={() => setIsOpen(false)} />
    ),
  };
}