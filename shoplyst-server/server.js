const { WebSocketServer } = require('ws');

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`Serwer działa na ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  console.log('Klient połączony. Aktywnych klientów:', wss.clients.size);

  ws.on('message', (message) => {
    const data = message.toString();
    console.log('Odebrano:', data);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('Klient rozłączony. Aktywnych klientów:', wss.clients.size);
  });
});