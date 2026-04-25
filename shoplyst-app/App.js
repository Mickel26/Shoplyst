import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const WS_URL = process.env.EXPO_PUBLIC_WS_URL;

export default function App() {
  const [status, setStatus] = useState('Łączenie...');
  const [connected, setConnected] = useState(false);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setStatus('Połączono');
      setConnected(true);
    };

    ws.current.onerror = () => {
      setStatus('Błąd połączenia');
      setConnected(false);
    };

    ws.current.onclose = () => {
      setStatus('Rozłączono');
      setConnected(false);
    };

    ws.current.onmessage = (e) => {
      const name = e.data;
      setItems((prev) => [...prev, { id: Date.now().toString(), name }]);
    };

    return () => ws.current.close();
  }, []);

  const addItem = () => {
    if (!input.trim() || !connected) return;
    ws.current.send(input.trim());
    setInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Nagłówek */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Shoplyst</Text>
        <View style={[styles.statusBadge, connected ? styles.statusOk : styles.statusWaiting]}>
          <View style={[styles.dot, connected ? styles.dotOk : styles.dotWaiting]} />
          <Text style={[styles.statusText, connected ? styles.statusTextOk : styles.statusTextWaiting]}>
            {status}
          </Text>
        </View>
      </View>

      {/* Lista produktów */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Dodaj pierwszy produkt 👇</Text>
        }
      />

      {/* Pole dodawania */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="np. mleko, chleb..."
          placeholderTextColor="#A09A8A"
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.button, !connected && styles.buttonDisabled]}
          onPress={addItem}
          disabled={!connected}
        >
          <Text style={styles.buttonText}>Dodaj</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEECE6',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#1A1A1A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusOk: { backgroundColor: '#E1F5EE' },
  statusWaiting: { backgroundColor: '#F1EFE8' },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotOk: { backgroundColor: '#1D9E75' },
  dotWaiting: { backgroundColor: '#A09A8A' },
  statusText: { fontSize: 12, fontWeight: '500' },
  statusTextOk: { color: '#085041' },
  statusTextWaiting: { color: '#5F5E5A' },
  list: {
    padding: 20,
    gap: 10,
    flexGrow: 1,
  },
  item: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEECE6',
  },
  itemText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  empty: {
    textAlign: 'center',
    color: '#A09A8A',
    fontSize: 15,
    marginTop: 60,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEECE6',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#FAFAF8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EEECE6',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C8C4BA',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});