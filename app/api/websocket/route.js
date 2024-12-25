import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { NextResponse } from 'next/server';

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocketServer({ server });
    this.rooms = {
      ip: new Map(),
      public: new Map(),
      secret: new Map()
    };
    
    this.wss.on('connection', (socket, request) => {
      const peer = new Peer(socket, request);
      this.handleConnection(peer);
    });
  }

  handleConnection(peer) {
    peer.socket.on('message', (message) => {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'create-room':
          this.handleCreateRoom(peer, data);
          break;
        case 'join-room':
          this.handleJoinRoom(peer, data);
          break;
        case 'signal':
          this.handleSignal(peer, data);
          break;
      }
    });
  }

  handleCreateRoom(peer, data) {
    const roomId = crypto.randomBytes(16).toString('hex');
    const room = {
      id: roomId,
      type: data.roomType,
      peers: new Map()
    };
    
    room.peers.set(peer.id, peer);
    this.rooms[data.roomType].set(roomId, room);
    
    peer.send({
      type: 'room-created',
      roomId,
      roomType: data.roomType
    });
  }
}

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