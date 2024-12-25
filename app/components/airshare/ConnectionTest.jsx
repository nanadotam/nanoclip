import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PeerConnection from '@/lib/webrtc/PeerConnection';

export default function ConnectionTest() {
  const [status, setStatus] = useState('disconnected');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const createRoom = async () => {
    try {
      setStatus('connecting');
      const peer = new PeerConnection({
        onDeviceConnected: (peerId) => {
          console.log('Device connected:', peerId);
          setStatus('connected to peer: ' + peerId);
        }
      });

      peer.on('datachannel-open', () => {
        console.log('Data channel opened');
      });

      const newRoomId = await peer.createRoom();
      console.log('Room created:', newRoomId);
      setRoomId(newRoomId);
      setStatus('room created: ' + newRoomId);
    } catch (err) {
      console.error('Create room error:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  const joinRoom = async () => {
    if (!roomId) return;
    
    try {
      setStatus('joining');
      const peer = new PeerConnection({
        onDeviceConnected: (peerId) => {
          setStatus('connected to peer: ' + peerId);
        }
      });

      await peer.joinRoom(roomId);
      setStatus('joined room: ' + roomId);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">Connection Test</h2>
      <div className="space-y-4">
        <div>
          <Button onClick={createRoom}>Create Room</Button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter Room ID"
            className="border p-2 rounded"
          />
          <Button onClick={joinRoom}>Join Room</Button>
        </div>

        <div>Status: {status}</div>
        {error && <div className="text-red-500">Error: {error}</div>}
      </div>
    </Card>
  );
} 