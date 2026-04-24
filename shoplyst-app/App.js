import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

export default function App() {
  const [status, setStatus] = useState('Łączenie...');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setStatus('Połączono z serwerem');
      setConnected(true);
    };

    ws.onerror = () => {
      setStatus('Błąd połączenia');
      setConnected(false);
    };

    ws.onclose = () => {
      setStatus('Rozłączono');
      setConnected(false);
    };

    ws.onmessage = (e) => {
      console.log('Wiadomość od serwera:', e.data);
    };

    return () => ws.close();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛒 Shoplyst</Text>

      <View style={[styles.statusBadge, connected ? styles.statusOk : styles.statusWaiting]}>
        <View style={[styles.dot, connected ? styles.dotOk : styles.dotWaiting]} />
        <Text style={[styles.statusText, connected ? styles.statusTextOk : styles.statusTextWaiting]}>
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  statusOk: {
    backgroundColor: '#E1F5EE',
  },
  statusWaiting: {
    backgroundColor: '#F1EFE8',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOk: {
    backgroundColor: '#1D9E75',
  },
  dotWaiting: {
    backgroundColor: '#A09A8A',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusTextOk: {
    color: '#085041',
  },
  statusTextWaiting: {
    color: '#5F5E5A',
  },
});