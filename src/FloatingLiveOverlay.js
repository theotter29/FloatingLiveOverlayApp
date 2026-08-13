// FloatingLiveOverlay.js - React Native Floating Window untuk TikTok Live
// Install: npm install react-native-floating-window @react-native-camera-roll/camera-roll react-native-vector-icons

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TextInput,
  Modal,
  AppState,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import webSocketService from './services/WebSocketService';

const THEME_STORAGE_KEY = '@floating_overlay_theme';

const THEME_STORAGE_KEY = '@floating_overlay_theme';

const THEMES = {
  orange: { primary: '#FF6B35', primaryLight: 'rgba(255, 107, 53, 0.95)', primarySoft: 'rgba(255, 107, 53, 0.15)' },
  purple: { primary: '#8B5CF6', primaryLight: 'rgba(139, 92, 246, 0.95)', primarySoft: 'rgba(139, 92, 246, 0.15)' },
  blue: { primary: '#3B82F6', primaryLight: 'rgba(59, 130, 246, 0.95)', primarySoft: 'rgba(59, 130, 246, 0.15)' },
  green: { primary: '#10B981', primaryLight: 'rgba(16, 185, 129, 0.95)', primarySoft: 'rgba(16, 185, 129, 0.15)' },
};

const FloatingLiveOverlay = () => {
  const [isFloating, setIsFloating] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'like', user: 'Reza_123', text: '❤️ Menyukai live Anda', time: 'Baru saja' },
    { id: 2, type: 'follow', user: 'Sarah_93', text: '👥 Mulai mengikuti Anda', time: '30 detik lalu' }
  ]);
  const [stats, setStats] = useState({
    viewers: 12450,
    likes: 8932,
    shares: 234,
    gifts: 15,
    duration: '23:45'
  });
  const [currentMode, setCurrentMode] = useState('mini'); // mini, stats, notifications, alerts
  const [customAlert, setCustomAlert] = useState('');
  const [showAlertInput, setShowAlertInput] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  // ==== FITUR PREMIUM ====
  const [isPremium] = useState(true); // TODO: hubungkan ke sistem pembayaran nanti
  const [theme, setTheme] = useState('orange');
  const currentTheme = THEMES[theme];
  const [showRecap, setShowRecap] = useState(false);
  const [peakViewers, setPeakViewers] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Muat tema tersimpan saat aplikasi dibuka
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved && THEMES[saved]) setTheme(saved);
      })
      .catch((err) => console.warn('Gagal memuat tema:', err));
  }, []);

  // Muat tema tersimpan saat aplikasi dibuka
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved && THEMES[saved]) setTheme(saved);
      })
      .catch((err) => console.warn('Gagal memuat tema:', err));
  }, []);

  // Pan Responder untuk drag
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
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Request permissions untuk overlay
  useEffect(() => {
    if (Platform.OS === 'android') {
      // requestOverlayPermission(); // TEMP: dinonaktifkan, SYSTEM_ALERT_WINDOW bukan runtime permission
    }
  }, []);

  // Connect ke WebSocket server
  useEffect(() => {
    const SERVER_URL = 'https://liveoverlayserver-production.up.railway.app';
    const BROADCAST_ID = 'broadcast_001';

    webSocketService.connect(SERVER_URL, BROADCAST_ID, 'tiktok');

    const unsubStats = webSocketService.on('stats', (data) => {
      setStats((prev) => ({ ...prev, ...data }));
    });

    const unsubNotif = webSocketService.on('notification', (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: data.type,
          user: data.user,
          text: data.text,
          time: 'Baru saja',
          platform: data.platform || 'tiktok',
          amount: data.amount,
        },
        ...prev,
      ].slice(0, 20));

      if (data.type === 'donation' || data.type === 'gift') {
        setStats((prev) => ({ ...prev, gifts: prev.gifts + 1 }));
        triggerAlertPulse();
      }
    });

    return () => {
      unsubStats();
      unsubNotif();
    };
  }, []);

  // Monitor app state untuk floating window
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      // App kembali ke foreground
      if (isFloating) {
        startFloatingWindow();
      }
    }
    setAppState(nextAppState);
  };

  // Tampilkan bubble begitu komponen ini dimount (App.tsx sudah kontrol render lewat isLive)
  useEffect(() => {
    setIsFloating(true);
  }, []);

  // Lacak viewer tertinggi untuk recap sesi
  useEffect(() => {
    setPeakViewers((prev) => Math.max(prev, stats.viewers));
  }, [stats.viewers]);

  // Animasi "pulse" saat ada donasi/gift masuk
  const triggerAlertPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.35, duration: 180, useNativeDriver: true }),
      Animated.spring(pulseAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    // TODO: putar efek suara, contoh pakai react-native-sound:
    // Sound.play('donation.mp3')
  };

  // Export riwayat notifikasi
  const exportNotifications = async () => {
    try {
      const lines = notifications.map((n) => `[${n.time}] ${n.user}: ${n.text}`).join('\n');
      await Share.share({
        title: 'Riwayat Notifikasi Live',
        message: `Riwayat Notifikasi Live\n\n${lines}`,
      });
    } catch (err) {
      console.warn('Export gagal:', err);
    }
  };

  const requestOverlayPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 30) {
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
      console.warn(err);
    }
  };

  const startFloatingWindow = async () => {
    try {
      setIsFloating(true);
      // Floating window akan ditampilkan dengan komponen FloatingWindowContent
    } catch (error) {
      console.log('Error starting floating window:', error);
    }
  };

  const stopFloatingWindow = () => {
    setShowRecap(true);
  };

  const closeRecapAndExit = () => {
    setShowRecap(false);
    setIsFloating(false);
    setPeakViewers(0);
  };

  // Update duration
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => {
        const [min, sec] = prev.duration.split(':').map(Number);
        let newSec = sec + 1;
        let newMin = min;
        if (newSec >= 60) {
          newSec = 0;
          newMin += 1;
        }
        return {
          ...prev,
          duration: `${String(newMin).padStart(2, '0')}:${String(newSec).padStart(2, '0')}`
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Mini Mode - Bubble kecil
  const MiniMode = () => (
    <Animated.View
      style={[
        styles.floatingBubble,
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.miniContainer}>
        <View style={styles.miniContent}>
          <Text style={styles.miniViewer}>{stats.viewers}</Text>
          <Text style={styles.miniLabel}>👁️</Text>
        </View>
        <TouchableOpacity
          style={styles.miniExpand}
          onPress={() => setIsExpanded(true)}
        >
          <MaterialIcons name="expand" size={12} color="#fff" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // Stats Mode - Tampilkan statistik live
  const StatsMode = () => (
    <View style={styles.overlayPanel}>
      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>📊 Live Stats</Text>
        <View style={styles.panelControls}>
          <TouchableOpacity onPress={() => setCurrentMode('mini')}>
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>👁️</Text>
          <Text style={styles.statLabel}>Viewers</Text>
          <Text style={styles.statValue}>{stats.viewers.toLocaleString('id-ID')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>❤️</Text>
          <Text style={styles.statLabel}>Likes</Text>
          <Text style={styles.statValue}>{stats.likes.toLocaleString('id-ID')}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📤</Text>
          <Text style={styles.statLabel}>Shares</Text>
          <Text style={styles.statValue}>{stats.shares}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🎁</Text>
          <Text style={styles.statLabel}>Gifts</Text>
          <Text style={styles.statValue}>{stats.gifts}</Text>
        </View>
      </View>

      <View style={[styles.durationBar, { backgroundColor: currentTheme.primarySoft }]}>
        <Text style={styles.durationLabel}>⏱️ Durasi Live</Text>
        <Text style={[styles.durationValue, { color: currentTheme.primary }]}>{stats.duration}</Text>
      </View>
    </View>
  );

  // Notifications Mode
  const NotificationsMode = () => (
    <View style={styles.overlayPanel}>
      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>🔔 Aktivitas</Text>
        <View style={styles.panelControls}>
          <TouchableOpacity onPress={exportNotifications} style={{ marginRight: 12 }}>
            <MaterialIcons name="ios-share" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentMode('mini')}>
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notificationItem}>
            <Text style={styles.notifIcon}>
              {notif.type === 'like' && '❤️'}
              {notif.type === 'follow' && '👥'}
              {notif.type === 'share' && '📤'}
              {notif.type === 'gift' && '🎁'}
              {notif.type === 'donation' && '💰'}
            </Text>
            <View style={styles.notifContent}>
              <Text style={styles.notifUser}>{notif.user}</Text>
              <Text style={styles.notifText}>{notif.text}</Text>
              <Text style={styles.notifTime}>{notif.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  // Alerts Mode
  const AlertsMode = () => (
    <View style={styles.overlayPanel}>
      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>🚨 Alerts & Text</Text>
        <TouchableOpacity onPress={() => setCurrentMode('mini')}>
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.alertInputSection}>
        <TextInput
          style={styles.alertInput}
          placeholder="Ketik alert atau teks khusus..."
          placeholderTextColor="#aaa"
          value={customAlert}
          onChangeText={setCustomAlert}
          multiline
        />
        <TouchableOpacity
          style={[styles.alertSendBtn, { backgroundColor: currentTheme.primary }]}
          onPress={() => {
            if (customAlert.trim()) {
              setNotifications(prev => [
                {
                  id: Math.random(),
                  type: 'alert',
                  user: 'You',
                  text: customAlert,
                  time: 'Baru saja'
                },
                ...prev
              ]);
              setCustomAlert('');
            }
          }}
        >
          <MaterialIcons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.alertsList} showsVerticalScrollIndicator={false}>
        {notifications
          .filter(n => n.type === 'alert' || n.user === 'You')
          .map((alert) => (
            <View key={alert.id} style={[styles.alertItem, alert.user === 'You' && styles.yourAlert]}>
              <Text style={styles.alertText}>{alert.text}</Text>
              <Text style={styles.alertTime}>{alert.time}</Text>
            </View>
          ))}
      </ScrollView>
    </View>
  );

  // Theme Mode - pilih warna tema
  const ThemeMode = () => (
    <View style={styles.overlayPanel}>
      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>🎨 Tema</Text>
        <TouchableOpacity onPress={() => setCurrentMode('mini')}>
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.themeGrid}>
        {Object.keys(THEMES).map((key) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.themeSwatch,
              { backgroundColor: THEMES[key].primary },
              theme === key && styles.themeSwatchActive,
            ]}
            onPress={() => {
              setTheme(key);
              AsyncStorage.setItem(THEME_STORAGE_KEY, key).catch((err) =>
                console.warn('Gagal menyimpan tema:', err)
              );
            }}
          >
            {theme === key && <MaterialIcons name="check" size={22} color="#fff" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Main Modal Content
  const ModalContent = () => {
    switch (currentMode) {
      case 'stats':
        return <StatsMode />;
      case 'notifications':
        return <NotificationsMode />;
      case 'alerts':
        return <AlertsMode />;
      case 'theme':
        return <ThemeMode />;
      case 'mini':
      default:
        return <MiniMode />;
    }
  };

  return (
    <>
    <Modal
      visible={isFloating}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => stopFloatingWindow()}
    >
      <View style={styles.container}>
        {currentMode === 'mini' ? (
          <Animated.View
            style={[
              styles.floatingBubble,
              {
                backgroundColor: currentTheme.primary,
                transform: [
                  { translateX: pan.x },
                  { translateY: pan.y },
                  { scale: pulseAnim },
                ],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={[styles.miniContainer, { backgroundColor: currentTheme.primaryLight }]}>
              <View style={styles.miniContent}>
                <Text style={styles.miniViewer}>{stats.viewers}</Text>
                <Text style={styles.miniLabel}>👁️</Text>
              </View>
            </View>

            {/* Mode Selector */}
            {isExpanded && (
              <View style={styles.modeSelector}>
                <TouchableOpacity
                  style={styles.modeBtn}
                  onPress={() => {
                    setCurrentMode('stats');
                    setIsExpanded(false);
                  }}
                >
                  <Text style={styles.modeBtnText}>📊</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modeBtn}
                  onPress={() => {
                    setCurrentMode('notifications');
                    setIsExpanded(false);
                  }}
                >
                  <Text style={styles.modeBtnText}>🔔</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modeBtn}
                  onPress={() => {
                    setCurrentMode('alerts');
                    setIsExpanded(false);
                  }}
                >
                  <Text style={styles.modeBtnText}>🚨</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modeBtn}
                  onPress={() => {
                    setCurrentMode('theme');
                    setIsExpanded(false);
                  }}
                >
                  <Text style={styles.modeBtnText}>🎨</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, styles.closeModeBtn]}
                  onPress={() => setIsExpanded(false)}
                >
                  <Text style={styles.modeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.miniExpand}
              onPress={() => setIsExpanded(!isExpanded)}
            >
              <MaterialIcons name={isExpanded ? 'expand-less' : 'expand-more'} size={14} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <ModalContent />
        )}

        {/* Exit Button */}
        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() => stopFloatingWindow()}
        >
          <MaterialIcons name="power-settings-new" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </Modal>

    <Modal
      visible={showRecap}
      transparent
      animationType="fade"
      onRequestClose={closeRecapAndExit}
    >
      <View style={styles.recapOverlay}>
        <View style={styles.recapCard}>
          <Text style={styles.recapTitle}>📋 Ringkasan Sesi Live</Text>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>👁️ Puncak Viewers</Text>
            <Text style={[styles.recapValue, { color: currentTheme.primary }]}>{peakViewers.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>❤️ Total Likes</Text>
            <Text style={[styles.recapValue, { color: currentTheme.primary }]}>{stats.likes.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>📤 Shares</Text>
            <Text style={[styles.recapValue, { color: currentTheme.primary }]}>{stats.shares}</Text>
          </View>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>🎁 Gifts</Text>
            <Text style={[styles.recapValue, { color: currentTheme.primary }]}>{stats.gifts}</Text>
          </View>
          <View style={styles.recapRow}>
            <Text style={styles.recapLabel}>⏱️ Durasi</Text>
            <Text style={[styles.recapValue, { color: currentTheme.primary }]}>{stats.duration}</Text>
          </View>
          <TouchableOpacity
            style={[styles.recapCloseBtn, { backgroundColor: currentTheme.primary }]}
            onPress={closeRecapAndExit}
          >
            <Text style={styles.recapCloseText}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  // Floating Bubble
  floatingBubble: {
    position: 'absolute',
    right: 20,
    top: 100,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  miniContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: 'rgba(255, 107, 53, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  miniContent: {
    alignItems: 'center',
  },
  miniViewer: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  miniLabel: {
    fontSize: 20,
    marginTop: 2,
  },
  miniExpand: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 2,
  },
  // Mode Selector
  modeSelector: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'column',
  },
  modeBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,107,53,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  modeBtnText: {
    fontSize: 24,
  },
  closeModeBtn: {
    backgroundColor: 'rgba(200,0,0,0.8)',
  },
  // Overlay Panels
  overlayPanel: {
    position: 'absolute',
    right: 10,
    top: 50,
    width: '90%',
    maxHeight: '85%',
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  panelHeader: {
    backgroundColor: 'rgba(255, 107, 53, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  panelTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  panelControls: {
    flexDirection: 'row',
    gap: 8,
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '700',
  },
  durationBar: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  durationLabel: {
    color: '#fff',
    fontSize: 12,
  },
  durationValue: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  // Notifications
  notificationsList: {
    maxHeight: 300,
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.1)',
  },
  notifIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  notifContent: {
    flex: 1,
  },
  notifUser: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  notifText: {
    color: '#ddd',
    fontSize: 12,
    marginBottom: 4,
  },
  notifTime: {
    color: '#777',
    fontSize: 10,
  },
  // Alerts
  alertInputSection: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 107, 53, 0.2)',
  },
  alertInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    maxHeight: 80,
  },
  alertSendBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertsList: {
    maxHeight: 250,
  },
  alertItem: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    marginHorizontal: 12,
    marginVertical: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#666',
  },
  yourAlert: {
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
    borderLeftColor: '#FF6B35',
  },
  alertText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  alertTime: {
    color: '#888',
    fontSize: 10,
  },
  // Exit Button
  exitBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(200, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Theme Picker
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'center',
    gap: 16,
  },
  themeSwatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeSwatchActive: {
    borderColor: '#fff',
  },
  // Recap Sesi
  recapOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  recapCard: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
  },
  recapTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  recapLabel: {
    color: '#ccc',
    fontSize: 14,
  },
  recapValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  recapCloseBtn: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  recapCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default FloatingLiveOverlay;
