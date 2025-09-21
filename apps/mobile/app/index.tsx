import { Link } from 'expo-router';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { useOfflineQueue } from '../src/providers/offline-provider';
import { useAuth } from '../src/hooks/use-auth';

export default function HomeScreen() {
  const { login, user } = useAuth();
  const { pending, flush } = useOfflineQueue();
  const [form, setForm] = useState({ email: 'admin@polybright.test', password: 'Admin123!' });
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      await login(form.email, form.password);
      setMessage('Login successful.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Polybright IMS Mobile</Text>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.text}>Logged in as {user.email}</Text>
          <Link href="/scan" style={styles.button}>
            Open Scanner
          </Link>
          <TouchableOpacity style={styles.secondaryButton} onPress={flush}>
            <Text style={styles.buttonText}>Sync Now ({pending.length})</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={form.password}
            onChangeText={(value) => setForm((prev) => ({ ...prev, password: value }))}
          />
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
      {message && <Text style={styles.message}>{message}</Text>}
      <Text style={styles.caption}>Offline mutations queued: {pending.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    gap: 12,
    elevation: 2
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  button: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    textAlign: 'center'
  },
  secondaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  text: {
    fontSize: 16
  },
  caption: {
    marginTop: 12,
    color: '#475569'
  },
  message: {
    marginTop: 12,
    color: '#dc2626'
  }
});
