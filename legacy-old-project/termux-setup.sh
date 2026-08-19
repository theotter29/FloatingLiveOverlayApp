#!/bin/bash

# 🎯 Instant Setup Script untuk Floating Overlay Server di Termux
# Copy-paste ini di Termux untuk setup otomatis

clear
echo "╔════════════════════════════════════════╗"
echo "║  🎥 Floating Overlay - Termux Setup    ║"
echo "║  Starting automatic installation...   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Update packages
echo -e "${BLUE}[1/6]${NC} Updating packages..."
pkg update -y > /dev/null 2>&1
pkg upgrade -y > /dev/null 2>&1
echo -e "${GREEN}✓ Packages updated${NC}"
echo ""

# Step 2: Install Node.js
echo -e "${BLUE}[2/6]${NC} Installing Node.js..."
if command -v node &> /dev/null; then
    echo -e "${YELLOW}! Node.js already installed: $(node -v)${NC}"
else
    pkg install nodejs-lts -y > /dev/null 2>&1
    echo -e "${GREEN}✓ Node.js installed: $(node -v)${NC}"
fi
echo ""

# Step 3: Create project directory
echo -e "${BLUE}[3/6]${NC} Creating project directory..."
mkdir -p ~/live-overlay-server
cd ~/live-overlay-server || exit 1
echo -e "${GREEN}✓ Directory: ~/live-overlay-server${NC}"
echo ""

# Step 4: Initialize npm project
echo -e "${BLUE}[4/6]${NC} Initializing npm project..."
if [ ! -f "package.json" ]; then
    npm init -y > /dev/null 2>&1
    echo -e "${GREEN}✓ package.json created${NC}"
else
    echo -e "${YELLOW}! package.json already exists${NC}"
fi
echo ""

# Step 5: Install dependencies
echo -e "${BLUE}[5/6]${NC} Installing dependencies..."
echo "   📦 express, socket.io, axios, cors, dotenv..."
npm install --save express socket.io axios cors dotenv > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Step 6: Create LiveServer.js
echo -e "${BLUE}[6/6]${NC} Creating LiveServer.js..."
cat > LiveServer.js << 'EOF'
// LiveServer.js - Floating Overlay Real-time Server (Termux Version)
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
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
          viewers: Math.floor(Math.random() * 10000) + 1000,
          likes: Math.floor(Math.random() * 5000),
          shares: Math.floor(Math.random() * 500),
          gifts: Math.floor(Math.random() * 50),
        },
        connections: 0,
      });
    }

    socket.join(`broadcast_${broadcastId}`);

    if (!broadcastSockets.has(broadcastId)) {
      broadcastSockets.set(broadcastId, new Set());
    }
    broadcastSockets.get(broadcastId).add(socket.id);

    const broadcast = activeBroadcasts.get(broadcastId);
    broadcast.connections = broadcastSockets.get(broadcastId).size;

    console.log(`📡 Client joined: ${broadcastId} (${broadcast.connections} total)`);
    socket.emit('initial_data', broadcast);
  });

  // Send alert
  socket.on('send_alert', (data) => {
    const broadcastId = Array.from(socket.rooms)
      .find(room => room.startsWith('broadcast_'))
      ?.replace('broadcast_', '');
    
    if (broadcastId) {
      io.to(`broadcast_${broadcastId}`).emit('custom_alert', {
        ...data,
        timestamp: Date.now(),
      });
      console.log(`🚨 Alert: ${data.title}`);
    }
  });

  // Request stats
  socket.on('request_stats', () => {
    const broadcastId = Array.from(socket.rooms)
      .find(room => room.startsWith('broadcast_'))
      ?.replace('broadcast_', '');
    
    if (broadcastId && activeBroadcasts.has(broadcastId)) {
      const broadcast = activeBroadcasts.get(broadcastId);
      socket.emit('stats_update', {
        ...broadcast.stats,
        duration: formatDuration(Date.now() - broadcast.startTime),
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('✗ Client disconnected:', socket.id);
    
    for (const [broadcastId, sockets] of broadcastSockets.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        const broadcast = activeBroadcasts.get(broadcastId);
        if (broadcast) {
          broadcast.connections = sockets.size;
        }

        if (sockets.size === 0) {
          activeBroadcasts.delete(broadcastId);
          broadcastSockets.delete(broadcastId);
        }
      }
    }
  });
});

// ============== Auto Stats Update ==============
setInterval(() => {
  for (const [broadcastId, broadcast] of activeBroadcasts.entries()) {
    // Simulate dynamic stats
    broadcast.stats.viewers = Math.floor(Math.random() * 15000) + 500;
    broadcast.stats.likes = Math.floor(Math.random() * 8000) + 100;
    broadcast.stats.shares = Math.floor(Math.random() * 800) + 10;
    broadcast.stats.gifts = Math.floor(Math.random() * 100) + 5;

    // Send to all clients in broadcast
    io.to(`broadcast_${broadcastId}`).emit('stats_update', {
      ...broadcast.stats,
      duration: formatDuration(Date.now() - broadcast.startTime),
      timestamp: Date.now(),
    });

    // Randomly emit notifications
    const types = ['like', 'follow', 'gift'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    if (Math.random() > 0.7) {
      const users = ['User_' + Math.floor(Math.random() * 10000)];
      io.to(`broadcast_${broadcastId}`).emit('notification', {
        type: randomType,
        user: users[0],
        text: getNotificationText(randomType, users[0]),
        timestamp: Date.now(),
      });
    }
  }
}, 3000);

function getNotificationText(type, user) {
  const texts = {
    like: `❤️ ${user} liked the stream`,
    follow: `👥 ${user} started following you`,
    gift: `🎁 ${user} sent a gift`,
  };
  return texts[type] || 'Event occurred';
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ============== API Endpoints ==============
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    activeBroadcasts: activeBroadcasts.size,
    connectedClients: io.engine.clientsCount,
  });
});

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

// ============== Start Server ==============
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`
╔════════════════════════════════════════╗
║  🎥 Live Overlay Server (Termux)       ║
║  Version: 1.0.0                        ║
║  Status: Running ✓                     ║
║  Port: ${PORT}                              ║
║  Started: ${timestamp}                  ║
╚════════════════════════════════════════╝
  `);
  console.log('📍 IP: use "hostname -I" to check');
  console.log('🔗 API Health: http://localhost:' + PORT + '/health');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

module.exports = { app, io };
EOF

echo -e "${GREEN}✓ LiveServer.js created${NC}"
echo ""

# Create .env file
echo -e "${BLUE}Creating .env file...${NC}"
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000

# Optional - API Keys (add if needed)
# TIKTOK_ACCESS_TOKEN=your_token_here
# INSTAGRAM_ACCESS_TOKEN=your_token_here
# YOUTUBE_API_KEY=your_key_here
EOF
echo -e "${GREEN}✓ .env created${NC}"
echo ""

# Summary
echo "╔════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                   ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}📁 Project Location:${NC} ~/live-overlay-server"
echo ""
echo -e "${BLUE}📦 Installed Packages:${NC}"
npm list --depth=0
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo "1️⃣  Start the server:"
echo -e "   ${YELLOW}cd ~/live-overlay-server${NC}"
echo -e "   ${YELLOW}node LiveServer.js${NC}"
echo ""
echo "2️⃣  Check your IP address:"
echo -e "   ${YELLOW}hostname -I${NC}"
echo ""
echo "3️⃣  Test server (from another terminal/device):"
echo -e "   ${YELLOW}curl http://192.168.x.x:3000/health${NC}"
echo ""
echo "4️⃣  Connect React Native app to:"
echo -e "   ${YELLOW}const serverURL = 'http://192.168.x.x:3000'${NC}"
echo ""
echo -e "${GREEN}Happy streaming! 🎉${NC}"
echo ""
