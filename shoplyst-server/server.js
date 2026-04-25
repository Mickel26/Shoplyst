const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

// In-memory list state
let items = [];

console.log(`Server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Client connected. Active clients:', wss.clients.size);

  // Send current list to newly connected client
  ws.send(JSON.stringify({ type: 'init', items }));

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === 'add') {
      const newItem = { id: Date.now().toString(), name: data.name, done: false };
      items.push(newItem);
      broadcast({ type: 'add', item: newItem });
    }

    if (data.type === 'toggle') {
      items = items.map((item) =>
        item.id === data.id ? { ...item, done: !item.done } : item
      );
      broadcast({ type: 'toggle', id: data.id });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Active clients:', wss.clients.size);
  });
});

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(data));
    }
  });
}