// PlatformSelector.js - Platform Selection UI
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PlatformSelector = ({ onPlatformChange, activePlatforms = [] }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const platforms = [
    { id: 'tiktok', name: 'TikTok', icon: 'music', color: '#000' },
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E1306C' },
    { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
  ];

  const handlePlatformToggle = (platformId) => {
    const isActive = activePlatforms.includes(platformId);
    const newActive = isActive
      ? activePlatforms.filter(p => p !== platformId)
      : [...activePlatforms, platformId];
    
    onPlatformChange(newActive);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setModalVisible(true)}
      >
        <MaterialIcons name="settings" size={24} color="#fff" />
        <Text style={styles.toggleText}>
          {activePlatforms.length > 0
            ? `${activePlatforms.length} Platform${activePlatforms.length > 1 ? 's' : ''}`
            : 'Select Platforms'}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerText}>Select Platforms</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.platformList}>
              {platforms.map((platform) => (
                <TouchableOpacity
                  key={platform.id}
                  style={[
                    styles.platformItem,
                    activePlatforms.includes(platform.id) && styles.platformItemActive,
                  ]}
                  onPress={() => handlePlatformToggle(platform.id)}
                >
                  <View
                    style={[
                      styles.platformIcon,
                      { backgroundColor: platform.color },
                    ]}
                  >
                    <FontAwesome name={platform.icon} size={20} color="#fff" />
                  </View>
                  <Text style={styles.platformName}>{platform.name}</Text>
                  {activePlatforms.includes(platform.id) && (
                    <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.confirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  platformList: {
    paddingHorizontal: 10,
  },
  platformItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  platformItemActive: {
    backgroundColor: '#f5f5f5',
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PlatformSelector;
