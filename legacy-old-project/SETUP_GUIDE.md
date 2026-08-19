# 🎥 Floating Overlay untuk TikTok Live Stream - React Native
## Setup & Installation Guide

---

## 📋 Requirements

### Untuk Development:
- **Node.js** >= 14
- **React Native CLI** atau **Expo CLI**
- **Android Studio** (untuk Android build)
- **Android SDK** >= 21 (API Level 21+)

### Untuk Production:
- APK signed untuk deploy ke Google Play Store

---

## 🚀 Quick Start (Option 1: React Native CLI)

### 1. Buat project baru
```bash
npx react-native init FloatingLiveOverlay
cd FloatingLiveOverlay
```

### 2. Install dependencies
```bash
npm install react-native-floating-window @react-native-camera-roll/camera-roll react-native-vector-icons

# atau dengan Yarn
yarn add react-native-floating-window @react-native-camera-roll/camera-roll react-native-vector-icons
```

### 3. Setup Vector Icons
```bash
# Link font ke project
npx react-native link react-native-vector-icons
```

**Manual Setup (jika auto link tidak work):**

#### Android (android/app/build.gradle):
```gradle
project.ext.vectoricons = [
    iconFontNames: [ 'MaterialIcons.ttf', 'FontAwesome.ttf' ]
]

apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### 4. Copy FloatingLiveOverlay.js ke project
```bash
cp FloatingLiveOverlay.js ./src/
```

### 5. Setup AndroidManifest.xml permissions

**Lokasi:** `android/app/src/main/AndroidManifest.xml`

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- SYSTEM_ALERT_WINDOW - untuk floating overlay -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    
    <!-- INTERNET - untuk real-time data -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- CAMERA & RECORDING - jika perlu screen recording -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    
    <application
        android:allowBackup="true"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:launchMode="singleTask"
            android:windowSoftInputMode="adjustResize"
            android:configChanges="keyboard|keyboardHidden|orientation|screenSize|uiMode"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

### 6. Setup App.js

```javascript
// App.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import FloatingLiveOverlay from './src/FloatingLiveOverlay';

export default function App() {
  const [floatingActive, setFloatingActive] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🎥 Live Overlay Controller</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Floating overlay untuk TikTok Live Stream
        </Text>

        <TouchableOpacity
          style={[
            styles.startBtn,
            floatingActive && styles.startBtnActive
          ]}
          onPress={() => setFloatingActive(!floatingActive)}
        >
          <Text style={styles.startBtnText}>
            {floatingActive ? '✓ Overlay Aktif' : 'Mulai Overlay'}
          </Text>
        </TouchableOpacity>

        <View style={styles.features}>
          <Text style={styles.featureTitle}>✨ Fitur:</Text>
          <Text style={styles.feature}>✓ Floating bubble overlay di atas aplikasi lain</Text>
          <Text style={styles.feature}>✓ Real-time viewer count & stats</Text>
          <Text style={styles.feature}>✓ Notifikasi live (like, follow, gifts)</Text>
          <Text style={styles.feature}>✓ Custom alert & text overlay</Text>
          <Text style={styles.feature}>✓ Draggable window</Text>
          <Text style={styles.feature}>✓ Berjalan di background</Text>
        </View>
      </View>

      {floatingActive && <FloatingLiveOverlay />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  startBtnActive: {
    backgroundColor: '#2ecc71',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  features: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  feature: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
});
```

### 7. Run aplikasi

```bash
# Android
npx react-native run-android

# Atau dengan Expo (lebih mudah untuk development)
npx expo start
```

---

## 🔧 Advanced Setup (Option 2: Expo)

Jika ingin lebih simpel, gunakan Expo:

```bash
npx create-expo-app FloatingLiveOverlay
cd FloatingLiveOverlay

# Install dependencies
npm install react-native-vector-icons
npx expo install expo-permissions

# Run
npx expo start
```

**Note:** Expo memiliki keterbatasan pada akses native (SYSTEM_ALERT_WINDOW), jadi untuk floating window penuh, lebih baik gunakan React Native CLI.

---

## 📱 Cara Menggunakan Aplikasi

### 1. **Buka Aplikasi**
   - Tap tombol "Mulai Overlay"
   - Izinkan akses overlay jika diminta

### 2. **Bubble Mode** (Default)
   - Bubble kecil di pojok layar menampilkan viewer count
   - Seret bubble ke lokasi favorit
   - Tap expand button untuk mode selector

### 3. **Mode Selector**
   - 📊 **Stats Mode** - Lihat viewer, likes, shares, gifts, durasi live
   - 🔔 **Notifications** - Aktivitas real-time (like, follow, share, gifts)
   - 🚨 **Alerts Mode** - Custom text & alert untuk di-broadcast
   - ✕ **Close** - Tutup panel

### 4. **Saat Live Streaming**
   - Overlay tetap floating di atas TikTok, Instagram, YouTube Live, dll
   - Bisa digunakan untuk monitoring stats sambil streaming
   - Alert bisa dikirim ke viewers sebagai overlay

---

## 🔗 Integration dengan TikTok Live API (Optional)

Untuk real-time data dari TikTok, perlu connect ke TikTok Live API:

```javascript
// services/TikTokLiveService.js
import axios from 'axios';

export class TikTokLiveService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://open.tiktokapis.com/v1/live';
  }

  async getLiveInfo(broadcastId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/${broadcastId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching live info:', error);
    }
  }

  async getComments(broadcastId) {
    // Fetch komentar real-time
  }

  async getGifts(broadcastId) {
    // Fetch gifts/hadiah
  }
}
```

---

## 📊 Struktur Project

```
FloatingLiveOverlay/
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AndroidManifest.xml  (permissions)
│   │   │   │   └── res/
│   │   │   └── debug/
│   │   └── build.gradle
│   └── gradle/
├── src/
│   ├── FloatingLiveOverlay.js  (main component)
│   └── services/
│       └── TikTokLiveService.js  (API integration)
├── App.js  (entry point)
├── index.js
├── package.json
└── app.json
```

---

## 🛠️ Troubleshooting

### Problem: Floating window tidak muncul
**Solution:**
- Pastikan izin SYSTEM_ALERT_WINDOW sudah diberikan di Settings > Apps > Permissions
- Cek AndroidManifest.xml sudah benar

### Problem: Vector icons tidak tampil
**Solution:**
```bash
npx react-native link react-native-vector-icons
# atau manual link ke build.gradle
```

### Problem: App crash saat drag
**Solution:**
- Gunakan Animated.View bukan View biasa
- Pastikan pan responder configured dengan benar

### Problem: Background tasks tidak berjalan
**Solution:**
```bash
npm install react-native-background-task
```

---

## 📦 Build untuk Production (APK)

### 1. Generate signing key
```bash
keytool -genkey -v -keystore my-release-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

### 2. Setup gradle.properties
```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***
MYAPP_RELEASE_KEY_PASSWORD=***
```

### 3. Build APK
```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### 4. Upload ke Google Play Store
- Buat app di Google Play Console
- Upload APK
- Fill metadata & screenshots
- Submit untuk review

---

## 🎯 Fitur yang Bisa Ditambahkan

- [ ] WebSocket untuk real-time data dari server
- [ ] TikTok Live API integration
- [ ] Custom alert sounds
- [ ] Screen recording
- [ ] Multi-platform (iOS)
- [ ] Notification persistence
- [ ] Analytics/logging
- [ ] Cloud sync settings

---

## 📝 License

MIT License - Bebas digunakan & dikembangkan

---

**Made with ❤️ untuk content creators Indonesia** 🇮🇩
