// FloatingLiveOverlay.js - React Native Floating Window untuk Multi-Platform Streaming
// Install: npm install react-native-floating-window @react-native-camera-roll/camera-roll react-native-vector-icons

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
  ScrollView,
  Alert,
  PermissionsAndroid,
  Platform,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PlatformService from './services/PlatformService';
import PlatformSelector from './components/PlatformSelector';
import webSocketService from './services/WebSocketService';

// Tools components (fitur tambahan)
import { OverlayEffectManager } from './components/OverlayEffects';
import { ScoreboardManager } from './components/ScoreboardWidget';
import { AudioProcessor } from './components/AudioProcessor';
import { MediaPlayer } from './components/MediaPlayer';
import { WebLinkHandler } from './components/WebLinkHandler';
import { ImagePicker } from './components/ImagePicker';
import { RTMPManager } from './components/RTMPManager';
import { YouTubeSettings } from './components/YouTubeSettings';
import { ScreenCastHandler } from './components/ScreenCastHandler';

const THEME_STORAGE_KEY = '@floating_overlay_theme';
const PLATFORMS_STORAGE_KEY = '@floating_overlay_platforms';

const THEMES = {
  orange: { primary: '#FF6B35', primaryLight: 'rgba(255, 107, 53, 0.95)', primarySoft: 'rgba(255, 107, 53, 0.15)' },
  purple: { primary: '#8856F6', primaryLight: 'rgba(139, 92, 246, 0.95)', primarySoft: 'rgba(139, 92, 246, 0.15)' },
  blue: { primary: '#3B82F6', primaryLight: 'rgba(59, 130, 246, 0.95)', primarySoft: 'rgba(59, 130, 246, 0.15)' },
  green: { primary: '#10B981', primaryLight: 'rgba(16, 185, 129, 0.95)', primarySoft: 'rgba(16, 185, 129, 0.15)' },
};

const FloatingLiveOverlay = () => {
  const [isFloating, setIsFloating] = React.useState(false);
  const [currentTheme, setCurrentTheme] = React.useState('orange');
  const [activePlatforms, setActivePlatforms] = React.useState([]);
  const [stats, setStats] = React.useState({ viewers: 0, likes: 0, shares: 0, gifts: 0 });
  const [platformStats, setPlatformStats] = React.useState({});
  const [currentMode, setCurrentMode] = React.useState('mini'); // mini, full, stats, notifications
  const [customAlert, setCustomAlert] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [isConnected, setIsConnected] = React.useState(false);

  // Visibility state buat tiap tools/modal
  const [showOverlayEffects, setShowOverlayEffects] = React.useState(false);
  const [showScoreboard, setShowScoreboard] = React.useState(false);
  const [showAudioProcessor, setShowAudioProcessor] = React.useState(false);
  const [showMediaPlayer, setShowMediaPlayer] = React.useState(false);
  const [showWebLink, setShowWebLink] = React.useState(false);
  const [showImagePicker, setShowImagePicker] = React.useState(false);
  const [showRTMPManager, setShowRTMPManager] = React.useState(false);
  const [showYouTubeSettings, setShowYouTubeSettings] = React.useState(false);
  const [showScreenCast, setShowScreenCast] = React.useState(false);

  // Alert input (custom text/alert buat dikirim ke overlay)
  const [showAlertInput, setShowAlertInput] = React.useState(false);
  const [appState, setAppState] = React.useState(AppState.currentState);

  // Posisi floating bubble - drag beneran pakai Animated.ValueXY
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Minta izin overlay window (Android) - dibutuhkan buat floating beneran di atas app lain
  const requestOverlayPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 23) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW,
          {
            title: 'Izin Overlay Window',
            message: 'Aplikasi perlu izin untuk menampilkan overlay di atas aplikasi lain',
            buttonNeutral: 'Nanti',
            buttonNegative: 'Tolak',
            buttonPositive: 'Izinkan',
          }
        );
        if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Izin Diperlukan', 'Mohon aktifkan izin overlay di pengaturan aplikasi');
        }
      }
    } catch (err) {
      console.warn('Overlay permission error:', err);
    }
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestOverlayPermission();
    }
  }, []);

  // Monitor app state - auto-resume floating window pas app balik ke foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        if (isFloating) {
          setIsFloating(true);
        }
      }
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, [appState, isFloating]);

  // Kirim custom alert - masuk ke notifications lokal + broadcast lewat WebSocket kalau connect
  const sendCustomAlert = () => {
    if (!customAlert.trim()) return;
    addNotification(`You: ${customAlert}`);
    try {
      if (webSocketService && webSocketService.socket?.connected) {
        webSocketService.socket.emit('send_alert', {
          title: 'Custom Alert',
          message: customAlert,
          type: 'info',
        });
      }
    } catch (err) {
      console.warn('Send alert error:', err);
    }
    setCustomAlert('');
    setShowAlertInput(false);
  };

  // Load saved settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        const savedPlatforms = await AsyncStorage.getItem(PLATFORMS_STORAGE_KEY);
        
        if (savedTheme) setCurrentTheme(savedTheme);
        if (savedPlatforms) setActivePlatforms(JSON.parse(savedPlatforms));
      } catch (err) {
        console.error('Load settings error:', err);
      }
    };
    loadSettings();
  }, []);

  // Subscribe to platform service events
  useEffect(() => {
    const unsubscribe = PlatformService.subscribe((event, data) => {
      if (event === 'stats:updated') {
        setPlatformStats(prev => ({
          ...prev,
          [data.platform]: data.stats
        }));
        setStats(PlatformService.getAggregatedStats());
      } else if (event === 'platform:enabled') {
        addNotification(`${data} Connected ✓`);
      } else if (event === 'platform:disabled') {
        addNotification(`${data} Disconnected ✗`);
      }
    });

    return unsubscribe;
  }, []);

  // Connect/Disconnect platforms
  useEffect(() => {
    const managePlatforms = async () => {
      if (activePlatforms.length === 0) {
        setIsConnected(false);
        return;
      }

      // Clear inactive platforms
      PlatformService.getActivePlatforms().forEach(platform => {
        if (!activePlatforms.includes(platform)) {
          PlatformService.disablePlatform(platform);
        }
      });

      // Enable active platforms
      activePlatforms.forEach(platform => {
        PlatformService.enablePlatform(platform, {
          username: 'default_user',
          serverUrl: 'ws://localhost:3000'
        });
      });

      // Connect all
      try {
        await PlatformService.connectAll();
        setIsConnected(true);
        addNotification('All platforms connected!');
      } catch (err) {
        console.error('Connect error:', err);
        setIsConnected(false);
      }

      // Save to storage
      await AsyncStorage.setItem(PLATFORMS_STORAGE_KEY, JSON.stringify(activePlatforms));
    };

    managePlatforms();
  }, [activePlatforms]);

  // Add notification
  const addNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, time: new Date().toLocaleTimeString() }]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // Change theme
  const changeTheme = async (themeName) => {
    setCurrentTheme(themeName);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, themeName);
  };

  const theme = THEMES[currentTheme];

  // Mini Mode UI
  const renderMiniMode = () => (
    <View style={[styles.miniContainer, { backgroundColor: theme.primaryLight }]}>
      <View style={styles.miniHeader}>
        <Text style={styles.miniViewers}>{stats.viewers.toLocaleString()}</Text>
        <Text style={styles.miniViewersLabel}>viewers</Text>
      </View>
      <View style={styles.miniStats}>
        <View style={styles.miniStatItem}>
          <FontAwesome name="heart" size={12} color="#FF4444" />
          <Text style={styles.miniStatText}>{stats.likes}</Text>
        </View>
        <View style={styles.miniStatItem}>
          <FontAwesome name="share-alt" size={12} color="#44FF44" />
          <Text style={styles.miniStatText}>{stats.shares}</Text>
        </View>
        <View style={styles.miniStatItem}>
          <FontAwesome name="gift" size={12} color="#FFFF44" />
          <Text style={styles.miniStatText}>{stats.gifts}</Text>
        </View>
      </View>
    </View>
  );

  // Full Stats Mode UI
  const renderStatsMode = () => (
    <View style={[styles.statsContainer, { backgroundColor: theme.primaryLight }]}>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: theme.primary }]}>
          <Text style={styles.statLabel}>VIEWERS</Text>
          <Text style={styles.statValue}>{stats.viewers.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: theme.primary }]}>
          <Text style={styles.statLabel}>LIKES</Text>
          <Text style={styles.statValue}>{stats.likes.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: theme.primary }]}>
          <Text style={styles.statLabel}>SHARES</Text>
          <Text style={styles.statValue}>{stats.shares.toLocaleString()}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: theme.primary }]}>
          <Text style={styles.statLabel}>GIFTS</Text>
          <Text style={styles.statValue}>{stats.gifts.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.platformStatsContainer}>
        <Text style={styles.platformStatsTitle}>Per Platform</Text>
        <ScrollView style={styles.platformStatsList}>
          {activePlatforms.map(platform => (
            <View key={platform} style={styles.platformStatRow}>
              <Text style={styles.platformStatName}>{platform.toUpperCase()}</Text>
              <View style={styles.platformStatValues}>
                <Text style={styles.platformStatValue}>
                  {platformStats[platform]?.viewers || 0}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  // Notifications Mode UI (+ custom alert input)
  const renderNotificationsMode = () => (
    <View style={[styles.notificationsContainer, { backgroundColor: theme.primaryLight }]}>
      <View style={styles.alertInputSection}>
        <TextInput
          style={styles.alertInput}
          placeholder="Ketik alert atau teks khusus..."
          placeholderTextColor="rgba(255,255,255,0.6)"
          value={customAlert}
          onChangeText={setCustomAlert}
          multiline
        />
        <TouchableOpacity style={styles.alertSendBtn} onPress={sendCustomAlert}>
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {notifications.length === 0 ? (
          <View style={styles.noNotifications}>
            <Text style={styles.noNotificationsText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map(notif => (
            <View key={notif.id} style={styles.notificationItem}>
              <Text style={styles.notificationTime}>{notif.time}</Text>
              <Text style={styles.notificationMessage}>{notif.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  // Tools Mode UI - grid tombol buat buka tiap fitur tambahan
  const toolItems = [
    { key: 'overlayEffects', label: 'Clock/Date', icon: 'schedule', onPress: () => setShowOverlayEffects(true) },
    { key: 'scoreboard', label: 'Scoreboard', icon: 'scoreboard', onPress: () => setShowScoreboard(true) },
    { key: 'audio', label: 'Audio FX', icon: 'graphic-eq', onPress: () => setShowAudioProcessor(true) },
    { key: 'media', label: 'Media Player', icon: 'play-circle-filled', onPress: () => setShowMediaPlayer(true) },
    { key: 'weblink', label: 'Web Link', icon: 'language', onPress: () => setShowWebLink(true) },
    { key: 'image', label: 'Image Picker', icon: 'image', onPress: () => setShowImagePicker(true) },
    { key: 'rtmp', label: 'Custom RTMP', icon: 'dns', onPress: () => setShowRTMPManager(true) },
    { key: 'youtube', label: 'YouTube Settings', icon: 'ondemand-video', onPress: () => setShowYouTubeSettings(true) },
    { key: 'screencast', label: 'Screen Share', icon: 'cast', onPress: () => setShowScreenCast(true) },
  ];

  const renderToolsMode = () => (
    <View style={[styles.toolsContainer, { backgroundColor: theme.primaryLight }]}>
      <ScrollView contentContainerStyle={styles.toolsGrid}>
        {toolItems.map((tool) => (
          <TouchableOpacity key={tool.key} style={styles.toolCard} onPress={tool.onPress}>
            <MaterialIcons name={tool.icon} size={26} color="#fff" />
            <Text style={styles.toolLabel}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Control Panel UI
  const renderControlPanel = () => (
    <View style={[styles.controlPanel, { backgroundColor: theme.primaryLight }]}>
      <PlatformSelector 
        onPlatformChange={setActivePlatforms}
        activePlatforms={activePlatforms}
      />

      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'mini' && styles.modeButtonActive]}
          onPress={() => setCurrentMode('mini')}
        >
          <Text style={styles.modeButtonText}>Mini</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'stats' && styles.modeButtonActive]}
          onPress={() => setCurrentMode('stats')}
        >
          <Text style={styles.modeButtonText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'notifications' && styles.modeButtonActive]}
          onPress={() => setCurrentMode('notifications')}
        >
          <Text style={styles.modeButtonText}>Alerts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'tools' && styles.modeButtonActive]}
          onPress={() => setCurrentMode('tools')}
        >
          <Text style={styles.modeButtonText}>Tools</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.themeButtons}>
        {Object.keys(THEMES).map(themeName => (
          <TouchableOpacity
            key={themeName}
            style={[
              styles.themeButton,
              { backgroundColor: THEMES[themeName].primary },
              currentTheme === themeName && styles.themeButtonActive,
            ]}
            onPress={() => changeTheme(themeName)}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.toggleButton, { backgroundColor: theme.primary }]}
        onPress={() => setIsFloating(!isFloating)}
      >
        <MaterialIcons name={isFloating ? 'unfold-less' : 'unfold-more'} size={20} color="#fff" />
        <Text style={styles.toggleButtonText}>
          {isFloating ? 'Minimize' : 'Float'}
        </Text>
      </TouchableOpacity>

      <View style={styles.statusIndicator}>
        <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#FF5252' }]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
      </View>

      {currentMode === 'tools' && renderToolsMode()}
    </View>
  );

  // Semua modal tools - dipasang sekali, tampil independen dari mode/floating state
  const renderToolModals = () => (
    <>
      <OverlayEffectManager
        visible={showOverlayEffects}
        onClose={() => setShowOverlayEffects(false)}
        onApplyEffect={(effect) => addNotification(`Effect applied: ${effect?.type || 'overlay'}`)}
      />
      <ScoreboardManager
        visible={showScoreboard}
        onClose={() => setShowScoreboard(false)}
        onApplyScoreboard={() => addNotification('Scoreboard applied')}
      />
      <AudioProcessor
        visible={showAudioProcessor}
        onClose={() => setShowAudioProcessor(false)}
      />
      <MediaPlayer
        visible={showMediaPlayer}
        onClose={() => setShowMediaPlayer(false)}
      />
      <WebLinkHandler
        visible={showWebLink}
        onClose={() => setShowWebLink(false)}
        onLinkOpened={(url) => addNotification(`Link opened: ${url}`)}
      />
      <ImagePicker
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
      />
      <RTMPManager
        visible={showRTMPManager}
        onClose={() => setShowRTMPManager(false)}
        onSaveProfile={(profile) => addNotification(`RTMP profile saved: ${profile?.name || ''}`)}
      />
      <YouTubeSettings
        visible={showYouTubeSettings}
        onClose={() => setShowYouTubeSettings(false)}
        onSaveSettings={() => addNotification('YouTube settings saved')}
      />
      <ScreenCastHandler
        visible={showScreenCast}
        onClose={() => setShowScreenCast(false)}
      />
    </>
  );

  // Main Render
  if (!isFloating) {
    return (
      <>
        {renderControlPanel()}
        {renderToolModals()}
      </>
    );
  }

  return (
    <Animated.View
      style={[
        styles.floatingWindow,
        { backgroundColor: theme.primaryLight },
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
    >
      {currentMode === 'mini' && renderMiniMode()}
      {currentMode === 'stats' && renderStatsMode()}
      {currentMode === 'notifications' && renderNotificationsMode()}
      {currentMode === 'tools' && renderToolsMode()}

      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: theme.primary }]}
        onPress={() => setIsFloating(false)}
      >
        <MaterialIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>

      {renderToolModals()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Control Panel
  controlPanel: {
    flex: 1,
    padding: 15,
    gap: 15,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modeButtonActive: {
    backgroundColor: '#333',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  modeButtonActive: {
    color: '#fff',
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeButtonActive: {
    borderColor: '#fff',
  },
  toggleButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  toggleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },

  // Mini Mode
  miniContainer: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  miniHeader: {
    alignItems: 'center',
  },
  miniViewers: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  miniViewersLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  miniStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  miniStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniStatText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Stats Mode
  statsContainer: {
    borderRadius: 12,
    padding: 15,
    gap: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderLeftWidth: 4,
    paddingLeft: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  platformStatsContainer: {
    gap: 8,
  },
  platformStatsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  platformStatsList: {
    maxHeight: 150,
  },
  platformStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  platformStatName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  platformStatValues: {
    flexDirection: 'row',
    gap: 15,
  },
  platformStatValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Notifications Mode
  notificationsContainer: {
    borderRadius: 12,
    padding: 12,
    maxHeight: 300,
  },
  alertInputSection: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  alertInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    maxHeight: 80,
  },
  alertSendBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noNotifications: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noNotificationsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  notificationItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  notificationMessage: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
    marginTop: 2,
  },

  // Tools Mode
  toolsContainer: {
    borderRadius: 12,
    padding: 12,
    maxHeight: 320,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  toolCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toolLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Floating Window
  floatingWindow: {
    borderRadius: 12,
    padding: 15,
    minHeight: 200,
    minWidth: 150,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingLiveOverlay;
