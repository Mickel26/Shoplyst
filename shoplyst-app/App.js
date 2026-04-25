import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const WS_BASE_URL = process.env.EXPO_PUBLIC_WS_URL;

// Generate a random room ID or get from storage
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function App() {
  const [screen, setScreen] = useState('home'); // 'home' | 'list'
  const [roomId, setRoomId] = useState('');
  const [joinInput, setJoinInput] = useState('');
  const [status, setStatus] = useState('Connecting...');
  const [connected, setConnected] = useState(false);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);

  const connectToRoom = (id) => {
    const upperId = id.toUpperCase();
    setRoomId(upperId);
    setScreen('list');
    setItems([]);
    setStatus('Connecting...');
    setConnected(false);

    ws.current = new WebSocket(`${WS_BASE_URL}/${upperId}`);

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

      if (data.type === 'init') setItems(data.items);

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
  };

  const createRoom = () => {
    const id = generateRoomId();
    connectToRoom(id);
  };

  const joinRoom = () => {
    if (!joinInput.trim()) return;
    connectToRoom(joinInput.trim());
  };

  const addItem = () => {
    if (!input.trim() || !connected) return;
    ws.current.send(JSON.stringify({ type: 'add', name: input.trim() }));
    setInput('');
  };

  const toggleItem = (id) => {
    if (!connected) return;
    ws.current.send(JSON.stringify({ type: 'toggle', id }));
  };

  const shareRoom = () => {
    Share.share({
      message: `Join my Shoplyst! Room code: ${roomId}`,
    });
  };

  const leaveRoom = () => {
    ws.current?.close();
    setScreen('home');
    setRoomId('');
    setItems([]);
  };

  // Home screen
  if (screen === 'home') {
    return (
      <View style={styles.container}>
        <View style={styles.homeContent}>
          <Text style={styles.logo}>🛒</Text>
          <Text style={styles.title}>Shoplyst</Text>
          <Text style={styles.subtitle}>Shared shopping lists, in real time.</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={createRoom}>
            <Text style={styles.primaryButtonText}>Create a new list</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or join existing</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.joinRow}>
            <TextInput
              style={styles.joinInput}
              value={joinInput}
              onChangeText={setJoinInput}
              placeholder="Room code"
              placeholderTextColor="#A09A8A"
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity style={styles.joinButton} onPress={joinRoom}>
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // List screen
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={leaveRoom}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.roomCode}>{roomId}</Text>
          <View style={[styles.dot, connected ? styles.dotOk : styles.dotWaiting]} />
        </View>
        <TouchableOpacity onPress={shareRoom}>
          <Text style={styles.shareButton}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
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
          !connected
            ? <ActivityIndicator style={{ marginTop: 60 }} color="#A09A8A" />
            : <Text style={styles.empty}>Add your first item 👇</Text>
        }
      />

      {/* Input */}
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
  // Home screen
  homeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  logo: {
    fontSize: 56,
    marginBottom: 4,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 15,
    color: '#A09A8A',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEECE6',
  },
  dividerText: {
    fontSize: 13,
    color: '#A09A8A',
  },
  joinRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  joinInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#EEECE6',
    color: '#1A1A1A',
    letterSpacing: 2,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  // List screen
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
  backButton: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomCode: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#1A1A1A',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOk: { backgroundColor: '#1D9E75' },
  dotWaiting: { backgroundColor: '#A09A8A' },
  shareButton: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
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