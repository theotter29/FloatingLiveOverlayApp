// PlatformService.js - Multi-Platform Manager
import { TikTokLiveService } from './platforms/TikTokLiveService';
import { InstagramLiveService } from './platforms/InstagramLiveService';
import { YouTubeLiveService } from './platforms/YouTubeLiveService';

class PlatformService {
  constructor() {
    this.services = {
      tiktok: new TikTokLiveService(),
      instagram: new InstagramLiveService(),
      youtube: new YouTubeLiveService(),
    };
    
    this.activePlatforms = {};
    this.listeners = [];
  }

  // Enable platform
  enablePlatform(platform, config = {}) {
    if (!this.services[platform]) {
      console.error(`Platform ${platform} not found`);
      return false;
    }
    
    this.activePlatforms[platform] = {
      enabled: true,
      config,
      stats: { viewers: 0, likes: 0, shares: 0, gifts: 0 },
      status: 'idle'
    };
    
    this.notifyListeners('platform:enabled', platform);
    return true;
  }

  // Disable platform
  disablePlatform(platform) {
    if (this.activePlatforms[platform]) {
      this.services[platform].disconnect();
      delete this.activePlatforms[platform];
      this.notifyListeners('platform:disabled', platform);
    }
  }

  // Connect to all active platforms
  async connectAll() {
    const promises = Object.entries(this.activePlatforms).map(([platform, config]) => {
      return this.services[platform].connect(config.config);
    });
    
    return Promise.all(promises);
  }

  // Get stats from all platforms
  getAggregatedStats() {
    const stats = { viewers: 0, likes: 0, shares: 0, gifts: 0 };
    
    Object.values(this.activePlatforms).forEach(platform => {
      stats.viewers += platform.stats.viewers || 0;
      stats.likes += platform.stats.likes || 0;
      stats.shares += platform.stats.shares || 0;
      stats.gifts += platform.stats.gifts || 0;
    });
    
    return stats;
  }

  // Get individual platform stats
  getPlatformStats(platform) {
    return this.activePlatforms[platform]?.stats || null;
  }

  // Update platform stats
  updatePlatformStats(platform, stats) {
    if (this.activePlatforms[platform]) {
      this.activePlatforms[platform].stats = { ...this.activePlatforms[platform].stats, ...stats };
      this.notifyListeners('stats:updated', { platform, stats });
    }
  }

  // Get active platforms list
  getActivePlatforms() {
    return Object.keys(this.activePlatforms);
  }

  // Subscribe to events
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  notifyListeners(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }
}

export default new PlatformService();
