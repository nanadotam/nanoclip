class SignalingService {
  constructor(url = 'wss://your-signaling-server.com') {
    this.socket = new WebSocket(url);
    this.listeners = new Map();
    
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const listeners = this.listeners.get(message.type) || [];
      listeners.forEach(listener => listener(message));
    };
  }

  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
  }

  send(message) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  joinRoom(shareCode) {
    this.send({
      type: 'join',
      shareCode
    });
  }

  sendOffer(shareCode, offer) {
    this.send({
      type: 'offer',
      shareCode,
      offer
    });
  }

  sendAnswer(shareCode, answer) {
    this.send({
      type: 'answer',
      shareCode,
      answer
    });
  }

  sendIceCandidate(shareCode, candidate) {
    this.send({
      type: 'ice-candidate',
      shareCode,
      candidate
    });
  }
}

export default SignalingService; 