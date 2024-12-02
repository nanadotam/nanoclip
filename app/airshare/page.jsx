"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebRTC } from '@/hooks/useWebRTC';
import DeviceDiscovery from '@/components/airshare/DeviceDiscovery';
import DeviceCard from '@/components/airshare/DeviceCard';
import { TransferProgress } from '@/components/airshare/TransferProgress';
import { useDropzone } from 'react-dropzone';

export default function AirSharePage() {
  const [devices, setDevices] = useState([]);
  const [shareCode, setShareCode] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const { initiateConnection, sendFile, connectionStatus, transferProgress } = useWebRTC();

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => setSelectedFiles(acceptedFiles)
  });

  useEffect(() => {
    setShareCode(Math.floor(100000 + Math.random() * 900000).toString());
    // Start listening for nearby devices
    initiateConnection(shareCode);
  }, []);

  const handleShare = async () => {
    for (const file of selectedFiles) {
      await sendFile(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <motion.div className="space-y-8 md:space-y-12">
        {/* Header section */}
        <motion.div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">AirShare</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Share files instantly with nearby devices or using a share code
          </p>
        </motion.div>

        {/* Share code and file drop section */}
        <motion.div>
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-none">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground mb-2">Your share code:</p>
                <p className="text-4xl font-mono font-bold text-primary tracking-widest">
                  {shareCode}
                </p>
              </div>

              <div {...getRootProps()} className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                <input {...getInputProps()} />
                <p>Drop files here or click to select</p>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Selected Files:</h3>
                  <ul className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{file.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="mt-4 w-full"
                    onClick={handleShare}
                    disabled={connectionStatus !== 'connected'}
                  >
                    Share Files
                  </Button>
                </div>
              )}

              {transferProgress !== null && (
                <TransferProgress 
                  progress={transferProgress}
                  fileName={selectedFiles[0]?.name}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Device discovery section */}
        <DeviceDiscovery devices={devices} onShare={handleShare} />

        {/* Nearby devices grid */}
        <motion.div>
          <h2 className="text-xl font-semibold mb-4">Nearby Devices</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <DeviceCard 
                key={device.id} 
                device={device}
                progress={device.id === selectedDevice?.id ? transferProgress : undefined}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 