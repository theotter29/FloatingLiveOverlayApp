// TikTokLiveService.js - TikTok Live Integration
import io from 'socket.io-client';

export class TikTokLiveService {
  constructor() {
    this.socket = null;
    this.roomId = null;
    this.stats = { viewers: 0, likes: 0, shares: 0, gifts: 0 };
    this.status = 'disconnected';
  }

  async connect(config) {
    try {
      this.roomId = config.roomId || config.username;
      
      // Connect to TikTok Live WebSocket
      this.socket = io(`${config.serverUrl || 'wss://floating-overlay-server-production.up.railway.app'}/tiktok`, {
        query: { roomId: this.roomId }
      });

      this.socket.on('connect', () => {
        this.status = 'connected';
        console.log('✓ TikTok Live connected');
      });

      this.socket.on('stats', (data) => {
        this.stats = data;
        console.log('TikTok stats:', data);
      });

      this.socket.on('like', (data) => {
        this.stats.likes++;
        console.log(`TikTok like from ${data.username}`);
      });

      this.socket.on('share', (data) => {
        this.stats.shares++;
        console.log(`TikTok share from ${data.username}`);
      });

      this.socket.on('gift', (data) => {
        this.stats.gifts++;
        console.log(`TikTok gift from ${data.username}: ${data.giftName}`);
      });

      this.socket.on('disconnect', () => {
        this.status = 'disconnected';
        console.log('TikTok Live disconnected');
      });

      return true;
    } catch (err) {
      console.error('TikTok connect error:', err);
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
