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

# 1. Import AsyncStorage
apply(
"""  Modal,
  AppState,
  Share
} from 'react-native';""",
"""  Modal,
  AppState,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';""",
"import AsyncStorage ditambahkan")

# 2. Key penyimpanan tema
apply(
"""const THEMES = {""",
"""const THEME_STORAGE_KEY = '@floating_overlay_theme';

const THEMES = {""",
"key storage tema ditambahkan")

# 3. Muat tema tersimpan saat aplikasi dibuka
apply(
"""  const pulseAnim = useRef(new Animated.Value(1)).current;""",
"""  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Muat tema tersimpan saat aplikasi dibuka
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved && THEMES[saved]) setTheme(saved);
      })
      .catch((err) => console.warn('Gagal memuat tema:', err));
  }, []);""",
"load tema tersimpan ditambahkan")

# 4. Simpan tema ke AsyncStorage saat dipilih
apply(
"""            onPress={() => setTheme(key)}""",
"""            onPress={() => {
              setTheme(key);
              AsyncStorage.setItem(THEME_STORAGE_KEY, key).catch((err) =>
                console.warn('Gagal menyimpan tema:', err)
              );
            }}""",
"simpan tema saat dipilih")

# 5. Reset peakViewers setelah recap ditutup (siap untuk sesi live berikutnya)
apply(
"""  const closeRecapAndExit = () => {
    setShowRecap(false);
    setIsFloating(false);
  };""",
"""  const closeRecapAndExit = () => {
    setShowRecap(false);
    setIsFloating(false);
    setPeakViewers(0);
  };""",
"reset peakViewers setelah recap ditutup")

if changes > 0:
    with open('src/FloatingLiveOverlay.js', 'w') as f:
        f.write(content)
    print(f"\nTOTAL: {changes} perubahan disimpan")
else:
    print("\nTIDAK ADA PERUBAHAN DISIMPAN")
