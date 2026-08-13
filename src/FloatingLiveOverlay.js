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
  AppState
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

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
      requestOverlayPermission();
    }
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
    setIsFloating(false);
  };

  // Simulasi real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const types = ['like', 'follow', 'share', 'gift'];
      const users = ['Budi_456', 'Maya_789', 'Andi_01', 'Citra_222'];
      const messages = [
        '❤️ Menyukai live Anda',
        '👥 Mulai mengikuti Anda',
        '📤 Membagikan live Anda',
        '🎁 Mengirim hadiah'
      ];

      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMsg = messages[types.indexOf(randomType)];

      const newNotif = {
        id: Math.random(),
        type: randomType,
        user: randomUser,
        text: randomMsg,
        time: 'Baru saja'
      };

      setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);

      // Update stats
      if (randomType === 'like') {
        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
      } else if (randomType === 'follow') {
        setStats(prev => ({ ...prev, viewers: prev.viewers + 1 }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
      <View style={styles.panelHeader}>
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

      <View style={styles.durationBar}>
        <Text style={styles.durationLabel}>⏱️ Durasi Live</Text>
        <Text style={styles.durationValue}>{stats.duration}</Text>
      </View>
    </View>
  );

  // Notifications Mode
  const NotificationsMode = () => (
    <View style={styles.overlayPanel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>🔔 Aktivitas</Text>
        <TouchableOpacity onPress={() => setCurrentMode('mini')}>
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {notifications.map((notif) => (
          <View key={notif.id} style={styles.notificationItem}>
            <Text style={styles.notifIcon}>
              {notif.type === 'like' && '❤️'}
              {notif.type === 'follow' && '👥'}
              {notif.type === 'share' && '📤'}
              {notif.type === 'gift' && '🎁'}
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
      <View style={styles.panelHeader}>
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
          style={styles.alertSendBtn}
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

  // Main Modal Content
  const ModalContent = () => {
    switch (currentMode) {
      case 'stats':
        return <StatsMode />;
      case 'notifications':
        return <NotificationsMode />;
      case 'alerts':
        return <AlertsMode />;
      case 'mini':
      default:
        return <MiniMode />;
    }
  };

  return (
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
});

export default FloatingLiveOverlay;
