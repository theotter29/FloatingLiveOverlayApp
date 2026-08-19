// WebSocketService.js - Real-time data streaming dari server
// Support WebSocket untuk TikTok Live, Instagram Live, YouTube Live, dll

import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = {};
  }

  /**
   * Connect ke WebSocket server
   * @param {string} serverURL - URL server WebSocket (contoh: http://localhost:3000)
   * @param {string} broadcastId - ID broadcast/live stream
   * @param {string} platform - Platform (tiktok, instagram, youtube, twitch)
   */
  connect(serverURL, broadcastId, platform = 'tiktok') {
    if (this.socket?.connected) {
      console.warn('Already connected to WebSocket');
      return;
    }

    this.socket = io(serverURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
      query: {
        broadcastId,
        platform,
      },
    });

    // Connection events
    this.socket.on('connect', () => {
      console.log('✓ WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('✗ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.emit('error', error);
    });

    // Data events
    this.setupDataListeners();
  }

  private setupDataListeners() {
    // Live stats update
    this.socket.on('stats_update', (data) => {
      this.emit('stats', {
        viewers: data.viewers,
        likes: data.likes,
        shares: data.shares,
        gifts: data.gifts,
        duration: data.duration,
        timestamp: Date.now(),
      });
    });

    // Like notification
    this.socket.on('like_event', (data) => {
      this.emit('notification', {
        type: 'like',
        user: data.username,
        text: `❤️ ${data.username} menyukai live Anda`,
        avatar: data.avatar,
        timestamp: Date.now(),
      });
    });

    // Follow notification
    this.socket.on('follow_event', (data) => {
      this.emit('notification', {
        type: 'follow',
        user: data.username,
        text: `👥 ${data.username} mulai mengikuti Anda`,
        avatar: data.avatar,
        timestamp: Date.now(),
      });
    });

    // Share/Retweet notification
    this.socket.on('share_event', (data) => {
      this.emit('notification', {
        type: 'share',
        user: data.username,
        text: `📤 ${data.username} membagikan live Anda`,
        avatar: data.avatar,
        timestamp: Date.now(),
      });
    });

    // Gift/Donation notification
    this.socket.on('gift_event', (data) => {
      this.emit('notification', {
        type: 'gift',
        user: data.username,
        text: `🎁 ${data.username} mengirim hadiah ${data.giftName}`,
        amount: data.giftValue,
        avatar: data.avatar,
        timestamp: Date.now(),
      });
    });

    // Comment/Message
    this.socket.on('comment_event', (data) => {
      this.emit('comment', {
        user: data.username,
        message: data.message,
        avatar: data.avatar,
        verified: data.verified,
        timestamp: Date.now(),
      });
    });

    // Custom alert dari streamer
    this.socket.on('custom_alert', (data) => {
      this.emit('alert', {
        title: data.title,
        message: data.message,
        type: data.type, // 'info', 'warning', 'success', 'error'
        duration: data.duration || 3000,
        timestamp: Date.now(),
      });
    });

    // Viewer milestone
    this.socket.on('milestone', (data) => {
      this.emit('milestone', {
        viewers: data.viewers,
        message: data.message,
        timestamp: Date.now(),
      });
    });

    // Stream ended
    this.socket.on('stream_ended', (data) => {
      this.emit('stream_ended', {
        totalViewers: data.totalViewers,
        totalLikes: data.totalLikes,
        totalGifts: data.totalGifts,
        duration: data.duration,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Emit event ke listeners
   */
  emit(eventName, data = null) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Subscribe ke event
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Send custom alert ke viewers (jika authorized)
   */
  sendAlert(title, message, type = 'info') {
    if (!this.isConnected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('send_alert', {
      title,
      message,
      type,
      timestamp: Date.now(),
    });
  }

  /**
   * Send message ke chat
   */
  sendMessage(message) {
    if (!this.isConnected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('send_message', {
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Request real-time stats
   */
  requestStats() {
    if (!this.isConnected) {
      console.warn('WebSocket not connected');
      return;
    }

    this.socket.emit('request_stats');
  }

  /**
   * Disconnect dari server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.listeners = {};
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;

/**
 * USAGE EXAMPLE:
 * 
 * import webSocketService from './WebSocketService';
 * 
 * // Connect ke server
 * webSocketService.connect('http://your-server.com:3000', 'broadcast_id_123', 'tiktok');
 * 
 * // Listen untuk stats
 * webSocketService.on('stats', (data) => {
 *   console.log('Stats update:', data);
 *   setStats(data);
 * });
 * 
 * // Listen untuk notifications
 * webSocketService.on('notification', (data) => {
 *   console.log('New notification:', data);
 *   addNotification(data);
 * });
 * 
 * // Send alert
 * webSocketService.sendAlert('Halo!', 'Selamat datang di live saya!', 'success');
 * 
 * // Disconnect
 * webSocketService.disconnect();
 */
