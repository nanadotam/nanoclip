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
import RoomModal from './RoomModal';
import { generateDeviceName, detectDeviceType } from '@/lib/utils/deviceNames';
import ReceivingView from './ReceivingView';
import ConnectedDevice from './ConnectedDevice';

export default function AirShare() {
  const [isHost, setIsHost] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [transferProgress, setTransferProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const peerConnection = useRef(null);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [showRoomCard, setShowRoomCard] = useState(false);
  const [deviceName, setDeviceName] = useState(generateDeviceName());
  const [deviceType, setDeviceType] = useState(detectDeviceType());
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [senderDevice, setSenderDevice] = useState(null);
  const [receiverDevice, setReceiverDevice] = useState({
    name: deviceName,
    type: deviceType,
    id: Math.random().toString(36).substr(2, 9)
  });

  useEffect(() => {
    // Initialize PeerConnection with device info
    if (peerConnection.current) {
      peerConnection.current.updateDeviceInfo({
        name: deviceName,
        type: deviceType,
        id: receiverDevice.id
      });
    }
  }, [deviceName, deviceType]);

  const handleDeviceNameChange = (newName) => {
    setDeviceName(newName);
    if (peerConnection.current) {
      peerConnection.current.updateDeviceInfo({
        name: newName,
        type: deviceType,
        id: receiverDevice.id
      });
    }
  };

  const startHosting = async () => {
    try {
      setIsHost(true);
      setConnectionStatus('creating room');
      
      peerConnection.current = new PeerConnection({
        deviceName,
        deviceType,
        onProgress: (progress) => setTransferProgress(progress),
        onComplete: () => {
          toast({
            title: "Transfer Complete",
            description: "Files have been successfully shared!"
          });
          setTransferProgress(0);
        },
        onDeviceConnected: (deviceId, deviceInfo) => {
          const connectedDevice = deviceInfo || {
            id: deviceId,
            name: 'Unknown Device',
            type: 'laptop'
          };
          
          toast({
            title: "Device Connected",
            description: `${connectedDevice.name} joined the room`
          });
          setConnectionStatus('connected');
          setConnectedDevices(prev => [...prev, connectedDevice]);
        },
        onDeviceInfoUpdate: (deviceInfo) => {
          if (!deviceInfo) return;
          
          setSenderDevice(deviceInfo);
          setConnectedDevices(prev => 
            prev.map(d => d.id === deviceInfo.id ? deviceInfo : d)
          );
        }
      });

      const roomId = await peerConnection.current.createRoom();
      setCurrentRoomId(roomId);
      setShowRoomCard(true);
      setConnectionStatus('waiting for connection');
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive"
      });
      setConnectionStatus('error');
      setIsHost(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const sendFiles = async () => {
    if (!selectedFiles.length) {
      toast({
        title: "No Files Selected",
        description: "Please select files to share",
        variant: "destructive"
      });
      return;
    }

    try {
      setConnectionStatus('sending');
      for (const file of selectedFiles) {
        await peerConnection.current.sendFile(file);
      }
      setConnectionStatus('sent');
      setSelectedFiles([]);
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive"
      });
      setConnectionStatus('error');
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      setConnectionStatus('joining');
      setIsHost(false);
      
      if (!peerConnection.current) {
        peerConnection.current = new PeerConnection({
          deviceName,
          deviceType,
          onProgress: (progress) => {
            setTransferProgress(progress);
            setConnectionStatus('receiving');
          },
          onComplete: () => {
            toast({
              title: "Transfer Complete",
              description: "Files have been successfully received!"
            });
            setTransferProgress(0);
            setConnectionStatus('connected');
          },
          onDeviceConnected: (deviceId, deviceInfo) => {
            setSenderDevice(deviceInfo);
            setConnectionStatus('connected');
            toast({
              title: "Connected",
              description: `Connected to ${deviceInfo?.name || 'device'}`
            });
          },
          onDeviceInfoUpdate: (deviceInfo) => {
            if (!deviceInfo) return;
            setSenderDevice(deviceInfo);
          }
        });
      }

      await peerConnection.current.joinRoom(roomId);
      setShowRoomCard(false);
      setCurrentRoomId(roomId);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Join room error:', error);
      toast({
        title: "Join Error",
        description: error.message,
        variant: "destructive"
      });
      setConnectionStatus('error');
      setIsHost(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      {(!isHost && (connectionStatus === 'connected' || connectionStatus === 'receiving')) ? (
        <ReceivingView
          senderDevice={senderDevice}
          receiverDevice={receiverDevice}
          transferProgress={transferProgress}
          onNameChange={handleDeviceNameChange}
          connectionStatus={connectionStatus}
          selectedFiles={selectedFiles}
        />
      ) : (
        // Hosting View
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6">
            <div className="flex flex-col items-center gap-6">
              <h2 className="text-2xl font-bold">AirShare</h2>
              <p className="text-muted-foreground text-center">
                Share files instantly with nearby devices
              </p>
              
              <div className="flex flex-col items-center gap-4 w-full">
                {!isHost ? (
                  <div className="w-full space-y-4">
                    <Button onClick={startHosting} className="w-full">
                      <Wifi className="mr-2 h-4 w-4" />
                      Create Room
                    </Button>
                    <Button 
                      onClick={() => setShowRoomCard(true)} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Join Existing Room
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="w-full">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    {selectedFiles.length > 0 && (
                      <div className="w-full">
                        <h3 className="font-medium mb-2">Selected Files:</h3>
                        <ul className="space-y-2">
                          {selectedFiles.map((file, index) => (
                            <li key={index} className="text-sm">
                              {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button 
                      onClick={sendFiles}
                      disabled={!selectedFiles.length || connectionStatus !== 'connected'}
                      className="w-full"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Send Files
                    </Button>
                  </>
                )}

                <div className="text-sm text-muted-foreground">
                  Status: {connectionStatus}
                </div>
              </div>
            </div>
          </Card>

          <RoomModal
            roomId={currentRoomId}
            isVisible={showRoomCard || currentRoomId}
            onClose={() => setShowRoomCard(false)}
            onJoinRoom={handleJoinRoom}
          />

          {isHost && <DeviceList devices={devices} />}

          {transferProgress > 0 && (
            <TransferProgress progress={transferProgress} />
          )}

          {/* Connected Devices Card */}
          {connectedDevices.length > 0 && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Connected Devices</h3>
              <div className="space-y-2">
                {connectedDevices.map(device => (
                  <ConnectedDevice
                    key={device.id}
                    device={device}
                    isReceiving={transferProgress > 0}
                    onNameChange={(newName) => {
                      setConnectedDevices(prev =>
                        prev.map(d => d.id === device.id 
                          ? { ...d, name: newName }
                          : d
                        )
                      );
                    }}
                  />
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
} 