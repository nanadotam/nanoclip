"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Users, Upload, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PeerConnection from '@/lib/webrtc/PeerConnection';
import DeviceList from './DeviceList';
import TransferProgress from './TransferProgress';

export default function AirShare() {
  const [devices, setDevices] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [transferProgress, setTransferProgress] = useState(0);
  const peerConnection = useRef(null);
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'devices') {
        setDevices(data.devices);
      }
    };

    return () => ws.close();
  }, []);

  const startHosting = async () => {
    setIsHost(true);
    peerConnection.current = new PeerConnection({
      onProgress: (progress) => setTransferProgress(progress),
      onComplete: () => {
        toast({
          title: "Transfer Complete",
          description: "Files have been successfully shared!"
        });
      }
    });
    
    await peerConnection.current.createRoom();
  };

  const joinRoom = async (roomId) => {
    peerConnection.current = new PeerConnection({
      onProgress: (progress) => setTransferProgress(progress),
      onComplete: () => {
        toast({
          title: "Transfer Complete",
          description: "Files have been successfully received!"
        });
      }
    });
    
    await peerConnection.current.joinRoom(roomId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Card className="p-6">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-bold">AirShare</h2>
            <p className="text-muted-foreground text-center">
              Share files instantly with nearby devices
            </p>
            
            {!isHost && (
              <Button onClick={startHosting}>
                <Wifi className="mr-2 h-4 w-4" />
                Start Sharing
              </Button>
            )}
          </div>
        </Card>

        {isHost && (
          <DeviceList
            devices={devices}
            onDeviceSelect={joinRoom}
          />
        )}

        {(transferProgress > 0 && transferProgress < 100) && (
          <TransferProgress progress={transferProgress} />
        )}
      </motion.div>
    </div>
  );
} 