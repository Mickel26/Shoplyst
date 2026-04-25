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
  const [status, setStatus] = useState('Connecting...');
  const [connected, setConnected] = useState(false);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setStatus('Connected');
      setConnected(true);
    };

    ws.current.onerror = () => {
      setStatus('Connection error');
      setConnected(false);
    };

    ws.current.onclose = () => {
      setStatus('Disconnected');
      setConnected(false);
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'init') {
        setItems(data.items);
      }

      if (data.type === 'add') {
        setItems((prev) => [...prev, data.item]);
      }

      if (data.type === 'toggle') {
        setItems((prev) =>
          prev.map((item) =>
            item.id === data.id ? { ...item, done: !item.done } : item
          )
        );
      }
    };

    return () => ws.current.close();
  }, []);

  const addItem = () => {
    if (!input.trim() || !connected) return;
    ws.current.send(JSON.stringify({ type: 'add', name: input.trim() }));
    setInput('');
  };

  const toggleItem = (id) => {
    if (!connected) return;
    ws.current.send(JSON.stringify({ type: 'toggle', id }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Shoplyst</Text>
        <View style={[styles.statusBadge, connected ? styles.statusOk : styles.statusWaiting]}>
          <View style={[styles.dot, connected ? styles.dotOk : styles.dotWaiting]} />
          <Text style={[styles.statusText, connected ? styles.statusTextOk : styles.statusTextWaiting]}>
            {status}
          </Text>
        </View>
      </View>

      {/* Item list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => toggleItem(item.id)}>
            <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
              {item.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.itemText, item.done && styles.itemTextDone]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Add your first item 👇</Text>
        }
      />

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="e.g. milk, bread..."
          placeholderTextColor="#A09A8A"
          onSubmitEditing={addItem}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.button, !connected && styles.buttonDisabled]}
          onPress={addItem}
          disabled={!connected}
        >
          <Text style={styles.buttonText}>Add</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EEECE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: '#1D9E75',
    borderColor: '#1D9E75',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  itemText: {
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  itemTextDone: {
    textDecorationLine: 'line-through',
    color: '#A09A8A',
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