import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const server = createServer();
const wss = new WebSocketServer({ 
  server,
  // Add WebSocket server options
  clientTracking: true,
  // Handle CORS
  verifyClient: ({ origin, req, secure }, cb) => {
    // In development, accept all origins
    if (process.env.NODE_ENV === 'development') {
      cb(true);
      return;
    }
    
    // In production, verify origin
    const allowedOrigins = [
      'https://your-domain.com',
      'http://localhost:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      cb(true);
    } else {
      cb(false, 403, 'Origin not allowed');
    }
  }
});

// Store active rooms and connections
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Assign a unique ID to this connection
  ws.id = Math.random().toString(36).substr(2, 9);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'create-room':
          // Generate room ID and store it
          const roomId = Math.random().toString(36).substr(2, 9);
          rooms.set(roomId, {
            host: ws,
            peers: new Set(),
          });
          ws.send(JSON.stringify({ type: 'room-created', roomId }));
          console.log(`Room created: ${roomId}`);
          break;

        case 'join-room':
          const room = rooms.get(data.roomId);
          if (room) {
            room.peers.add(ws);
            room.host.send(JSON.stringify({
              type: 'peer-joined',
              peerId: ws.id
            }));
            ws.send(JSON.stringify({ type: 'joined-room', roomId: data.roomId }));
            console.log(`Peer ${ws.id} joined room ${data.roomId}`);
          } else {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Room not found'
            }));
          }
          break;

        case 'offer':
          if (data.target && rooms.has(data.roomId)) {
            const targetPeer = Array.from(rooms.get(data.roomId).peers)
              .find(peer => peer.id === data.target);
            if (targetPeer) {
              targetPeer.send(JSON.stringify({
                type: 'offer',
                offer: data.offer,
                from: ws.id
              }));
            }
          }
          break;

        case 'answer':
          if (data.target && rooms.has(data.roomId)) {
            const targetPeer = Array.from(rooms.get(data.roomId).peers)
              .find(peer => peer.id === data.target);
            if (targetPeer) {
              targetPeer.send(JSON.stringify({
                type: 'answer',
                answer: data.answer,
                from: ws.id
              }));
            }
          }
          break;

        case 'ice-candidate':
          if (data.target && rooms.has(data.roomId)) {
            const targetPeer = Array.from(rooms.get(data.roomId).peers)
              .find(peer => peer.id === data.target);
            if (targetPeer) {
              targetPeer.send(JSON.stringify({
                type: 'ice-candidate',
                candidate: data.candidate,
                from: ws.id
              }));
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Clean up rooms when host disconnects
    rooms.forEach((room, roomId) => {
      if (room.host === ws) {
        room.peers.forEach(peer => {
          peer.send(JSON.stringify({
            type: 'room-closed',
            roomId
          }));
        });
        rooms.delete(roomId);
      } else if (room.peers.has(ws)) {
        room.peers.delete(ws);
        room.host.send(JSON.stringify({
          type: 'peer-left',
          peerId: ws.id
        }));
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
}); 