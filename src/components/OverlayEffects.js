import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * ClockEffect Component
 * Display digital atau analog clock di overlay
 */
export const ClockEffect = ({
  visible,
  onClose,
  position = { top: 20, right: 20 },
  style = 'digital', // 'digital', 'analog'
  format = '24h', // '24h', '12h'
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time
  const formatTime = () => {
    let hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');

    if (format === '12h') {
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${hours}:${minutes}:${seconds} ${ampm}`;
    }
    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`;
  };

  if (!visible) return null;

  return (
    <View style={[styles.clockContainer, position]}>
      <View style={styles.clockBox}>
        <Text style={styles.clockText}>{formatTime()}</Text>
      </View>
    </View>
  );
};

/**
 * DateEffect Component
 * Display current date di overlay
 */
export const DateEffect = ({
  visible,
  onClose,
  position = { top: 20, left: 20 },
  format = 'full', // 'full', 'short', 'numeric'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Format date
  const formatDate = () => {
    const options = {
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
    };

    return currentDate.toLocaleDateString('en-US', options[format] || options.full);
  };

  if (!visible) return null;

  return (
    <View style={[styles.dateContainer, position]}>
      <View style={styles.dateBox}>
        <Text style={styles.dateText}>{formatDate()}</Text>
      </View>
    </View>
  );
};

/**
 * OverlayEffectManager Component
 * Manage clock dan date effects dengan UI
 */
export const OverlayEffectManager = ({ visible, onClose, onApplyEffect }) => {
  const [clockEnabled, setClockEnabled] = useState(false);
  const [clockFormat, setClockFormat] = useState('24h');
  const [dateEnabled, setDateEnabled] = useState(false);
  const [dateFormat, setDateFormat] = useState('full');
  const [clockPosition, setClockPosition] = useState('topRight');
  const [datePosition, setDatePosition] = useState('topLeft');

  const positions = [
    { id: 'topLeft', name: 'Top Left', style: { top: 20, left: 20 } },
    { id: 'topRight', name: 'Top Right', style: { top: 20, right: 20 } },
    { id: 'bottomLeft', name: 'Bottom Left', style: { bottom: 20, left: 20 } },
    { id: 'bottomRight', name: 'Bottom Right', style: { bottom: 20, right: 20 } },
    { id: 'center', name: 'Center', style: { top: '50%', left: '50%' } },
  ];

  const handleApplyEffects = () => {
    const effects = {
      clock: {
        enabled: clockEnabled,
        format: clockFormat,
        position: clockPosition,
      },
      date: {
        enabled: dateEnabled,
        format: dateFormat,
        position: datePosition,
      },
    };

    if (onApplyEffect) {
      onApplyEffect(effects);
    }
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
          <Text style={styles.title}>Overlay Effects</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Clock Effect */}
          <View style={styles.effectSection}>
            <View style={styles.effectHeader}>
              <MaterialIcons name="schedule" size={24} color="#3B82F6" />
              <Text style={styles.effectTitle}>Clock</Text>
              <Switch
                value={clockEnabled}
                onValueChange={setClockEnabled}
                trackColor={{ false: '#333', true: '#3B82F6' }}
                thumbColor={clockEnabled ? '#3B82F6' : '#999'}
              />
            </View>

            {clockEnabled && (
              <View style={styles.effectContent}>
                {/* Time Format */}
                <Text style={styles.label}>Time Format</Text>
                <View style={styles.optionRow}>
                  {['24h', '12h'].map((fmt) => (
                    <TouchableOpacity
                      key={fmt}
                      onPress={() => setClockFormat(fmt)}
                      style={[
                        styles.optionButton,
                        clockFormat === fmt && styles.optionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          clockFormat === fmt && styles.optionButtonTextActive,
                        ]}
                      >
                        {fmt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Position */}
                <Text style={styles.label}>Position</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {positions.map((pos) => (
                    <TouchableOpacity
                      key={pos.id}
                      onPress={() => setClockPosition(pos.id)}
                      style={[
                        styles.positionButton,
                        clockPosition === pos.id && styles.positionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.positionButtonText,
                          clockPosition === pos.id && styles.positionButtonTextActive,
                        ]}
                      >
                        {pos.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Preview */}
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <Text style={styles.previewTime}>12:34:56</Text>
                </View>
              </View>
            )}
          </View>

          {/* Date Effect */}
          <View style={styles.effectSection}>
            <View style={styles.effectHeader}>
              <MaterialIcons name="event" size={24} color="#10B981" />
              <Text style={styles.effectTitle}>Date</Text>
              <Switch
                value={dateEnabled}
                onValueChange={setDateEnabled}
                trackColor={{ false: '#333', true: '#10B981' }}
                thumbColor={dateEnabled ? '#10B981' : '#999'}
              />
            </View>

            {dateEnabled && (
              <View style={styles.effectContent}>
                {/* Date Format */}
                <Text style={styles.label}>Date Format</Text>
                <View style={styles.optionRow}>
                  {['full', 'short', 'numeric'].map((fmt) => (
                    <TouchableOpacity
                      key={fmt}
                      onPress={() => setDateFormat(fmt)}
                      style={[
                        styles.optionButton,
                        dateFormat === fmt && styles.optionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionButtonText,
                          dateFormat === fmt && styles.optionButtonTextActive,
                        ]}
                      >
                        {fmt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Position */}
                <Text style={styles.label}>Position</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {positions.map((pos) => (
                    <TouchableOpacity
                      key={pos.id}
                      onPress={() => setDatePosition(pos.id)}
                      style={[
                        styles.positionButton,
                        datePosition === pos.id && styles.positionButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.positionButtonText,
                          datePosition === pos.id && styles.positionButtonTextActive,
                        ]}
                      >
                        {pos.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Preview */}
                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <Text style={styles.previewDate}>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            onPress={handleApplyEffects}
            style={styles.applyButton}
          >
            <MaterialIcons name="check" size={20} color="#fff" />
            <Text style={styles.applyButtonText}>Apply Effects</Text>
          </TouchableOpacity>
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
  effectSection: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  effectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  effectTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  effectContent: {
    padding: 12,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#2a2a2a',
  },
  optionButtonActive: {
    borderColor: '#FF6B35',
    backgroundColor: 'rgba(255, 107, 53, 0.2)',
  },
  optionButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  optionButtonTextActive: {
    color: '#FF6B35',
  },
  positionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    marginRight: 8,
    backgroundColor: '#2a2a2a',
  },
  positionButtonActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  positionButtonText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
  },
  positionButtonTextActive: {
    color: '#3B82F6',
  },
  previewBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  previewLabel: {
    color: '#666',
    fontSize: 11,
    marginBottom: 8,
  },
  previewTime: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  previewDate: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export { ClockEffect, DateEffect };
export default OverlayEffectManager;
