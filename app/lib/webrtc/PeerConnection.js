export default class PeerConnection {
  constructor(options = {}) {
    this.onProgress = options.onProgress || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    this.dataChannel = null;
  }

  async createRoom() {
    this.dataChannel = this.peerConnection.createDataChannel('fileTransfer');
    this.setupDataChannel();
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    // Send offer to signaling server
    return this.sendToSignalingServer({
      type: 'offer',
      offer
    });
  }

  async joinRoom(roomId) {
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };

    // Get offer from signaling server
    const { offer } = await this.getOfferFromServer(roomId);
    await this.peerConnection.setRemoteDescription(offer);
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    // Send answer to signaling server
    return this.sendToSignalingServer({
      type: 'answer',
      answer
    });
  }

  setupDataChannel() {
    this.dataChannel.onopen = () => {
      console.log('Data channel opened');
    };

    this.dataChannel.onmessage = (event) => {
      // Handle incoming file chunks
      this.handleFileChunk(event.data);
    };
  }

  // File transfer methods
  async sendFile(file) {
    const chunkSize = 16384;
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