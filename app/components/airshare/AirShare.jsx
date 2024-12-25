"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Users, Upload, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import PeerConnection from '@/lib/webrtc/PeerConnection';
import DevicesList from './DevicesList';
import TransferProgress from './TransferProgress';
import RoomModal from './RoomModal';
import { generateDeviceName, detectDeviceType } from '@/lib/utils/deviceNames';
import ReceivingView from './ReceivingView';
import ConnectedDevice from './ConnectedDevice';
import HostInfo from './HostInfo';
import FileList from './FileList';

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
                deviceInfo: {
                    name: deviceName,
                    type: deviceType,
                    id: receiverDevice.id
                },
                onProgress: (progress) => setTransferProgress(progress),
                onComplete: () => {
                    toast({
                        title: "Transfer Complete",
                        description: "Files have been successfully shared!"
                    });
                    setTransferProgress(0);
                },
                onDeviceConnected: async (deviceId, deviceInfo) => {
                    setConnectionStatus('connected');
                    setSenderDevice(deviceInfo);
                }
            });

            // Create a public room by default
            const roomId = await peerConnection.current.createRoom('public');
            setCurrentRoomId(roomId);
            setShowRoomCard(true);
            setConnectionStatus('waiting for connection');
        } catch (error) {
            handleConnectionError(error);
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

                            {isHost && <HostInfo
                                deviceName={deviceName}
                                deviceType={deviceType}
                                onNameChange={handleDeviceNameChange}
                            />}

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
                                            Join Room
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-input"
                                        />
                                        <label htmlFor="file-input" className="w-full">
                                            <Button variant="outline" className="w-full" asChild>
                                                <span>
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Choose Files
                                                </span>
                                            </Button>
                                        </label>

                                        {selectedFiles.length > 0 && (
                                            <FileList
                                                files={selectedFiles}
                                                onRemoveFile={(index) => {
                                                    const newFiles = [...selectedFiles];
                                                    newFiles.splice(index, 1);
                                                    setSelectedFiles(newFiles);
                                                }}
                                                transferProgress={transferProgress}
                                            />
                                        )}

                                        {selectedFiles.length > 0 && (
                                            <Button
                                                onClick={sendFiles}
                                                disabled={!selectedFiles.length || connectionStatus !== 'connected'}
                                                className="w-full"
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Send Files
                                            </Button>
                                        )}
                                    </>
                                )}

                                <div className="text-sm text-muted-foreground text-center">
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

                    {isHost && <DevicesList
                        nearbyDevices={devices}
                        connectedDevices={connectedDevices}
                        onDeviceSelect={(deviceId) => {
                            // Handle device selection
                        }}
                        onNameChange={(deviceId) => {
                            // Handle name change
                        }}
                    />}

                    {transferProgress > 0 && (
                        <TransferProgress progress={transferProgress} />
                    )}
                </motion.div>
            )}
        </div>
    );
} 