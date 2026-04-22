# Shoplyst 🛒

A real-time shared shopping list for couples and roommates. Add or check off items on one phone — they appear instantly on the other.

## The problem

Sending shopping lists over a messenger is broken. You buy milk because you didn't see your partner already added it. Items don't update in real time. Shoplyst fixes that.

## Features

- Real-time sync between devices using WebSockets
- Check off items — updates instantly for everyone
- New devices joining get the current list immediately
- Animated item appearance when someone else adds a product
- Works on iOS and Android via Expo

## Tech stack

| Layer | Technology |
|---|---|
| Mobile app | React Native (Expo) |
| Server | Node.js + ws |
| Real-time | WebSockets |
| State sync | In-memory broadcast (Redis in v2) |

## Project structure

```
shoplyst/              ← Expo mobile app
  App.js
  package.json

shoplyst-server/       ← Node.js WebSocket server
  server.js
  package.json
```

## Getting started

### Prerequisites

- Node.js 18+
- Expo Go app on your phone (iOS or Android)
- Both devices on the same Wi-Fi network

### Run the server

```bash
cd shoplyst-server
npm install
node server.js
```

Server starts on `ws://localhost:8080`.

### Run the app

```bash
cd shoplyst
npm install
npx expo start
```

Scan the QR code with Expo Go. Make sure to set your local IP address in `App.js`:

```js
const WS_URL = 'ws://YOUR_LOCAL_IP:8080';
```

Find your IP with `ipconfig` (Windows) or `ifconfig` (Mac).

## How it works

Each client opens a persistent WebSocket connection to the server. When a user adds or checks off an item, the app sends a typed message (`add` or `toggle`) to the server. The server updates its in-memory list and broadcasts the new state to every connected client.

```
Phone A  ──add "milk"──►  Server  ──broadcast──►  Phone B
                              │
                              └──broadcast──►  Phone A
```

New clients receive the full current list on connection, so late joiners are always in sync.

## Roadmap

- [ ] Persistent storage with PostgreSQL
- [ ] User accounts and named lists
- [ ] Multiple lists per household
- [ ] Push notifications when partner adds items
- [ ] Offline mode with sync on reconnect

