const { WebSocketServer } = require('ws');

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`Serwer działa na ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Klient połączony. Aktywnych klientów:', wss.clients.size);

  ws.on('message', (message) => {
    console.log('Odebrano:', message.toString());
  });

  ws.on('close', () => {
    console.log('Klient rozłączony. Aktywnych klientów:', wss.clients.size);
  });
});
