import { EventEmitter } from 'events';
import { getDetailedDeviceInfo } from '../utils/deviceNames';
import { encryption } from '../utils/encryption';

export default class PeerConnection extends EventEmitter {
  constructor(options = {}) {
    super();
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onDeviceConnected = options.onDeviceConnected || (() => {});
    
    // Use local IP address for testing
    this.wsUrl = `ws://${window.location.hostname}:3001`;
    this.ws = null;
    this.dataChannel = null;
    this.isHost = false;
    this.deviceInfo = getDetailedDeviceInfo();

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
      return; // Already connected
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected to:', this.wsUrl);
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
          
        case 'session-key':
          // Handle received session key
          if (data.key) {
            this.sessionKey = data.key;
            this.emit('session-key', data.key);
          }
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
    const initDataChannel = (channel) => {
      channel.onopen = () => {
        console.log('Data channel opened:', channel.label);
        this.dataChannel = channel;
        this.emit('datachannel-open');
      };

      channel.onclose = () => {
        console.log('Data channel closed:', channel.label);
        this.dataChannel = null;
      };

      channel.onerror = (error) => {
        console.error('Data channel error:', channel.label, error);
      };

      channel.onmessage = (event) => {
        console.log('Received message on channel:', channel.label);
      };
    };

    if (this.isHost) {
      console.log('Creating data channel as host');
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer', {
        ordered: true,
        maxRetransmits: 30
      });
      initDataChannel(this.dataChannel);
    }

    this.peerConnection.ondatachannel = (event) => {
      console.log('Received data channel:', event.channel.label);
      initDataChannel(event.channel);
    };
  }

  async createRoom() {
    this.isHost = true;
    await this.connect();
    this.setupDataChannel();
    
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({ type: 'create-room' }));
      
      const timeout = setTimeout(() => {
        reject(new Error('Room creation timeout'));
      }, 5000);

      const checkRoom = setInterval(() => {
        if (this.roomId) {
          clearInterval(checkRoom);
          clearTimeout(timeout);
          resolve(this.roomId);
        }
      }, 100);
    });
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

  async sendFile(file, sessionKey) {
    return new Promise((resolve, reject) => {
      if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
        reject(new Error('Data channel not ready'));
        return;
      }

      this.sendFileData(file, sessionKey)
        .then(resolve)
        .catch(reject);
    });
  }

  async sendFileData(file, sessionKey) {
    const chunkSize = 16384;
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onerror = (error) => {
      throw new Error(`Error reading file: ${error}`);
    };

    fileReader.onload = (e) => {
      if (this.dataChannel.readyState === 'open') {
        // Encrypt chunk before sending
        const chunk = e.target.result;
        const { iv, encrypted } = encryption.encryptChunk(chunk, sessionKey);
        
        // Send IV first, then encrypted data
        this.dataChannel.send(JSON.stringify({
          type: 'file-chunk',
          iv: iv.toString('base64'),
          data: encrypted.toString('base64'),
          offset,
          fileSize: file.size
        }));

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

  async exchangeKey(sessionKey) {
    if (!this.ws?.readyState === WebSocket.OPEN) {
      throw new Error('WebSocket connection not open');
    }

    return new Promise((resolve, reject) => {
      try {
        // Send the session key to peer
        this.ws.send(JSON.stringify({
          type: 'key-exchange',
          key: sessionKey,
          target: this.peerId,
          roomId: this.roomId
        }));

        // Set up one-time handler for key response
        const keyHandler = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'session-key') {
            this.ws.removeEventListener('message', keyHandler);
            resolve(data.key);
          }
        };

        this.ws.addEventListener('message', keyHandler);

        // Timeout after 5 seconds
        setTimeout(() => {
          this.ws.removeEventListener('message', keyHandler);
          reject(new Error('Key exchange timeout'));
        }, 5000);
      } catch (error) {
        reject(new Error(`Key exchange failed: ${error.message}`));
      }
    });
  }
} 