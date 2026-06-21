import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ngojekyuk.app',
  appName: 'NgojekYuk',
  webDir: 'www',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '546807043611-bo5omk0o5432h00siqidv0fc4qd1g5qf.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;