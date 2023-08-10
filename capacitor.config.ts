import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'airbnb-demo-ionic-app',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
