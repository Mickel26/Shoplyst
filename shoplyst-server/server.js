const { WebSocketServer } = require('ws');
const { randomUUID } = require('crypto');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

// Rooms state: { [roomId]: { items: [], clients: Set } }
const rooms = {};

function getOrCreateRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = { items: [], clients: new Set() };
  }
  return rooms[roomId];
}

function broadcastToRoom(roomId, data) {
  const room = rooms[roomId];
  if (!room) return;
  room.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}

console.log(`Server running on port ${PORT}`);

wss.on('connection', (ws, req) => {
  // Room ID comes from URL: ws://server/ROOMID
  const roomId = req.url?.replace('/', '') || 'default';
  const room = getOrCreateRoom(roomId);
  room.clients.add(ws);

  console.log(`Client joined room: ${roomId}. Clients in room: ${room.clients.size}`);

  // Send current list to newly connected client
  ws.send(JSON.stringify({ type: 'init', items: room.items }));

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'add') {
      const newItem = { id: randomUUID(), name: data.name, done: false };
      room.items.push(newItem);
      broadcastToRoom(roomId, { type: 'add', item: newItem });
    }

    if (data.type === 'toggle') {
      room.items = room.items.map((item) =>
        item.id === data.id ? { ...item, done: !item.done } : item
      );
      broadcastToRoom(roomId, { type: 'toggle', id: data.id });
    }
  });

  ws.on('close', () => {
    room.clients.delete(ws);
    console.log(`Client left room: ${roomId}. Clients in room: ${room.clients.size}`);
  });
});