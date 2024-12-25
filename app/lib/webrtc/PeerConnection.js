import { EventEmitter } from 'events';

export default class PeerConnection extends EventEmitter {
  constructor(options = {}) {
    super();
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onDeviceConnected = options.onDeviceConnected || (() => {});
    
    this.ws = null;
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    this.setupPeerConnection();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.setupWebSocket();
        resolve();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      // Add connection timeout
      setTimeout(() => {
        if (this.ws.readyState !== WebSocket.OPEN) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 5000);
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
    if (!this.dataChannel) {
      this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
    }

    this.dataChannel.onopen = () => {
      console.log('Data channel is open');
    };

    this.dataChannel.onmessage = (event) => {
      // Handle incoming file chunks
      // Implementation depends on how you want to handle file reception
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
    this.ws.send(JSON.stringify({ type: 'join-room', roomId }));
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
    const chunkSize = 16384; // 16KB chunks
    const fileReader = new FileReader();
    let offset = 0;

    fileReader.onload = (e) => {
      this.dataChannel.send(e.target.result);
      offset += e.target.result.byteLength;
      
      const progress = Math.min(100, (offset / file.size) * 100);
      this.onProgress(progress);
      
      if (offset < file.size) {
        readSlice(offset);
      } else {
        this.onComplete();
      }
    };

    const readSlice = (o) => {
      const slice = file.slice(o, o + chunkSize);
      fileReader.readAsArrayBuffer(slice);
    };

    readSlice(0);
  }
} 