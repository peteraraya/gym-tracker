import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymtracker.app',
  appName: 'GymLogiX',
  webDir: 'out',
  // `bundledWebRuntime` is not part of the current `CapacitorConfig` type
  // Remove or keep as runtime option if needed. Commenting out to satisfy types.
  // bundledWebRuntime: false,
  server: {
    // Usar la URL remota para que el APK cargue la web publicada
    url: 'https://gym-tracker-eta-amber.vercel.app',
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#08090b',
      showSpinner: false,
    },
  },
};

export default config;
