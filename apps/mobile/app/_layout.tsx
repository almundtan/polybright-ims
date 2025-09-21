import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { OfflineProvider } from '../src/providers/offline-provider';
import { AuthProvider } from '../src/hooks/use-auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <OfflineProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="index" options={{ title: 'Polybright IMS' }} />
          <Stack.Screen name="scan" options={{ title: 'Barcode Scanner' }} />
        </Stack>
      </OfflineProvider>
    </AuthProvider>
  );
}
