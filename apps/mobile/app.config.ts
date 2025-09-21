import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Polybright IMS',
  slug: 'polybright-ims',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  extra: {
    apiBase: process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:4000/api'
  }
};

export default config;
