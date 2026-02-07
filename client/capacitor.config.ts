import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yamishop.app',
  appName: 'Yamishop',
  webDir: 'dist/client/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
