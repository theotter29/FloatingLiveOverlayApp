import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * ScreenCastHandler Component
 * Handle screen-sharing option di dalam Screencast (mirror layar ke overlay/stream)
 */
export const ScreenCastHandler = ({
  visible,
  onClose,
  onStartCast,
  onStopCast,
  title = 'Screen Sharing',
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [resolution, setResolution] = useState('720p'); // 480p | 720p | 1080p
  const [status, setStatus] = useState('idle'); // idle | requesting | active | error

  const resolutionOptions = ['480p', '720p', '1080p'];

  const handleStartSharing = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Tidak Didukung',
        'Screen sharing via MediaProjection cuma tersedia di Android'
      );
      return;
    }

    try {
      setStatus('requesting');

      // MediaProjection permission request happens native-side
      // (perlu diikat ke native module MediaProjectionManager)
      const options = { includeAudio, showCursor, resolution };

      if (onStartCast) {
        await onStartCast(options);
      }

      setIsSharing(true);
      setStatus('active');
    } catch (error) {
      setStatus('error');
      Alert.alert('Gagal', 'Tidak bisa mulai screen sharing: ' + error.message);
    }
  };

  const handleStopSharing = async () => {
    try {
      if (onStopCast) {
        await onStopCast();
      }
      setIsSharing(false);
      setStatus('idle');
    } catch (error) {
      Alert.alert('Error', 'Gagal menghentikan screen sharing: ' + error.message);
    }
  };

  const statusInfo = {
    idle: { label: 'Tidak Aktif', color: '#666', icon: 'stop-circle' },
    requesting: { label: 'Meminta izin...', color: '#F59E0B', icon: 'hourglass-empty' },
    active: { label: 'Sedang Sharing', color: '#22C55E', icon: 'cast-connected' },
    error: { label: 'Error', color: '#EF4444', icon: 'error' },
  };

  const current = statusInfo[status];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status */}
          <View style={styles.statusBox}>
            <MaterialIcons name={current.icon} size={28} color={current.color} />
            <Text style={[styles.statusText, { color: current.color }]}>
              {current.label}
            </Text>
          </View>

          {/* Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Opsi Sharing</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelBox}>
                <MaterialIcons name="volume-up" size={20} color="#FF6B35" />
                <Text style={styles.switchLabel}>Sertakan Audio Sistem</Text>
              </View>
              <Switch
                value={includeAudio}
                onValueChange={setIncludeAudio}
                trackColor={{ false: '#333', true: '#FF6B35' }}
                thumbColor="#fff"
                disabled={isSharing}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelBox}>
                <MaterialIcons name="mouse" size={20} color="#FF6B35" />
                <Text style={styles.switchLabel}>Tampilkan Kursor</Text>
              </View>
              <Switch
                value={showCursor}
                onValueChange={setShowCursor}
                trackColor={{ false: '#333', true: '#FF6B35' }}
                thumbColor="#fff"
                disabled={isSharing}
              />
            </View>
          </View>

          {/* Resolution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resolusi</Text>
            <View style={styles.resolutionRow}>
              {resolutionOptions.map((res) => (
                <TouchableOpacity
                  key={res}
                  disabled={isSharing}
                  style={[
                    styles.resBtn,
                    resolution === res && styles.resBtnActive,
                    isSharing && styles.disabled,
                  ]}
                  onPress={() => setResolution(res)}
                >
                  <Text
                    style={[
                      styles.resBtnText,
                      resolution === res && styles.resBtnTextActive,
                    ]}
                  >
                    {res}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action */}
          {!isSharing ? (
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleStartSharing}
              disabled={status === 'requesting'}
            >
              <MaterialIcons name="cast" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>
                {status === 'requesting' ? 'Meminta izin...' : 'Mulai Screen Sharing'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopBtn} onPress={handleStopSharing}>
              <MaterialIcons name="cast-connected" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Hentikan Sharing</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hintText}>
            💡 Screen sharing pakai MediaProjection API (Android). Butuh izin sistem
            setiap kali sesi dimulai.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  header: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusText: { fontSize: 16, fontWeight: '600', marginLeft: 10 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  switchLabelBox: { flexDirection: 'row', alignItems: 'center' },
  switchLabel: { color: '#fff', fontSize: 14, marginLeft: 10 },
  resolutionRow: { flexDirection: 'row', gap: 10 },
  resBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
  },
  resBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  resBtnText: { color: '#999', fontSize: 13, fontWeight: '600' },
  resBtnTextActive: { color: '#fff' },
  disabled: { opacity: 0.5 },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stopBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 8 },
  hintText: { color: '#666', fontSize: 11, textAlign: 'center', marginBottom: 24, lineHeight: 16 },
});

export default ScreenCastHandler;
