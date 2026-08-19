import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
  Clipboard,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * RTMPManager Component
 * Custom RTMP input guide - kelola server URL & stream key buat custom streaming target
 */
export const RTMPManager = ({
  visible,
  onClose,
  onSaveProfile,
  title = 'Custom RTMP',
}) => {
  const [serverUrl, setServerUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [profileName, setProfileName] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [showGuide, setShowGuide] = useState(false);

  const isValid = serverUrl.trim().length > 0 && streamKey.trim().length > 0;

  const handleSaveProfile = () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Masukkan nama profile dulu');
      return;
    }
    if (!isValid) {
      Alert.alert('Error', 'Server URL dan Stream Key wajib diisi');
      return;
    }

    const newProfile = {
      id: Date.now(),
      name: profileName.trim(),
      serverUrl: serverUrl.trim(),
      streamKey: streamKey.trim(),
      createdAt: new Date().toLocaleString(),
    };

    setProfiles([newProfile, ...profiles]);
    setProfileName('');
    Alert.alert('Tersimpan', 'RTMP profile berhasil disimpan');

    if (onSaveProfile) {
      onSaveProfile(newProfile);
    }
  };

  const handleUseProfile = (profile) => {
    setServerUrl(profile.serverUrl);
    setStreamKey(profile.streamKey);
    Alert.alert('Loaded', `Profile "${profile.name}" dimuat`);
  };

  const handleDeleteProfile = (id) => {
    Alert.alert('Hapus Profile', 'Yakin mau hapus profile ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => setProfiles(profiles.filter((p) => p.id !== id)),
      },
    ]);
  };

  const handleCopy = (value, label) => {
    Clipboard.setString(value);
    Alert.alert('Copied', `${label} disalin ke clipboard`);
  };

  const handleClear = () => {
    setServerUrl('');
    setStreamKey('');
  };

  // Preset RTMP server examples buat guide
  const rtmpPresets = [
    { name: 'YouTube', server: 'rtmp://a.rtmp.youtube.com/live2' },
    { name: 'Facebook', server: 'rtmps://live-api-s.facebook.com:443/rtmp' },
    { name: 'Twitch', server: 'rtmp://live.twitch.tv/app' },
    { name: 'TikTok', server: 'rtmp://push-rtmp.tiktokcdn.com/live' },
  ];

  const guideSteps = [
    'Buka dashboard live streaming platform tujuan (YouTube Studio, FB Live, dll)',
    'Cari menu "Stream" atau "Go Live" lalu pilih opsi Stream Key / RTMP',
    'Copy Server URL dan Stream Key dari platform tersebut',
    'Paste Server URL dan Stream Key ke form di atas',
    'Tap "Save Profile" biar bisa dipakai lagi tanpa copy ulang',
    'Pilih profile ini saat mulai live streaming',
  ];

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
          {/* Guide toggle */}
          <TouchableOpacity
            style={styles.guideToggle}
            onPress={() => setShowGuide(!showGuide)}
          >
            <MaterialIcons name="help-outline" size={18} color="#FF6B35" />
            <Text style={styles.guideToggleText}>
              {showGuide ? 'Sembunyikan panduan' : 'Cara dapatkan RTMP URL & Key'}
            </Text>
            <MaterialIcons
              name={showGuide ? 'expand-less' : 'expand-more'}
              size={20}
              color="#FF6B35"
            />
          </TouchableOpacity>

          {showGuide && (
            <View style={styles.guideBox}>
              {guideSteps.map((step, index) => (
                <View key={index} style={styles.guideStep}>
                  <View style={styles.guideStepNumber}>
                    <Text style={styles.guideStepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.guideStepText}>{step}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Server Umum</Text>
              {rtmpPresets.map((preset, index) => (
                <View key={index} style={styles.presetRow}>
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <TouchableOpacity onPress={() => setServerUrl(preset.server)}>
                    <Text style={styles.presetUse}>Pakai</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Server URL */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Server URL</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="dns" size={20} color="#FF6B35" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="rtmp://server.example.com/live"
                placeholderTextColor="#666"
                value={serverUrl}
                onChangeText={setServerUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {serverUrl.length > 0 && (
                <TouchableOpacity onPress={() => handleCopy(serverUrl, 'Server URL')}>
                  <MaterialIcons name="content-copy" size={18} color="#3B82F6" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Stream Key */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Stream Key</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="vpn-key" size={20} color="#FF6B35" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="stream-key-rahasia"
                placeholderTextColor="#666"
                value={streamKey}
                onChangeText={setStreamKey}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.iconBtn}>
                <MaterialIcons
                  name={showKey ? 'visibility-off' : 'visibility'}
                  size={18}
                  color="#999"
                />
              </TouchableOpacity>
              {streamKey.length > 0 && (
                <TouchableOpacity onPress={() => handleCopy(streamKey, 'Stream Key')}>
                  <MaterialIcons name="content-copy" size={18} color="#3B82F6" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.warningText}>
              ⚠️ Jangan share stream key ke orang lain
            </Text>
          </View>

          {/* Save as profile */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Simpan sebagai Profile</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="label" size={20} color="#FF6B35" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Nama profile (misal: Backup Server)"
                placeholderTextColor="#666"
                value={profileName}
                onChangeText={setProfileName}
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={handleSaveProfile}
              disabled={!isValid}
              style={[styles.actionBtn, styles.saveBtn, !isValid && styles.disabled]}
            >
              <MaterialIcons name="save" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Save Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleClear} style={[styles.actionBtn, styles.clearBtn]}>
              <MaterialIcons name="clear" size={18} color="#fff" />
              <Text style={styles.actionBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {/* Saved Profiles */}
          {profiles.length > 0 && (
            <View style={styles.profilesSection}>
              <Text style={styles.sectionTitle}>Saved Profiles</Text>
              {profiles.map((profile) => (
                <View key={profile.id} style={styles.profileItem}>
                  <TouchableOpacity
                    style={styles.profileContent}
                    onPress={() => handleUseProfile(profile)}
                  >
                    <MaterialIcons name="dns" size={20} color="#3B82F6" />
                    <View style={styles.profileText}>
                      <Text style={styles.profileName}>{profile.name}</Text>
                      <Text style={styles.profileUrl} numberOfLines={1}>
                        {profile.serverUrl}
                      </Text>
                      <Text style={styles.profileTime}>{profile.createdAt}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteProfile(profile.id)}
                    style={styles.deleteBtn}
                  >
                    <MaterialIcons name="delete" size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  guideToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  guideToggleText: { flex: 1, color: '#FF6B35', fontSize: 13, fontWeight: '600', marginLeft: 8 },
  guideBox: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  guideStep: { flexDirection: 'row', marginBottom: 10, alignItems: 'flex-start' },
  guideStepNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  guideStepNumberText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  guideStepText: { flex: 1, color: '#ccc', fontSize: 13, lineHeight: 18 },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  presetName: { color: '#fff', fontSize: 13 },
  presetUse: { color: '#3B82F6', fontSize: 13, fontWeight: '600' },
  inputSection: { marginBottom: 18 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, paddingVertical: 12, color: '#fff', fontSize: 14 },
  iconBtn: { paddingHorizontal: 8 },
  warningText: { color: '#F59E0B', fontSize: 11, marginTop: 6 },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: { backgroundColor: '#FF6B35' },
  clearBtn: { backgroundColor: '#3B3B3B' },
  disabled: { opacity: 0.5 },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 6 },
  profilesSection: { marginBottom: 24 },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  profileContent: { flex: 1, flexDirection: 'row', alignItems: 'flex-start' },
  profileText: { flex: 1, marginLeft: 12 },
  profileName: { color: '#fff', fontSize: 14, fontWeight: '600' },
  profileUrl: { color: '#999', fontSize: 12, marginTop: 4 },
  profileTime: { color: '#666', fontSize: 10, marginTop: 4 },
  deleteBtn: { padding: 8 },
});

export default RTMPManager;
