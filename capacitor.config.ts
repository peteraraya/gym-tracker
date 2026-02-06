import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymtracker.app',
  appName: 'Gym Tracker',
  webDir: 'out',
  // `bundledWebRuntime` is not part of the current `CapacitorConfig` type
  // Remove or keep as runtime option if needed. Commenting out to satisfy types.
  // bundledWebRuntime: false,
  server: {
    // Allow clear text traffic for local development
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      showSpinner: false,
    },
  },
};

export default config;
