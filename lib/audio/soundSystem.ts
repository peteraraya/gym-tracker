/**
 * Sistema de Audio Mejorado para Gym Tracker
 * Sonidos más fuertes, personalizables y con mejor UX
 */

export type SoundType = 'beep' | 'chime' | 'bell' | 'horn' | 'whistle' | 'custom';

interface SoundConfig {
  name: string;
  description: string;
  frequency?: number;
  duration?: number;
  volume?: number;
  pattern?: 'single' | 'double' | 'triple';
}

export const AVAILABLE_SOUNDS: Record<SoundType, SoundConfig> = {
  beep: {
    name: 'Beep Clásico',
    description: 'Sonido simple y claro',
    frequency: 800,
    duration: 0.3,
    volume: 0.7,
    pattern: 'single'
  },
  chime: {
    name: 'Campanilla',
    description: 'Sonido suave y melodioso',
    frequency: 1200,
    duration: 0.8,
    volume: 0.6,
    pattern: 'double'
  },
  bell: {
    name: 'Campana',
    description: 'Sonido fuerte y claro',
    frequency: 1000,
    duration: 1.0,
    volume: 0.8,
    pattern: 'single'
  },
  horn: {
    name: 'Bocina',
    description: 'Sonido potente para entrenamientos intensos',
    frequency: 400,
    duration: 0.5,
    volume: 0.9,
    pattern: 'triple'
  },
  whistle: {
    name: 'Silbato',
    description: 'Sonido agudo y penetrante',
    frequency: 2000,
    duration: 0.4,
    volume: 0.8,
    pattern: 'double'
  },
  custom: {
    name: 'Personalizado',
    description: 'Configuración personalizada',
    frequency: 800,
    duration: 0.5,
    volume: 0.7,
    pattern: 'single'
  }
};

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 1.0;
  private currentSound: SoundType = 'bell';
  private isEnabled: boolean = true;

  constructor() {
    this.loadSettings();
  }

  private async initAudioContext(): Promise<AudioContext | null> {
    if (this.audioContext) return this.audioContext;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return null;

      this.audioContext = new AudioContextClass();
      
      // Reanudar contexto si está suspendido (requerido por algunos navegadores)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      return this.audioContext;
    } catch (error) {
      console.warn('No se pudo inicializar el contexto de audio:', error);
      return null;
    }
  }

  private loadSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const settings = localStorage.getItem('gym_tracker_sound_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.currentSound = parsed.soundType || 'bell';
        this.masterVolume = parsed.volume || 1.0;
        this.isEnabled = parsed.enabled !== false;
      }
    } catch (error) {
      console.warn('Error cargando configuración de sonido:', error);
    }
  }

  private saveSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const settings = {
        soundType: this.currentSound,
        volume: this.masterVolume,
        enabled: this.isEnabled
      };
      localStorage.setItem('gym_tracker_sound_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Error guardando configuración de sonido:', error);
    }
  }

  async playRestCompleteSound(): Promise<void> {
    if (!this.isEnabled) return;

    const audioContext = await this.initAudioContext();
    if (!audioContext) return;

    const config = AVAILABLE_SOUNDS[this.currentSound];
    const patternCount = config.pattern === 'triple' ? 3 : config.pattern === 'double' ? 2 : 1;

    for (let i = 0; i < patternCount; i++) {
      await this.playTone(
        config.frequency || 800,
        config.duration || 0.5,
        (config.volume || 0.7) * this.masterVolume,
        i * 0.2 // Delay entre tonos
      );
    }
  }

  private async playTone(
    frequency: number,
    duration: number,
    volume: number,
    delay: number = 0
  ): Promise<void> {
    if (!this.audioContext) return;

    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.audioContext) {
          resolve();
          return;
        }

        try {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          const compressor = this.audioContext.createDynamicsCompressor();

          // Conectar nodos: oscillator -> compressor -> gain -> destination
          oscillator.connect(compressor);
          compressor.connect(gainNode);
          gainNode.connect(this.audioContext.destination);

          // Configurar oscilador
          oscillator.frequency.value = frequency;
          oscillator.type = 'sine';

          // Configurar compressor para sonido más fuerte y claro
          compressor.threshold.value = -24;
          compressor.knee.value = 30;
          compressor.ratio.value = 12;
          compressor.attack.value = 0.003;
          compressor.release.value = 0.25;

          // Envelope para evitar clicks
          const now = this.audioContext.currentTime;
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

          // Reproducir
          oscillator.start(now);
          oscillator.stop(now + duration);

          oscillator.onended = () => resolve();
        } catch (error) {
          console.warn('Error reproduciendo tono:', error);
          resolve();
        }
      }, delay * 1000);
    });
  }

  async testSound(): Promise<void> {
    await this.playRestCompleteSound();
  }

  setSoundType(soundType: SoundType): void {
    this.currentSound = soundType;
    this.saveSettings();
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.saveSettings();
  }

  getCurrentSound(): SoundType {
    return this.currentSound;
  }

  getVolume(): number {
    return this.masterVolume;
  }

  isAudioEnabled(): boolean {
    return this.isEnabled;
  }

  getAvailableSounds(): Record<SoundType, SoundConfig> {
    return AVAILABLE_SOUNDS;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Hook para usar en componentes React
export function useSoundSettings() {
  return {
    playRestCompleteSound: () => soundManager.playRestCompleteSound(),
    testSound: () => soundManager.testSound(),
    setSoundType: (type: SoundType) => soundManager.setSoundType(type),
    setVolume: (volume: number) => soundManager.setVolume(volume),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    getCurrentSound: () => soundManager.getCurrentSound(),
    getVolume: () => soundManager.getVolume(),
    isEnabled: () => soundManager.isAudioEnabled(),
    availableSounds: soundManager.getAvailableSounds(),
  };
}