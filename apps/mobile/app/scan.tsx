import { BarCodeScanner } from 'expo-barcode-scanner';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOfflineQueue } from '../src/providers/offline-provider';
import { useAuth } from '../src/hooks/use-auth';

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const { enqueue } = useOfflineQueue();
  const { user } = useAuth();

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScannedCode(data);
    enqueue({ type: 'barcode.scan', payload: { data, userId: user?.id } }).catch((error) => {
      console.warn('Failed to enqueue scan', error);
    });
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Requesting camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.text}>Camera permission denied.</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.scannerContainer}>
        <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
      </View>
      <Text style={styles.text}>Point camera at barcode</Text>
      {scannedCode && <Text style={styles.caption}>Last scanned: {scannedCode}</Text>}
      <TouchableOpacity style={styles.button} onPress={() => setScannedCode(null)}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0f172a'
  },
  scannerContainer: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
    borderRadius: 16,
    marginVertical: 24
  },
  text: {
    color: '#f8fafc',
    fontSize: 16
  },
  caption: {
    marginTop: 12,
    color: '#cbd5f5'
  },
  button: {
    marginTop: 24,
    backgroundColor: '#1d4ed8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  }
});
