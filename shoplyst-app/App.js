import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
const WS_URL = 'ws://192.168.0.213:8080';

export default function App() {
  const [status, setStatus] = useState('Łączenie...');

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('Połączono z serwerem!');
      setStatus('Połączono z serwerem ✓');
    };

    ws.onerror = (e) => {
      console.log('Błąd:', e.message);
      setStatus('Błąd połączenia ✗');
    };

    ws.onclose = () => {
      console.log('Rozłączono');
      setStatus('Rozłączono');
    };

    return () => ws.close();
  }, []);

  const connected = status.includes('✓');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shoplyst</Text>
      <View style={[styles.badge, connected ? styles.badgeOk : styles.badgeWaiting]}>
        <Text style={[styles.badgeText, connected ? styles.badgeTextOk : styles.badgeTextWaiting]}>
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  badgeOk: {
    backgroundColor: '#E1F5EE',
  },
  badgeWaiting: {
    backgroundColor: '#F1EFE8',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badgeTextOk: {
    color: '#085041',
  },
  badgeTextWaiting: {
    color: '#5F5E5A',
  },
});
