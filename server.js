import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { networkInterfaces } from 'os';

// Get local IP address
const getLocalIP = () => {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();
const PORT = 3001;

const server = createServer();
const wss = new WebSocketServer({ server });

// Log connection info
server.listen(PORT, localIP, () => {
  console.log(`WebSocket server running at:`);
  console.log(`ws://${localIP}:${PORT}`);
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

        case 'device-info-update':
          if (rooms.has(data.roomId)) {
            const room = rooms.get(data.roomId);
            if (data.deviceInfo) {
              // Broadcast device info to all peers in the room
              room.peers.forEach(peer => {
                peer.send(JSON.stringify({
                  type: 'peer-device-info',
                  deviceInfo: data.deviceInfo
                }));
              });
            }
          }
          break;

        case 'key-exchange':
          if (data.target && rooms.has(data.roomId)) {
            const targetPeer = Array.from(rooms.get(data.roomId).peers)
              .find(peer => peer.id === data.target);
            if (targetPeer) {
              targetPeer.send(JSON.stringify({
                type: 'session-key',
                key: data.key,
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