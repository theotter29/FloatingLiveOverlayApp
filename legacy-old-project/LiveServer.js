// LiveServer.js - Node.js Socket.io Server untuk real-time live data
// npm install express socket.io axios cors dotenv

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Store active broadcasts & connected clients
const activeBroadcasts = new Map();
const broadcastSockets = new Map();

// ============== WebSocket Events ==============

io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id);

  // Client join broadcast
  socket.on('join_broadcast', (data) => {
    const { broadcastId, platform } = data;
    
    if (!activeBroadcasts.has(broadcastId)) {
      activeBroadcasts.set(broadcastId, {
        broadcastId,
        platform,
        startTime: Date.now(),
        stats: {
          viewers: 0,
          likes: 0,
          shares: 0,
          gifts: 0,
        },
        connections: 0,
      });
    }

    // Join socket to room
    socket.join(`broadcast_${broadcastId}`);

    // Track socket connection
    if (!broadcastSockets.has(broadcastId)) {
      broadcastSockets.set(broadcastId, new Set());
    }
    broadcastSockets.get(broadcastId).add(socket.id);

    const broadcast = activeBroadcasts.get(broadcastId);
    broadcast.connections = broadcastSockets.get(broadcastId).size;

    console.log(`📡 Client joined broadcast: ${broadcastId} (${broadcast.connections} connected)`);

    // Send initial data
    socket.emit('initial_data', broadcast);

    // Start fetching real-time data
    startBroadcastMonitoring(broadcastId, platform, socket);
  });

  // Client disconnect
  socket.on('disconnect', () => {
    console.log('✗ Client disconnected:', socket.id);

    // Remove from all broadcasts
    for (const [broadcastId, sockets] of broadcastSockets.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        const broadcast = activeBroadcasts.get(broadcastId);
        if (broadcast) {
          broadcast.connections = sockets.size;
        }

        // Stop monitoring if no more clients
        if (sockets.size === 0) {
          activeBroadcasts.delete(broadcastId);
          broadcastSockets.delete(broadcastId);
        }
      }
    }
  });

  // Send alert to all viewers
  socket.on('send_alert', (data) => {
    const broadcastId = Array.from(socket.rooms).find(room => room.startsWith('broadcast_'))?.replace('broadcast_', '');
    if (broadcastId) {
      io.to(`broadcast_${broadcastId}`).emit('custom_alert', data);
      console.log(`🚨 Alert sent in ${broadcastId}:`, data.title);
    }
  });

  // Send message to chat
  socket.on('send_message', (data) => {
    const broadcastId = Array.from(socket.rooms).find(room => room.startsWith('broadcast_'))?.replace('broadcast_', '');
    if (broadcastId) {
      io.to(`broadcast_${broadcastId}`).emit('chat_message', {
        user: data.user,
        message: data.message,
        timestamp: data.timestamp,
      });
    }
  });

  // Request stats
  socket.on('request_stats', () => {
    const broadcastId = Array.from(socket.rooms).find(room => room.startsWith('broadcast_'))?.replace('broadcast_', '');
    if (broadcastId && activeBroadcasts.has(broadcastId)) {
      const broadcast = activeBroadcasts.get(broadcastId);
      socket.emit('stats_update', {
        ...broadcast.stats,
        duration: formatDuration(Date.now() - broadcast.startTime),
      });
    }
  });
});

// ============== Broadcast Monitoring ==============

async function startBroadcastMonitoring(broadcastId, platform, socket) {
  const interval = setInterval(async () => {
    // Check if still active
    if (!broadcastSockets.has(broadcastId)) {
      clearInterval(interval);
      return;
    }

    try {
      // Fetch live data based on platform
      let liveData;
      
      if (platform === 'tiktok') {
        liveData = await fetchTikTokLiveData(broadcastId);
      } else if (platform === 'instagram') {
        liveData = await fetchInstagramLiveData(broadcastId);
      } else if (platform === 'youtube') {
        liveData = await fetchYoutubeLiveData(broadcastId);
      }

      if (liveData) {
        // Update stats
        const broadcast = activeBroadcasts.get(broadcastId);
        if (broadcast) {
          broadcast.stats = {
            viewers: liveData.viewers || 0,
            likes: liveData.likes || 0,
            shares: liveData.shares || 0,
            gifts: liveData.gifts || 0,
          };

          // Broadcast stats to all connected clients
          io.to(`broadcast_${broadcastId}`).emit('stats_update', {
            ...broadcast.stats,
            duration: formatDuration(Date.now() - broadcast.startTime),
          });

          // Emit individual events for notifications
          if (liveData.newLikes > 0) {
            io.to(`broadcast_${broadcastId}`).emit('like_event', {
              username: liveData.lastLikeUser,
              avatar: liveData.lastLikeAvatar,
            });
          }

          if (liveData.newFollows > 0) {
            io.to(`broadcast_${broadcastId}`).emit('follow_event', {
              username: liveData.lastFollowUser,
              avatar: liveData.lastFollowAvatar,
            });
          }

          if (liveData.newGifts > 0) {
            io.to(`broadcast_${broadcastId}`).emit('gift_event', {
              username: liveData.lastGiftUser,
              giftName: liveData.lastGiftName,
              giftValue: liveData.lastGiftValue,
              avatar: liveData.lastGiftAvatar,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error monitoring broadcast:', error);
    }
  }, 2000); // Update setiap 2 detik
}

// ============== Platform-specific Data Fetchers ==============

async function fetchTikTokLiveData(broadcastId) {
  try {
    const response = await axios.get(
      `https://open.tiktokapis.com/v1/live/${broadcastId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
        },
      }
    );

    const data = response.data;
    return {
      viewers: data.viewer_count || 0,
      likes: data.like_count || 0,
      shares: data.share_count || 0,
      gifts: data.gift_count || 0,
      lastLikeUser: data.last_like_user?.username || 'User',
      lastFollowUser: data.last_follow_user?.username || 'User',
      lastGiftUser: data.last_gift_user?.username || 'User',
      lastGiftName: data.last_gift_name || 'Gift',
      lastGiftValue: data.last_gift_value || 0,
    };
  } catch (error) {
    console.error('TikTok API Error:', error.message);
    return null;
  }
}

async function fetchInstagramLiveData(broadcastId) {
  // Instagram Business API
  try {
    const response = await axios.get(
      `https://graph.instagram.com/${broadcastId}`,
      {
        params: {
          fields: 'live_audience_count,comments.limit(5),like_count',
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
        },
      }
    );

    return {
      viewers: response.data.live_audience_count || 0,
      likes: response.data.like_count || 0,
      shares: 0,
      gifts: 0,
    };
  } catch (error) {
    console.error('Instagram API Error:', error.message);
    return null;
  }
}

async function fetchYoutubeLiveData(broadcastId) {
  // YouTube Live API
  try {
    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          id: broadcastId,
          part: 'liveStreamingDetails,statistics',
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const videoData = response.data.items[0];
    return {
      viewers: videoData.liveStreamingDetails?.concurrentViewers || 0,
      likes: videoData.statistics?.likeCount || 0,
      shares: 0,
      gifts: 0,
    };
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    return null;
  }
}

// ============== Helper Functions ==============

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============== REST API Endpoints ==============

app.get('/api/broadcasts', (req, res) => {
  const broadcasts = Array.from(activeBroadcasts.values()).map(b => ({
    ...b,
    connectedClients: broadcastSockets.get(b.broadcastId)?.size || 0,
  }));
  res.json(broadcasts);
});

app.get('/api/broadcasts/:broadcastId', (req, res) => {
  const broadcast = activeBroadcasts.get(req.params.broadcastId);
  if (broadcast) {
    res.json({
      ...broadcast,
      connectedClients: broadcastSockets.get(broadcast.broadcastId)?.size || 0,
    });
  } else {
    res.status(404).json({ error: 'Broadcast not found' });
  }
});

app.post('/api/broadcasts/:broadcastId/alert', (req, res) => {
  const { title, message, type } = req.body;
  const broadcastId = req.params.broadcastId;

  if (activeBroadcasts.has(broadcastId)) {
    io.to(`broadcast_${broadcastId}`).emit('custom_alert', {
      title,
      message,
      type: type || 'info',
      timestamp: Date.now(),
    });
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Broadcast not found' });
  }
});

// ============== Health Check ==============

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeBroadcasts: activeBroadcasts.size,
    connectedClients: io.engine.clientsCount,
  });
});

// ============== Start Server ==============

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🎥 Live Overlay Server Running       ║
║   Port: ${PORT}                              
║   Env: ${process.env.NODE_ENV || 'development'}                     
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
