# 🔧 Setup Floating Overlay Server di Termux Android

Panduan lengkap menjalankan backend server untuk Floating Overlay di Termux (Android).

---

## 📱 Prerequisites

### 1. Install Termux
- Download: [Termux di F-Droid](https://f-droid.org/en/packages/com.termux/)
- ⚠️ Jangan dari Google Play (versi lama)
- Buka Termux

### 2. Izin Akses
```bash
# Izin akses storage
termux-setup-storage

# Izin akses URL Schemes (untuk development)
pkg install termux-am
```

---

## 🚀 Step 1: Update Termux & Install Dependencies

```bash
# Update packages
pkg update
pkg upgrade -y

# Install Node.js (versi 18/20, hindari v26 yang mungkin bermasalah)
pkg install nodejs-lts

# Verify Node version
node --version  # Should be v18+ or v20+
npm --version
```

**Output yang diharapkan:**
```
Welcome to Termux!

$ node --version
v20.10.0

$ npm --version
10.2.3
```

---

## 📁 Step 2: Setup Project Directory

```bash
# Buat folder untuk project
mkdir -p ~/live-overlay-server
cd ~/live-overlay-server

# Initialize npm project
npm init -y

# Edit package.json (optional, untuk customize)
nano package.json
```

**Versi minimal package.json:**
```json
{
  "name": "live-overlay-server",
  "version": "1.0.0",
  "main": "LiveServer.js",
  "scripts": {
    "start": "node LiveServer.js",
    "dev": "node LiveServer.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.5.4",
    "axios": "^1.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

---

## 📦 Step 3: Install Dependencies

```bash
# Install semua packages
npm install

# Verify installation
npm list
```

**Harusnya output seperti:**
```
live-overlay-server@1.0.0 /data/data/com.termux/files/home/live-overlay-server
├── axios@1.4.0
├── cors@2.8.5
├── dotenv@16.0.3
├── express@4.18.2
└── socket.io@4.5.4
```

---

## 📝 Step 4: Create LiveServer.js File

### Option A: Copy File dari Storage (Rekomendasi)

Jika file sudah ada di device:

```bash
# List files di storage
ls ~/storage/downloads/

# Copy dari downloads
cp ~/storage/downloads/LiveServer.js .

# Verify
ls -la LiveServer.js
```

### Option B: Download dari URL

```bash
# Install curl (jika belum ada)
pkg install curl

# Download file
curl -O https://your-domain.com/LiveServer.js

# atau dengan wget
pkg install wget
wget https://your-domain.com/LiveServer.js
```

### Option C: Buat Manual dengan Nano

```bash
# Buat file baru
nano LiveServer.js
```

Paste kode berikut (minimal version untuk Termux):

```javascript
// LiveServer.js - Minimal Version untuk Termux
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const activeBroadcasts = new Map();

io.on('connection', (socket) => {
  console.log('✓ Client connected:', socket.id);

  socket.on('join_broadcast', (data) => {
    const { broadcastId, platform } = data;
    socket.join(`broadcast_${broadcastId}`);
    console.log(`📡 Joined: ${broadcastId}`);
  });

  socket.on('disconnect', () => {
    console.log('✗ Disconnected:', socket.id);
  });

  socket.on('send_alert', (data) => {
    const room = Array.from(socket.rooms).find(r => r.startsWith('broadcast_'));
    if (room) {
      io.to(room).emit('custom_alert', data);
      console.log('🚨 Alert sent:', data.title);
    }
  });

  socket.on('request_stats', () => {
    socket.emit('stats_update', {
      viewers: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 5000),
      shares: Math.floor(Math.random() * 500),
      gifts: Math.floor(Math.random() * 50),
      duration: '00:15:30'
    });
  });
});

// Simulasi stats update
setInterval(() => {
  io.emit('stats_update', {
    viewers: Math.floor(Math.random() * 15000) + 1000,
    likes: Math.floor(Math.random() * 8000) + 500,
    shares: Math.floor(Math.random() * 800),
    gifts: Math.floor(Math.random() * 100) + 5,
    duration: new Date().toISOString()
  });
}, 3000);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║  🎥 Live Overlay Server (Termux)       ║
║  Port: ${PORT}                              ║
║  Status: Running ✓                     ║
╚════════════════════════════════════════╝
  `);
});
```

**Cara save di nano:**
- Ketik kode
- Tekan `CTRL+X`
- Tekan `Y` (yes)
- Tekan `ENTER`

---

## ⚙️ Step 5: Setup .env File

```bash
# Buat .env file
nano .env
```

Paste:
```env
NODE_ENV=development
PORT=3000

# Optional - API keys
TIKTOK_ACCESS_TOKEN=your_token
INSTAGRAM_ACCESS_TOKEN=your_token
YOUTUBE_API_KEY=your_key
```

Save dengan `CTRL+X` → `Y` → `ENTER`

---

## 🎬 Step 6: Run Server

### Method 1: Direct Run
```bash
node LiveServer.js
```

**Output yang diharapkan:**
```
╔════════════════════════════════════════╗
║  🎥 Live Overlay Server (Termux)       ║
║  Port: 3000                            ║
║  Status: Running ✓                     ║
╚════════════════════════════════════════╝
```

### Method 2: Gunakan npm start
```bash
npm start
```

### Method 3: Gunakan npm dev (dengan supervisor)
```bash
# Install supervisor
npm install --save-dev supervisor

# Run dengan auto-restart on change
npm run dev
```

---

## 📍 Step 7: Test Server

### Buka Terminal Baru (Termux)

```bash
# Test health endpoint
curl http://localhost:3000/health

# Output:
# {"status":"ok","uptime":12.345}
```

### Dari Device Lain (Laptop/Desktop)

**Cari IP Termux:**
```bash
# Di Termux
ifconfig
# atau
hostname -I
```

**Output:**
```
inet 192.168.1.5  netmask 255.255.255.0  broadcast 192.168.1.255
```

**Test dari Laptop:**
```bash
curl http://192.168.1.5:3000/health
```

---

## 🔌 Connect React Native App ke Server

### Di React Native App (FloatingLiveOverlay.js)

```javascript
// Gunakan IP Termux, bukan localhost
const serverURL = 'http://192.168.1.5:3000'; // Ganti IP sesuai device

webSocketService.connect(serverURL, 'broadcast_123', 'tiktok');
```

---

## 💡 Tips & Tricks untuk Termux

### 1. Keep Server Running Saat Screen Off

```bash
# Install termux-wake-lock
pkg install termux-wake-lock

# Run server dengan wake lock
termux-wake-lock node LiveServer.js
```

### 2. Running di Background

```bash
# Keluar dari Termux tapi keep server running
nohup node LiveServer.js > server.log 2>&1 &

# Atau gunakan screen
pkg install screen
screen -S live-server
node LiveServer.js
# Tekan CTRL+A lalu D untuk detach
```

### 3. Monitor Server Logs

```bash
# Buat file log
node LiveServer.js >> server.log 2>&1 &

# Monitor real-time
tail -f server.log

# atau
watch -n 1 tail server.log
```

### 4. Auto-start Server saat Termux Buka

```bash
# Edit ~/.bashrc atau ~/.bash_profile
nano ~/.bashrc

# Add di akhir:
if [ -d "$HOME/live-overlay-server" ]; then
  echo "Starting Live Overlay Server..."
  cd ~/live-overlay-server
  nohup node LiveServer.js > server.log 2>&1 &
fi
```

### 5. SSH Access ke Termux (Remote Access)

```bash
# Install SSH server
pkg install openssh

# Start SSH server
sshd

# Test SSH dari device lain
ssh -p 8022 username@phone-ip
```

---

## 🐛 Troubleshooting Termux

### Error: "npm: command not found"
```bash
pkg install nodejs-lts
```

### Error: "Cannot find module 'express'"
```bash
# Di dalam ~/live-overlay-server folder
npm install express socket.io axios cors
```

### Error: "Port already in use"
```bash
# Check apa yang pakai port 3000
netstat -tuln | grep 3000

# Kill process
kill -9 <PID>

# atau ubah PORT di .env
PORT=3001
```

### Server sangat slow/crash
```bash
# Kurangi memory usage
# 1. Update Node ke versi stable
pkg install nodejs-lts

# 2. Jalankan dengan memory limit
node --max-old-space-size=256 LiveServer.js

# 3. Stop background apps di Android
```

### WebSocket tidak connect
```bash
# 1. Check firewall
# Di Android: Settings > Apps > Network permissions

# 2. Test connection
curl -i http://192.168.1.5:3000/health

# 3. Check IP
hostname -I
```

---

## 🔐 Security Tips

### 1. Ganti Port Default
```bash
# .env
PORT=8443
```

### 2. Add CORS whitelist
```javascript
// LiveServer.js
const io = socketIo(server, {
  cors: {
    origin: ["http://192.168.1.5:3000"],
    methods: ["GET", "POST"]
  }
});
```

### 3. Enable authentication
```javascript
socket.on('connection', (socket) => {
  if (!socket.handshake.auth.token) {
    socket.disconnect();
    return;
  }
  // ... rest of code
});
```

---

## 📊 Monitoring & Stats

### Check Resource Usage
```bash
# CPU & Memory
top

# Storage
df -h

# Network
ifstat
```

### Count Connected Clients
Endpoint sudah built-in di LiveServer:
```bash
curl http://192.168.1.5:3000/api/broadcasts
```

---

## 🚀 Production Deployment

Untuk jangka panjang, lebih baik gunakan:

1. **Cloud Server** (Heroku, Railway, Replit)
2. **VPS** (DigitalOcean, Linode, Vultr)
3. **Docker** di smartphone

Tapi untuk development & testing, Termux sangat perfect! 👍

---

## 📱 Struktur Folder Final

```
~/live-overlay-server/
├── LiveServer.js       ← Main server
├── package.json        ← Dependencies
├── package-lock.json   ← Lock file
├── .env                ← Config
├── node_modules/       ← Packages
└── server.log          ← Logs (jika ada)
```

---

## ✅ Checklist Setup

- [ ] Termux installed (dari F-Droid)
- [ ] Node.js v18+ installed
- [ ] Project folder dibuat
- [ ] Dependencies diinstall
- [ ] LiveServer.js ada di folder
- [ ] .env file dibuat
- [ ] Server bisa dijalankan
- [ ] Port 3000 accessible
- [ ] React Native app bisa connect
- [ ] Real-time stats working

---

## 🎉 Selesai!

Server Anda sudah running di Termux! Sekarang:

1. ✅ App React Native connect ke `192.168.1.5:3000`
2. ✅ Bubble overlay akan show real-time stats
3. ✅ Notifications & alerts akan work
4. ✅ Test dengan membuka multiple tabs/clients

**Enjoy! 🚀📱**

---

**Pro Tips:**
- Keep Termux open & screen on untuk production
- Monitor server logs regularly
- Check memory usage jika ada issue
- Backup .env & LiveServer.js file
- Test connection dari berbagai device

Need help? Cek file log dengan `cat server.log` 📋
