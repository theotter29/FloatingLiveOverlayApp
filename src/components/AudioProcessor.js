import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Slider,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * AudioProcessor Component
 * Handle noise suppression dan voice changer effects
 */
export const AudioProcessor = ({
  visible,
  onClose,
  onSettingsApplied,
  title = 'Audio Settings',
}) => {
  // Noise Suppression
  const [noiseSuppressionEnabled, setNoiseSuppressionEnabled] = useState(false);
  const [noiseLevel, setNoiseLevel] = useState(0.5); // 0-1
  const [noiseMode, setNoiseMode] = useState('normal'); // 'light', 'normal', 'strong'

  // Voice Changer
  const [voiceChangerEnabled, setVoiceChangerEnabled] = useState(false);
  const [voicePreset, setVoicePreset] = useState('normal');
  const [pitchShift, setPitchShift] = useState(0); // -12 to +12 semitones

  // Echo/Reverb
  const [echoEnabled, setEchoEnabled] = useState(false);
  const [echoLevel, setEchoLevel] = useState(0.3);

  // Presets Voice Changer
  const voicePresets = [
    { id: 'normal', name: 'Normal', pitch: 0, speed: 1.0 },
    { id: 'deep', name: 'Deep Voice', pitch: -8, speed: 0.95 },
    { id: 'high', name: 'High Voice', pitch: 8, speed: 1.05 },
    { id: 'robot', name: 'Robot', pitch: 5, speed: 1.1 },
    { id: 'echo', name: 'Echo Effect', pitch: 0, speed: 0.9 },
    { id: 'alien', name: 'Alien', pitch: -10, speed: 0.8 },
  ];

  // Apply settings
  const handleApplySettings = () => {
    const settings = {
      noiseSuppressionEnabled,
      noiseLevel,
      noiseMode,
      voiceChangerEnabled,
      voicePreset,
      pitchShift,
      echoEnabled,
      echoLevel,
      timestamp: Date.now(),
    };

    if (onSettingsApplied) {
      onSettingsApplied(settings);
    }

    Alert.alert('Success', 'Audio settings applied!');
  };

  // Reset to defaults
  const handleReset = () => {
    setNoiseSuppressionEnabled(false);
    setNoiseLevel(0.5);
    setNoiseMode('normal');
    setVoiceChangerEnabled(false);
    setVoicePreset('normal');
    setPitchShift(0);
    setEchoEnabled(false);
    setEchoLevel(0.3);
    Alert.alert('Reset', 'All settings reset to default');
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Noise Suppression Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="mic" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Noise Suppression</Text>
              <Switch
                value={noiseSuppressionEnabled}
                onValueChange={setNoiseSuppressionEnabled}
                trackColor={{ false: '#333', true: '#FF6B35' }}
                thumbColor={noiseSuppressionEnabled ? '#FF6B35' : '#999'}
              />
            </View>

            {noiseSuppressionEnabled && (
              <View style={styles.content}>
                {/* Noise Level Slider */}
                <View style={styles.sliderContainer}>
                  <Text style={styles.label}>Noise Level</Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderValue}>
                      {Math.round(noiseLevel * 100)}%
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={noiseLevel}
                      onValueChange={setNoiseLevel}
                      minimumTrackTintColor="#FF6B35"
                      maximumTrackTintColor="#333"
                    />
                  </View>
                </View>

                {/* Noise Mode */}
                <View style={styles.modeContainer}>
                  <Text style={styles.label}>Suppression Intensity</Text>
                  {['light', 'normal', 'strong'].map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      onPress={() => setNoiseMode(mode)}
                      style={[
                        styles.modeButton,
                        noiseMode === mode && styles.modeButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeButtonText,
                          noiseMode === mode && styles.modeButtonTextActive,
                        ]}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Voice Changer Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="voice-chat" size={24} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Voice Changer</Text>
              <Switch
                value={voiceChangerEnabled}
                onValueChange={setVoiceChangerEnabled}
                trackColor={{ false: '#333', true: '#8B5CF6' }}
                thumbColor={voiceChangerEnabled ? '#8B5CF6' : '#999'}
              />
            </View>

            {voiceChangerEnabled && (
              <View style={styles.content}>
                {/* Voice Presets */}
                <Text style={styles.label}>Voice Presets</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.presetsScroll}
                >
                  {voicePresets.map((preset) => (
                    <TouchableOpacity
                      key={preset.id}
                      onPress={() => {
                        setVoicePreset(preset.id);
                        setPitchShift(preset.pitch);
                      }}
                      style={[
                        styles.presetButton,
                        voicePreset === preset.id && styles.presetButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.presetButtonText,
                          voicePreset === preset.id && styles.presetButtonTextActive,
                        ]}
                      >
                        {preset.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Pitch Shift */}
                <View style={styles.sliderContainer}>
                  <Text style={styles.label}>Pitch Shift</Text>
                  <View style={styles.sliderRow}>
                    <Text style={styles.sliderValue}>
                      {pitchShift > 0 ? '+' : ''}{pitchShift}
                    </Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={-12}
                      maximumValue={12}
                      value={pitchShift}
                      onValueChange={setPitchShift}
                      minimumTrackTintColor="#8B5CF6"
                      maximumTrackTintColor="#333"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Echo/Reverb Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="graphic-eq" size={24} color="#3B82F6" />
              <Text style={styles.sectionTitle}>Echo/Reverb</Text>
              <Switch
                value={echoEnabled}
                onValueChange={setEchoEnabled}
                trackColor={{ false: '#333', true: '#3B82F6' }}
                thumbColor={echoEnabled ? '#3B82F6' : '#999'}
              />
            </View>

            {echoEnabled && (
              <View style={styles.sliderContainer}>
                <Text style={styles.label}>Echo Level</Text>
                <View style={styles.sliderRow}>
                  <Text style={styles.sliderValue}>
                    {Math.round(echoLevel * 100)}%
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={1}
                    value={echoLevel}
                    onValueChange={setEchoLevel}
                    minimumTrackTintColor="#3B82F6"
                    maximumTrackTintColor="#333"
                  />
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.button, styles.resetButton]}
            >
              <MaterialIcons name="refresh" size={20} color="#FF6B35" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApplySettings}
              style={[styles.button, styles.applyButton]}
            >
              <MaterialIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.applyButtonText}>Apply Settings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sliderContainer: {
    padding: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
  },
  modeContainer: {
    padding: 12,
  },
  modeButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  modeButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  modeButtonText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#FF6B35',
  },
  presetsScroll: {
    marginBottom: 12,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    backgroundColor: '#2a2a2a',
  },
  presetButtonActive: {
    borderColor: '#8B5CF6',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  presetButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  presetButtonTextActive: {
    color: '#8B5CF6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  resetButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  applyButton: {
    backgroundColor: '#FF6B35',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AudioProcessor;
