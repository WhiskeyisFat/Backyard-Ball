// WebSocket Server for Backyard Ball Real-Time Chat
const { WebSocketServer } = require('ws');
const http = require('http');

// Create a standard HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Backyard Ball WebSocket Server is running!\n');
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New player connected to real-time chat!');
  clients.add(ws);

  // Send a welcome handshake message
  ws.send(JSON.stringify({
    type: 'system',
    text: 'Connected to Backyard Ball Real-Time Chat Server!'
  }));

  // Handle incoming messages from a player
  ws.on('message', (data) => {
    try {
      const parsedMessage = JSON.parse(data.toString());
      console.log(`[Message received from ${parsedMessage.name}]:`, parsedMessage.text);

      // Broadcast the message to ALL connected clients
      const broadcastData = JSON.stringify({
        type: 'chat',
        id: parsedMessage.id || 'c_' + Date.now(),
        user: parsedMessage.user,
        name: parsedMessage.name,
        text: parsedMessage.text,
        timestamp: parsedMessage.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      for (const client of clients) {
        if (client.readyState === 1) { // 1 = OPEN
          client.send(broadcastData);
        }
      }
    } catch (err) {
      console.error('Error parsing WebSocket message:', err);
    }
  });

  // Handle disconnection
  ws.on('close', () => {
    console.log('Player disconnected.');
    clients.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('WebSocket client error:', err);
    clients.delete(ws);
  });
});

// Start listening on port 8080 (or process.env.PORT for deployment)
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on port ${PORT}`);
});
