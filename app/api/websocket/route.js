import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

const wss = new WebSocketServer({ noServer: true });
const rooms = new Map();

export function GET(req) {
  if (req.headers.upgrade !== 'websocket') {
    return new Response('Expected Websocket', { status: 400 });
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    switch (data.type) {
      case 'create-room':
        const roomId = generateRoomId();
        rooms.set(roomId, {
          host: ws,
          peers: new Set()
        });
        ws.send(JSON.stringify({ type: 'room-created', roomId }));
        break;
        
      case 'join-room':
        const room = rooms.get(data.roomId);
        if (room) {
          room.peers.add(ws);
          room.host.send(JSON.stringify({
            type: 'peer-joined',
            peerId: ws.id
          }));
        }
        break;
    }
  });
} 