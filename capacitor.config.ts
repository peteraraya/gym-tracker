import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymtracker.app',
  appName: 'GymLogiX',
  webDir: 'out',
  // `bundledWebRuntime` is not part of the current `CapacitorConfig` type
  // Remove or keep as runtime option if needed. Commenting out to satisfy types.
  // bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0c',
      showSpinner: false,
    },
  },
};

export default config;
