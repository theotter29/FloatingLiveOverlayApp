# 🔗 Integration Guide - Floating Overlay + Real-time Server

Panduan lengkap mengintegrasikan React Native Floating Overlay dengan WebSocket Server untuk real-time data dari TikTok, Instagram, YouTube Live, dll.

---

## 📋 Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Apps                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Native Floating Overlay App                  │   │
│  │  - FloatingLiveOverlay.js (UI)                      │   │
│  │  - WebSocketService.js (Connection)                 │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼──────────────────────────────────┘
                          │ WebSocket
                          │ (real-time)
┌─────────────────────────┼──────────────────────────────────┐
│                   Node.js Server                            │
│  ┌─────────────────────┴──────────────────────────────┐   │
│  │  LiveServer.js (Socket.io)                        │   │
│  │  - Broadcast management                           │   │
│  │  - Stats aggregation                              │   │
│  │  - Alert distribution                             │   │
│  └──────────────────────┬──────────────────────────────┘   │
└─────────────────────────┼──────────────────────────────────┘
                          │ REST API
                          ├────► TikTok API
                          ├────► Instagram API
                          ├────► YouTube API
                          └────► Twitch API
```

---

## 🚀 Setup Langkah Demi Langkah

### Step 1: Setup Backend Server

```bash
# Clone atau buat folder baru
mkdir live-overlay-server
cd live-overlay-server

# Initialize project
npm init -y

# Install dependencies
npm install express socket.io axios cors dotenv

# Copy LiveServer.js
cp ../LiveServer.js .

# Buat .env file
cp ../.env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000
TIKTOK_ACCESS_TOKEN=your_token_here
```

Jalankan server:
```bash
node LiveServer.js
# Output: 🎥 Live Overlay Server Running (Port: 3000)
```

### Step 2: Setup React Native App

```bash
# Create React Native app
npx react-native init FloatingLiveOverlay
cd FloatingLiveOverlay

# Install all dependencies
npm install socket.io-client react-native-vector-icons @react-native-camera-roll/camera-roll

# Link native modules
npx react-native link react-native-vector-icons
```

### Step 3: Add WebSocket Service

Copy `WebSocketService.js` ke folder `src/services/`:

```bash
mkdir -p src/services
cp ../WebSocketService.js src/services/
```

### Step 4: Update FloatingLiveOverlay Component

Modifikasi `FloatingLiveOverlay.js` untuk connect ke server:

```javascript
// src/FloatingLiveOverlay.js
import React, { useState, useEffect, useRef } from 'react';
import { ... } from 'react-native';
import webSocketService from './services/WebSocketService';

const FloatingLiveOverlay = ({ broadcastId, serverURL }) => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    viewers: 0,
    likes: 0,
    shares: 0,
    gifts: 0,
    duration: '00:00'
  });

  useEffect(() => {
    // Connect ke WebSocket server
    webSocketService.connect(serverURL, broadcastId, 'tiktok');

    // Subscribe ke events
    const unsubStats = webSocketService.on('stats', (data) => {
      setStats({
        viewers: data.viewers,
        likes: data.likes,
        shares: data.shares,
        gifts: data.gifts,
        duration: data.duration
      });
    });

    const unsubNotif = webSocketService.on('notification', (data) => {
      setNotifications(prev => [data, ...prev.slice(0, 9)]);
    });

    const unsubAlert = webSocketService.on('alert', (data) => {
      // Show alert notification
      console.log('Alert:', data);
    });

    // Cleanup
    return () => {
      unsubStats();
      unsubNotif();
      unsubAlert();
      webSocketService.disconnect();
    };
  }, [broadcastId, serverURL]);

  // ... rest of component code
};

export default FloatingLiveOverlay;
```

### Step 5: Setup App.js untuk Broadcasting

```javascript
// App.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import FloatingLiveOverlay from './src/FloatingLiveOverlay';

export default function App() {
  const [isLive, setIsLive] = useState(false);
  const [broadcastId] = useState('broadcast_123456');
  const serverURL = 'http://192.168.x.x:3000'; // Ganti dengan IP komputer Anda

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🎥 TikTok Live Streamer</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.liveBtn, isLive && styles.liveBtnActive]}
          onPress={() => setIsLive(!isLive)}
        >
          <Text style={styles.liveBtnText}>
            {isLive ? '🔴 LIVE' : 'Start Broadcasting'}
          </Text>
        </TouchableOpacity>

        {isLive && (
          <FloatingLiveOverlay 
            broadcastId={broadcastId}
            serverURL={serverURL}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#FF6B35', paddingVertical: 20 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  liveBtn: { backgroundColor: '#ddd', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  liveBtnActive: { backgroundColor: '#FF6B35' },
  liveBtnText: { fontSize: 18, fontWeight: 'bold', color: '#fff' }
});
```

---

## 🔌 Cara Menggunakan

### 1. Start Backend Server

```bash
cd live-overlay-server
node LiveServer.js
```

### 2. Start React Native App

```bash
# Terminal 1: Metro bundler
npx react-native start

# Terminal 2: Run di device/emulator
npx react-native run-android
# atau
npx react-native run-ios
```

### 3. Start Broadcasting

1. Buka app di mobile
2. Tap "Start Broadcasting"
3. Floating overlay akan muncul
4. Mulai live streaming di TikTok/Instagram/YouTube
5. Real-time stats akan tampil di overlay

---

## 📊 Testing dengan Simulator

### Simulate Real-time Events

Buat file `test-events.js`:

```javascript
// test-events.js
const axios = require('axios');

const broadcastId = 'broadcast_123456';
const serverURL = 'http://localhost:3000';

async function simulateEvents() {
  try {
    // Simulasi alert
    await axios.post(`${serverURL}/api/broadcasts/${broadcastId}/alert`, {
      title: 'Welcome!',
      message: 'Selamat datang di live saya!',
      type: 'success'
    });
    console.log('✓ Alert sent');

    // Simulasi stats update
    // (stats akan auto update dari API)

  } catch (error) {
    console.error('Error:', error.message);
  }
}

simulateEvents();
```

Run:
```bash
node test-events.js
```

---

## 🔐 Environment Configuration

### Development
```bash
# .env
NODE_ENV=development
PORT=3000
SERVER_URL=http://192.168.1.100:3000  # IP lokal
```

### Production
```bash
# .env
NODE_ENV=production
PORT=3000
SERVER_URL=https://api.floatingoverlay.app
TIKTOK_ACCESS_TOKEN=prod_token_here
```

---

## 🎨 Customization

### Change Bubble Color
```javascript
// FloatingLiveOverlay.js
const bubbleColor = '#FF6B35'; // Change ini
```

### Change Update Interval
```javascript
// WebSocketService.js
const UPDATE_INTERVAL = 2000; // 2 detik
```

### Add Custom Notification Type
```javascript
// WebSocketService.js
setupDataListeners() {
  // ...
  this.socket.on('my_custom_event', (data) => {
    this.emit('custom', data);
  });
}
```

---

## 📱 Permissions yang Dibutuhkan (Android)

Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

---

## 🐛 Troubleshooting

### Q: WebSocket tidak connect?
**A:** Pastikan:
- Server running di port 3000
- IP server benar di `serverURL`
- Firewall tidak block port 3000
- `npm install socket.io-client` sudah dijalankan

### Q: Overlay tidak floating?
**A:** 
- Izin SYSTEM_ALERT_WINDOW sudah diberikan?
- Di Settings > Apps > FloatingLiveOverlay > Permissions
- Centang "Display over other apps"

### Q: Stats tidak update?
**A:**
- Check WebSocket connection status
- Lihat server logs untuk error
- Coba restart app

### Q: Performance lag?
**A:**
- Reduce update interval (e.g., 5000ms)
- Limit notifications history
- Close unused apps di background

---

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/)
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [TikTok API Docs](https://developers.tiktok.com/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [YouTube Live API](https://developers.google.com/youtube/v3)

---

## 🎯 Next Steps

1. ✅ Setup basic overlay (done)
2. ⬜ Integrate TikTok API (get access token)
3. ⬜ Add database untuk persistent data
4. ⬜ Deploy to Play Store / App Store
5. ⬜ Add analytics & crash reporting

---

**Happy Streaming! 🎉**
