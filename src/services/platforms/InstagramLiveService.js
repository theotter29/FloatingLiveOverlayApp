// InstagramLiveService.js - Instagram Live Integration
import io from 'socket.io-client';

export class InstagramLiveService {
  constructor() {
    this.socket = null;
    this.broadcastId = null;
    this.stats = { viewers: 0, likes: 0, shares: 0, gifts: 0 };
    this.status = 'disconnected';
  }

  async connect(config) {
    try {
      this.broadcastId = config.broadcastId || config.username;
      
      this.socket = io(`${config.serverUrl || 'wss://floating-overlay-server-production.up.railway.app'}/instagram`, {
        query: { broadcastId: this.broadcastId }
      });

      this.socket.on('connect', () => {
        this.status = 'connected';
        console.log('✓ Instagram Live connected');
      });

      this.socket.on('stats', (data) => {
        this.stats = data;
        console.log('Instagram stats:', data);
      });

      this.socket.on('like', (data) => {
        this.stats.likes++;
        console.log(`Instagram like from ${data.username}`);
      });

      this.socket.on('comment', (data) => {
        console.log(`Instagram comment from ${data.username}: ${data.text}`);
      });

      this.socket.on('follow', (data) => {
        console.log(`Instagram follow from ${data.username}`);
      });

      this.socket.on('disconnect', () => {
        this.status = 'disconnected';
        console.log('Instagram Live disconnected');
      });

      return true;
    } catch (err) {
      console.error('Instagram connect error:', err);
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
