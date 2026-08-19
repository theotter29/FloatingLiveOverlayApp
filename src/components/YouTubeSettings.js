import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  TextInput,
  Alert,
  Clipboard,
  Share,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * YouTubeSettings Component
 * Handle YouTube monetization, stream latency, dan pre-broadcast link sharing
 */
export const YouTubeSettings = ({
  visible,
  onClose,
  onSaveSettings,
  title = 'YouTube Settings',
}) => {
  const [monetizationEnabled, setMonetizationEnabled] = useState(false);
  const [madeForKids, setMadeForKids] = useState(false);
  const [latencyMode, setLatencyMode] = useState('normal'); // normal | low | ultraLow
  const [preBroadcastLink, setPreBroadcastLink] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');

  const latencyOptions = [
    {
      key: 'normal',
      label: 'Normal Latency',
      desc: 'Kualitas terbaik, delay lebih lama (~20-30 detik)',
      icon: 'hd',
    },
    {
      key: 'low',
      label: 'Low Latency',
      desc: 'Delay lebih pendek (~5-10 detik), cocok interaksi chat',
      icon: 'speed',
    },
    {
      key: 'ultraLow',
      label: 'Ultra Low Latency',
      desc: 'Delay minimal (~2-4 detik), kualitas bisa turun',
      icon: 'flash-on',
    },
  ];

  const handleGenerateLink = () => {
    if (!broadcastTitle.trim()) {
      Alert.alert('Error', 'Masukkan judul broadcast dulu');
      return;
    }
    // Placeholder link generation - real implementation via YouTube Data API
    const slug = broadcastTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);
    const generatedLink = `https://youtube.com/watch?v=pending-${slug}-${Date.now()
      .toString()
      .slice(-6)}`;
    setPreBroadcastLink(generatedLink);
  };

  const handleCopyLink = () => {
    if (!preBroadcastLink) {
      Alert.alert('Error', 'Belum ada link untuk disalin');
      return;
    }
    Clipboard.setString(preBroadcastLink);
    Alert.alert('Copied', 'Link broadcast disalin ke clipboard');
  };

  const handleShareLink = async () => {
    if (!preBroadcastLink) {
      Alert.alert('Error', 'Belum ada link untuk dibagikan');
      return;
    }
    try {
      await Share.share({
        message: `Nonton live streaming gue! ${preBroadcastLink}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Gagal share link: ' + error.message);
    }
  };

  const handleSave = () => {
    const settings = {
      monetizationEnabled,
      madeForKids,
      latencyMode,
      preBroadcastLink,
      broadcastTitle,
    };
    if (onSaveSettings) {
      onSaveSettings(settings);
    }
    Alert.alert('Tersimpan', 'Pengaturan YouTube berhasil disimpan');
  };

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
          {/* Monetization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monetization</Text>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelBox}>
                <MaterialIcons name="attach-money" size={20} color="#FF6B35" />
                <View style={styles.switchTextBox}>
                  <Text style={styles.switchLabel}>Enable Monetization</Text>
                  <Text style={styles.switchDesc}>
                    Tampilkan ads di stream (butuh channel eligible)
                  </Text>
                </View>
              </View>
              <Switch
                value={monetizationEnabled}
                onValueChange={setMonetizationEnabled}
                trackColor={{ false: '#333', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelBox}>
                <MaterialIcons name="child-care" size={20} color="#FF6B35" />
                <View style={styles.switchTextBox}>
                  <Text style={styles.switchLabel}>Made for Kids</Text>
                  <Text style={styles.switchDesc}>
                    Nonaktifkan monetization &amp; comment kalau aktif
                  </Text>
                </View>
              </View>
              <Switch
                value={madeForKids}
                onValueChange={setMadeForKids}
                trackColor={{ false: '#333', true: '#FF6B35' }}
                thumbColor="#fff"
              />
            </View>

            {monetizationEnabled && madeForKids && (
              <Text style={styles.warningText}>
                ⚠️ "Made for Kids" akan menonaktifkan monetization otomatis
              </Text>
            )}
          </View>

          {/* Stream Latency */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stream Latency</Text>
            {latencyOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.latencyOption,
                  latencyMode === opt.key && styles.latencyOptionActive,
                ]}
                onPress={() => setLatencyMode(opt.key)}
              >
                <MaterialIcons
                  name={opt.icon}
                  size={22}
                  color={latencyMode === opt.key ? '#FF6B35' : '#999'}
                />
                <View style={styles.latencyText}>
                  <Text
                    style={[
                      styles.latencyLabel,
                      latencyMode === opt.key && styles.latencyLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.latencyDesc}>{opt.desc}</Text>
                </View>
                {latencyMode === opt.key && (
                  <MaterialIcons name="check-circle" size={20} color="#FF6B35" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Pre-broadcast link sharing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pre-Broadcast Link Sharing</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="title" size={20} color="#FF6B35" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Judul broadcast"
                placeholderTextColor="#666"
                value={broadcastTitle}
                onChangeText={setBroadcastTitle}
              />
            </View>

            <TouchableOpacity style={styles.generateBtn} onPress={handleGenerateLink}>
              <MaterialIcons name="link" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Generate Link</Text>
            </TouchableOpacity>

            {preBroadcastLink.length > 0 && (
              <View style={styles.linkResultBox}>
                <Text style={styles.linkResultText} numberOfLines={1}>
                  {preBroadcastLink}
                </Text>
                <View style={styles.linkActionsRow}>
                  <TouchableOpacity onPress={handleCopyLink} style={styles.linkIconBtn}>
                    <MaterialIcons name="content-copy" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleShareLink} style={styles.linkIconBtn}>
                    <MaterialIcons name="share" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <MaterialIcons name="save" size={18} color="#fff" />
            <Text style={styles.actionBtnText}>Save Settings</Text>
          </TouchableOpacity>
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
  switchLabelBox: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  switchTextBox: { marginLeft: 10, flex: 1 },
  switchLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  switchDesc: { color: '#999', fontSize: 11, marginTop: 2 },
  warningText: { color: '#F59E0B', fontSize: 12, marginTop: 4 },
  latencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  latencyOptionActive: { borderColor: '#FF6B35' },
  latencyText: { flex: 1, marginLeft: 12 },
  latencyLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  latencyLabelActive: { color: '#FF6B35' },
  latencyDesc: { color: '#999', fontSize: 11, marginTop: 2 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 14 },
  generateBtn: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkResultBox: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  linkResultText: { color: '#3B82F6', fontSize: 13 },
  linkActionsRow: { flexDirection: 'row', marginTop: 10, gap: 16 },
  linkIconBtn: { padding: 4 },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
});

export default YouTubeSettings;
