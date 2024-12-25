"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestConnection() {
  const [roomId, setRoomId] = useState('');

  return (
    <Card className="p-4 mt-4">
      <h3 className="font-medium mb-2">Quick Test</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <Button onClick={() => window.open(`/airshare?room=${roomId}`, '_blank')}>
          Join Room
        </Button>
      </div>
    </Card>
  );
} 