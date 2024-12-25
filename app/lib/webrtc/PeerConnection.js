import { EventEmitter } from 'events';
import { getDetailedDeviceInfo } from '../utils/deviceNames';

export default class PeerConnection extends EventEmitter {
  constructor(options = {}) {
    super();
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onDeviceConnected = options.onDeviceConnected || (() => {});
    
    this.ws = null;
    this.dataChannel = null;
    this.deviceInfo = getDetailedDeviceInfo();

    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    this.setupPeerConnection();
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.setupWebSocket();
          resolve();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(new Error('Failed to connect to WebSocket server'));
        };

        // Add connection timeout
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
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'room-created':
          this.roomId = data.roomId;
          break;
          
        case 'peer-joined':
          this.peerId = data.peerId;
          this.onDeviceConnected(this.peerId);
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
      }
    };
  }

  setupPeerConnection() {
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
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
    if (this.isHost && !this.dataChannel) {
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
        ordered: true
      });
    }

    const handleDataChannel = (channel) => {
      channel.onopen = () => {
        console.log('Data channel is open');
        this.dataChannel = channel;
      };

      channel.onclose = () => {
        console.log('Data channel closed');
        this.dataChannel = null;
      };

      channel.onerror = (error) => {
        console.error('Data channel error:', error);
      };

      channel.onmessage = (event) => {
        // Handle incoming data
        console.log('Received data:', event.data);
      };
    };

    if (this.dataChannel) {
      handleDataChannel(this.dataChannel);
    }

    this.peerConnection.ondatachannel = (event) => {
      handleDataChannel(event.channel);
    };
  }

  async createRoom() {
    try {
      await this.connect();
      this.ws.send(JSON.stringify({ type: 'create-room' }));
      
      return new Promise((resolve) => {
        const checkRoom = setInterval(() => {
          if (this.roomId) {
            clearInterval(checkRoom);
            resolve(this.roomId);
          }
        }, 100);
      });
    } catch (error) {
      throw new Error(`Failed to create room: ${error.message}`);
    }
  }

  async joinRoom(roomId) {
    try {
      await this.connect();
      this.ws.send(JSON.stringify({ type: 'join-room', roomId }));
    } catch (error) {
      throw new Error(`Failed to join room: ${error.message}`);
    }
  }

  async createOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    this.ws.send(JSON.stringify({
      type: 'offer',
      offer,
      target: this.peerId,
      roomId: this.roomId
    }));
  }

  async handleOffer(offer, fromPeerId) {
    this.peerId = fromPeerId;
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    this.ws.send(JSON.stringify({
      type: 'answer',
      answer,
      target: this.peerId,
      roomId: this.roomId
    }));
  }

  async handleAnswer(answer) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidate) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async sendFile(file) {
    return new Promise((resolve, reject) => {
      if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
        const checkInterval = setInterval(() => {
          if (this.dataChannel?.readyState === 'open') {
            clearInterval(checkInterval);
            this.sendFileData(file).then(resolve).catch(reject);
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Data channel connection timeout'));
        }, 5000);
      } else {
        this.sendFileData(file).then(resolve).catch(reject);
      }
    });
  }

  async sendFileData(file) {
    const chunkSize = 16384;
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onerror = (error) => {
      throw new Error(`Error reading file: ${error}`);
    };

    fileReader.onload = (e) => {
      if (this.dataChannel.readyState === 'open') {
        this.dataChannel.send(e.target.result);
        offset += e.target.result.byteLength;
        
        const progress = Math.min(100, (offset / file.size) * 100);
        this.onProgress(progress);
        
        if (offset < file.size) {
          readSlice(offset);
        } else {
          this.onComplete();
        }
      }
    };

    const readSlice = (o) => {
      const slice = file.slice(o, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    readSlice(0);
  }

  async updateDeviceInfo(connectedDevices = []) {
    const existingNames = connectedDevices.map(device => device.name);
    this.deviceInfo = getDetailedDeviceInfo(existingNames);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'device-info-update',
        deviceInfo: this.deviceInfo,
        roomId: this.roomId
      }));
    }
    
    return this.deviceInfo;
  }

  async requestDeviceInfo() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'device-info-request',
        deviceInfo: this.deviceInfo, // Send our info while requesting
        roomId: this.roomId
      }));
    }
  }

  handleDeviceInfoRequest(fromPeerId, theirDeviceInfo) {
    // Store their device info
    this.peerDeviceInfo = theirDeviceInfo;
    
    // Send our device info back
    this.ws.send(JSON.stringify({
      type: 'device-info-response',
      deviceInfo: this.deviceInfo,
      target: fromPeerId,
      roomId: this.roomId
    }));
  }
} 