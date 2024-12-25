import { EventEmitter } from 'events';

export default class PeerConnection extends EventEmitter {
  constructor(options = {}) {
    super();
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onDeviceConnected = options.onDeviceConnected || (() => {});
    this.onDeviceInfoUpdate = options.onDeviceInfoUpdate || (() => {});
    
    this.ws = null;
    this.dataChannel = null;
    this.deviceInfo = options.deviceInfo || {};
    this.isHost = false;
    this.roomId = null;
    this.peerId = null;

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });
    
    this.setupPeerConnection();
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.setupWebSocket();
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(new Error('Failed to connect to WebSocket server'));
        };

        setTimeout(() => {
          if (this.ws.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket connection timeout'));
          }
        }, 5000);
      } catch (error) {
        reject(new Error(`WebSocket initialization failed: ${error.message}`));
      }
    });
  }

  setupWebSocket() {
    this.ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'room-created':
            this.roomId = data.roomId;
            this.emit('room-created', data.roomId);
            break;
            
          case 'peer-joined':
            this.peerId = data.peerId;
            this.onDeviceConnected(this.peerId, data.deviceInfo);
            await this.createOffer();
            break;
            
          case 'offer':
            await this.handleOffer(data.offer, data.from);
            break;
            
          case 'answer':
            await this.handleAnswer(data.answer);
            break;
            
          case 'ice-candidate':
            await this.handleIceCandidate(data.candidate);
            break;

          case 'peer-device-info':
            this.onDeviceInfoUpdate(data.deviceInfo);
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
  }

  setupPeerConnection() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ice-candidate',
          candidate: event.candidate,
          target: this.peerId,
          roomId: this.roomId
        }));
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }

  setupDataChannel() {
    const channel = this.isHost ? 
      this.peerConnection.createDataChannel('fileTransfer', { ordered: true }) :
      this.dataChannel;

    if (!channel) return;

    channel.onopen = () => {
      console.log('Data channel opened');
      this.dataChannel = channel;
      this.emit('data-channel-open');
    };

    channel.onclose = () => {
      console.log('Data channel closed');
      this.dataChannel = null;
      this.emit('data-channel-close');
    };

    channel.onerror = (error) => {
      console.error('Data channel error:', error);
      this.emit('data-channel-error', error);
    };

    channel.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'file-metadata':
            this.handleFileMetadata(data);
            break;
          case 'file-chunk':
            await this.handleFileChunk(data);
            break;
          case 'transfer-complete':
            this.handleTransferComplete(data);
            break;
        }
      } catch (error) {
        console.error('Error processing data channel message:', error);
      }
    };
  }

  async createRoom(type = 'public') {
    await this.connect();
    this.isHost = true;
    
    this.ws.send(JSON.stringify({
      type: 'create-room',
      roomType: type,
      deviceInfo: this.deviceInfo
    }));

    return new Promise((resolve) => {
      this.once('room-created', (roomId) => {
        resolve(roomId);
      });
    });
  }

  async joinRoom(roomId) {
    await this.connect();
    this.roomId = roomId;
    
    this.ws.send(JSON.stringify({
      type: 'join-room',
      roomId,
      deviceInfo: this.deviceInfo
    }));
  }

  async createOffer() {
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.ws.send(JSON.stringify({
        type: 'offer',
        offer,
        target: this.peerId,
        roomId: this.roomId
      }));
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  async handleOffer(offer, fromPeerId) {
    try {
      this.peerId = fromPeerId;
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      this.ws.send(JSON.stringify({
        type: 'answer',
        answer,
        target: fromPeerId,
        roomId: this.roomId
      }));
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async handleAnswer(answer) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  async handleIceCandidate(candidate) {
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  updateDeviceInfo(deviceInfo) {
    this.deviceInfo = deviceInfo;
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'device-info-update',
        deviceInfo,
        roomId: this.roomId
      }));
    }
  }

  async sendFile(file) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel is not open');
    }

    const chunkSize = 16384; // 16KB chunks
    const fileReader = new FileReader();
    let offset = 0;

    // Send file metadata first
    this.dataChannel.send(JSON.stringify({
      type: 'file-metadata',
      name: file.name,
      size: file.size,
      type: file.type
    }));

    const readChunk = () => {
      const chunk = file.slice(offset, offset + chunkSize);
      fileReader.readAsArrayBuffer(chunk);
    };

    return new Promise((resolve, reject) => {
      fileReader.onload = (e) => {
        this.dataChannel.send(JSON.stringify({
          type: 'file-chunk',
          data: Array.from(new Uint8Array(e.target.result)),
          offset
        }));

        offset += e.target.result.byteLength;
        const progress = Math.min((offset / file.size) * 100, 100);
        this.onProgress(progress);

        if (offset < file.size) {
          readChunk();
        } else {
          this.dataChannel.send(JSON.stringify({
            type: 'transfer-complete',
            name: file.name
          }));
          resolve();
        }
      };

      fileReader.onerror = reject;
      readChunk();
    });
  }

  handleFileMetadata(data) {
    this.currentFile = {
      name: data.name,
      size: data.size,
      type: data.type,
      chunks: []
    };
  }

  async handleFileChunk(data) {
    if (!this.currentFile) return;

    this.currentFile.chunks[data.offset] = new Uint8Array(data.data);
    const totalReceived = this.currentFile.chunks.reduce((acc, chunk) => acc + (chunk?.length || 0), 0);
    this.onProgress((totalReceived / this.currentFile.size) * 100);
  }

  handleTransferComplete(data) {
    if (!this.currentFile) return;

    const blob = new Blob(this.currentFile.chunks, { type: this.currentFile.type });
    const url = URL.createObjectURL(blob);
    
    this.emit('file-received', {
      name: this.currentFile.name,
      size: this.currentFile.size,
      type: this.currentFile.type,
      url
    });

    this.currentFile = null;
    this.onComplete();
  }

  close() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    if (this.ws) {
      this.ws.close();
    }
  }
} 