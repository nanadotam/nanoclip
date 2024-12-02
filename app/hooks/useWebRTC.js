import { useState, useEffect, useCallback } from 'react';
import { generateKeyPair, encryptData, decryptData } from '@/lib/crypto';
import SignalingService from '@/lib/SignalingService';
import FileTransferService from '@/lib/FileTransferService';

export function useWebRTC() {
  const [peerConnection, setPeerConnection] = useState(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [transferProgress, setTransferProgress] = useState(null);
  const [keyPair, setKeyPair] = useState(null);
  const [signaling] = useState(() => new SignalingService());
  const [fileChunks, setFileChunks] = useState(new Map());
  const [metadata, setMetadata] = useState(null);
  const [shareCode, setShareCode] = useState(null);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        {
          urls: 'turn:your-turn-server.com:3478',
          username: 'username',
          credential: 'password'
        }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signaling.sendIceCandidate(shareCode, event.candidate);
      }
    };

    pc.ondatachannel = (event) => {
      const dc = event.channel;
      setupDataChannel(dc);
      setDataChannel(dc);
    };

    pc.onconnectionstatechange = () => {
      setConnectionStatus(pc.connectionState);
    };

    setPeerConnection(pc);
    return pc;
  }, [shareCode, signaling]);

  const setupDataChannel = useCallback((dc) => {
    dc.binaryType = 'arraybuffer';
    
    dc.onopen = () => {
      setConnectionStatus('connected');
    };

    dc.onmessage = async (event) => {
      if (typeof event.data === 'string') {
        const message = JSON.parse(event.data);
        if (message.type === 'metadata') {
          setMetadata(message.data);
          setFileChunks(new Map());
        }
      } else {
        const chunks = fileChunks.get(metadata.name) || [];
        chunks.push(event.data);
        setFileChunks(new Map(fileChunks.set(metadata.name, chunks)));
        
        if (chunks.length === metadata.chunks) {
          const file = await FileTransferService.assembleFile(chunks, metadata);
          // Handle completed file
        }
      }
    };
  }, [fileChunks, metadata]);

  useEffect(() => {
    const handleOffer = async ({ shareCode: incomingCode, sdp, publicKey }) => {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      signaling.sendAnswer(incomingCode, {
        type: 'answer',
        sdp: pc.localDescription,
        publicKey: keyPair?.publicKey
      });
    };

    const handleAnswer = async ({ sdp }) => {
      if (peerConnection) {
        const desc = new RTCSessionDescription(sdp);
        await peerConnection.setRemoteDescription(desc);
      }
    };

    const handleIceCandidate = ({ candidate }) => {
      if (peerConnection && candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const initKeyPair = async () => {
      const keys = await generateKeyPair();
      setKeyPair(keys);
    };
    
    initKeyPair();
    signaling.on('offer', handleOffer);
    signaling.on('answer', handleAnswer);
    signaling.on('ice-candidate', handleIceCandidate);
    
    return () => {
      dataChannel?.close();
      peerConnection?.close();
    };
  }, [createPeerConnection, peerConnection, dataChannel, keyPair, signaling]);

  const initiateConnection = async (shareCode) => {
    const pc = createPeerConnection();
    const dc = pc.createDataChannel('fileTransfer');
    setupDataChannel(dc);
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    // Send offer with public key
    await sendToSignalingServer({
      type: 'offer',
      shareCode,
      sdp: pc.localDescription,
      publicKey: keyPair.publicKey
    });
  };

  const sendFile = async (file) => {
    if (!dataChannel || dataChannel.readyState !== 'open') {
      throw new Error('No active connection');
    }

    const chunks = await chunkFile(file);
    const encryptedChunks = await Promise.all(
      chunks.map(chunk => encryptData(chunk, keyPair.publicKey))
    );

    const metadata = {
      name: file.name,
      type: file.type,
      size: file.size,
      chunks: encryptedChunks.length
    };

    dataChannel.send(JSON.stringify({ type: 'metadata', data: metadata }));

    for (let i = 0; i < encryptedChunks.length; i++) {
      dataChannel.send(encryptedChunks[i]);
      setTransferProgress((i + 1) / encryptedChunks.length * 100);
    }
  };

  return {
    initiateConnection,
    sendFile,
    connectionStatus,
    transferProgress
  };
} 