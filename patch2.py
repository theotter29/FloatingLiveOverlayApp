with open('src/FloatingLiveOverlay.js') as f:
    content = f.read()

changes = 0
def apply(old, new, label):
    global content, changes
    if old in content:
        content = content.replace(old, new, 1)
        changes += 1
        print(f"BERHASIL: {label}")
    else:
        print(f"LEWAT: {label} (pattern tidak ketemu)")

# 1. Import Share (untuk fitur export)
apply(
"""  Modal,
  AppState
} from 'react-native';""",
"""  Modal,
  AppState,
  Share
} from 'react-native';""",
"import Share ditambahkan")

# 2. Konstanta THEMES
apply(
"""const FloatingLiveOverlay = () => {""",
"""const THEMES = {
  orange: { primary: '#FF6B35', primaryLight: 'rgba(255, 107, 53, 0.95)', primarySoft: 'rgba(255, 107, 53, 0.15)' },
  purple: { primary: '#8B5CF6', primaryLight: 'rgba(139, 92, 246, 0.95)', primarySoft: 'rgba(139, 92, 246, 0.15)' },
  blue: { primary: '#3B82F6', primaryLight: 'rgba(59, 130, 246, 0.95)', primarySoft: 'rgba(59, 130, 246, 0.15)' },
  green: { primary: '#10B981', primaryLight: 'rgba(16, 185, 129, 0.95)', primarySoft: 'rgba(16, 185, 129, 0.15)' },
};

const FloatingLiveOverlay = () => {""",
"konstanta THEMES ditambahkan")

# 3. State baru untuk fitur premium
apply(
"""  const [appState, setAppState] = useState(AppState.currentState);""",
"""  const [appState, setAppState] = useState(AppState.currentState);

  // ==== FITUR PREMIUM ====
  const [isPremium] = useState(true); // TODO: hubungkan ke sistem pembayaran nanti
  const [theme, setTheme] = useState('orange');
  const currentTheme = THEMES[theme];
  const [showRecap, setShowRecap] = useState(false);
  const [peakViewers, setPeakViewers] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;""",
"state fitur premium ditambahkan")

# 4. Trigger pulse saat donasi/gift masuk
apply(
"""      if (data.type === 'donation' || data.type === 'gift') {
        setStats((prev) => ({ ...prev, gifts: prev.gifts + 1 }));
      }
    });""",
"""      if (data.type === 'donation' || data.type === 'gift') {
        setStats((prev) => ({ ...prev, gifts: prev.gifts + 1 }));
        triggerAlertPulse();
      }
    });""",
"trigger pulse pada donasi/gift")

# 5. Fungsi peak viewer, pulse, export
apply(
"""  const requestOverlayPermission = async () => {""",
"""  // Lacak viewer tertinggi untuk recap sesi
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
      const lines = notifications.map((n) => `[${n.time}] ${n.user}: ${n.text}`).join('\\n');
      await Share.share({
        title: 'Riwayat Notifikasi Live',
        message: `Riwayat Notifikasi Live\\n\\n${lines}`,
      });
    } catch (err) {
      console.warn('Export gagal:', err);
    }
  };

  const requestOverlayPermission = async () => {""",
"fungsi peak viewer, pulse, export ditambahkan")

# 6. stopFloatingWindow -> tampilkan recap dulu
apply(
"""  const stopFloatingWindow = () => {
    setIsFloating(false);
  };""",
"""  const stopFloatingWindow = () => {
    setShowRecap(true);
  };

  const closeRecapAndExit = () => {
    setShowRecap(false);
    setIsFloating(false);
  };""",
"stopFloatingWindow menampilkan recap")

# 7. Terapkan tema + animasi pulse ke bubble utama
apply(
"""        {currentMode === 'mini' ? (
          <Animated.View
            style={[
              styles.floatingBubble,
              {
                transform: [{ translateX: pan.x }, { translateY: pan.y }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.miniContainer}>""",
"""        {currentMode === 'mini' ? (
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
            <View style={[styles.miniContainer, { backgroundColor: currentTheme.primaryLight }]}>""",
"tema & pulse diterapkan ke bubble")

# 8. Tema di header StatsMode
apply(
"""      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>📊 Live Stats</Text>""",
"""      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>📊 Live Stats</Text>""",
"tema di header StatsMode")

# 9. Tema + tombol export di header NotificationsMode
apply(
"""      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>🔔 Aktivitas</Text>
        <TouchableOpacity onPress={() => setCurrentMode('mini')}>
          <MaterialIcons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>""",
"""      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>🔔 Aktivitas</Text>
        <View style={styles.panelControls}>
          <TouchableOpacity onPress={exportNotifications} style={{ marginRight: 12 }}>
            <MaterialIcons name="ios-share" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentMode('mini')}>
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>""",
"tema & tombol export di header Notifikasi")

# 10. Tema di header AlertsMode
apply(
"""      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>🚨 Alerts & Text</Text>""",
"""      <View style={[styles.panelHeader, { backgroundColor: currentTheme.primaryLight }]}>
        <Text style={styles.panelTitle}>🚨 Alerts & Text</Text>""",
"tema di header AlertsMode")

# 11. Tema di duration bar
apply(
"""      <View style={styles.durationBar}>
        <Text style={styles.durationLabel}>⏱️ Durasi Live</Text>
        <Text style={styles.durationValue}>{stats.duration}</Text>
      </View>""",
"""      <View style={[styles.durationBar, { backgroundColor: currentTheme.primarySoft }]}>
        <Text style={styles.durationLabel}>⏱️ Durasi Live</Text>
        <Text style={[styles.durationValue, { color: currentTheme.primary }]}>{stats.duration}</Text>
      </View>""",
"tema di duration bar")

# 12. Tema di tombol kirim alert
apply(
"""        <TouchableOpacity
          style={styles.alertSendBtn}
          onPress={() => {""",
"""        <TouchableOpacity
          style={[styles.alertSendBtn, { backgroundColor: currentTheme.primary }]}
          onPress={() => {""",
"tema di tombol kirim alert")

# 13. Komponen ThemeMode
apply(
"""  // Main Modal Content
  const ModalContent = () => {""",
"""  // Theme Mode - pilih warna tema
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
            onPress={() => setTheme(key)}
          >
            {theme === key && <MaterialIcons name="check" size={22} color="#fff" />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Main Modal Content
  const ModalContent = () => {""",
"komponen ThemeMode ditambahkan")

# 14. Tambah case 'theme' di switch
apply(
"""      case 'alerts':
        return <AlertsMode />;
      case 'mini':""",
"""      case 'alerts':
        return <AlertsMode />;
      case 'theme':
        return <ThemeMode />;
      case 'mini':""",
"case theme ditambahkan ke switch")

# 15. Tombol mode Tema di mode selector
apply(
"""                <TouchableOpacity
                  style={styles.modeBtn}
                  onPress={() => {
                    setCurrentMode('alerts');
                    setIsExpanded(false);
                  }}
                >
                  <Text style={styles.modeBtnText}>🚨</Text>
                </TouchableOpacity>""",
"""                <TouchableOpacity
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
                </TouchableOpacity>""",
"tombol mode Tema ditambahkan")

# 16. Bungkus return dengan Fragment
apply(
"""  return (
    <Modal
      visible={isFloating}""",
"""  return (
    <>
    <Modal
      visible={isFloating}""",
"fragment pembuka ditambahkan")

# 17. Modal Recap Sesi
apply(
"""      </View>
    </Modal>
  );
};""",
"""      </View>
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
};""",
"Modal Recap Sesi ditambahkan")

# 18. Style baru untuk Tema & Recap
apply(
"""  exitBtn: {
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
});""",
"""  exitBtn: {
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
});""",
"style Tema & Recap ditambahkan")

if changes > 0:
    with open('src/FloatingLiveOverlay.js', 'w') as f:
        f.write(content)
    print(f"\nTOTAL: {changes} perubahan disimpan")
else:
    print("\nTIDAK ADA PERUBAHAN DISIMPAN")
