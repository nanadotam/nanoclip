const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

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
            type: data.roomType || 'public'
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
              peerId: ws.id,
              deviceInfo: data.deviceInfo
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
                if (peer !== ws) {
                  peer.send(JSON.stringify({
                    type: 'peer-device-info',
                    deviceInfo: data.deviceInfo
                  }));
                }
              });
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