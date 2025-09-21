import Constants from 'expo-constants';

export const API_BASE =
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.apiBase ??
  'http://localhost:4000/api';
