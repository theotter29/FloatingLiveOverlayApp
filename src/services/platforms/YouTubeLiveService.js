// YouTubeLiveService.js - YouTube Live Integration
import io from 'socket.io-client';

export class YouTubeLiveService {
  constructor() {
    this.socket = null;
    this.videoId = null;
    this.stats = { viewers: 0, likes: 0, shares: 0, gifts: 0 };
    this.status = 'disconnected';
  }

  async connect(config) {
    try {
      this.videoId = config.videoId || config.username;
      
      this.socket = io(`${config.serverUrl || 'wss://floating-overlay-server-production.up.railway.app'}/youtube`, {
        query: { videoId: this.videoId }
      });

      this.socket.on('connect', () => {
        this.status = 'connected';
        console.log('✓ YouTube Live connected');
      });

      this.socket.on('stats', (data) => {
        this.stats = data;
        console.log('YouTube stats:', data);
      });

      this.socket.on('like', (data) => {
        this.stats.likes++;
        console.log(`YouTube like from ${data.username}`);
      });

      this.socket.on('superchat', (data) => {
        this.stats.gifts += data.amount;
        console.log(`YouTube SuperChat from ${data.username}: $${data.amount}`);
      });

      this.socket.on('comment', (data) => {
        console.log(`YouTube comment: ${data.text}`);
      });

      this.socket.on('disconnect', () => {
        this.status = 'disconnected';
        console.log('YouTube Live disconnected');
      });

      return true;
    } catch (err) {
      console.error('YouTube connect error:', err);
      this.status = 'error';
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.status = 'disconnected';
    }
  }

  getStats() {
    return this.stats;
  }

  getStatus() {
    return this.status;
  }
}
