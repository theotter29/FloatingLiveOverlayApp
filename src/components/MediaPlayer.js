import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Video } from 'expo-av';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

/**
 * MediaPlayer Component
 * Handles video and audio playback in overlay
 */
export const MediaPlayer = ({ 
  visible, 
  onClose, 
  mediaUrl, 
  mediaType = 'video', // 'video' | 'audio'
  title = 'Media Player'
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Handle play/pause toggle
  const handlePlayPause = async () => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    } else if (mediaType === 'audio' && audioRef.current) {
      if (isPlaying) {
        await audioRef.current.pauseAsync();
      } else {
        await audioRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value) => {
    setVolume(value);
    if (mediaType === 'video' && videoRef.current) {
      videoRef.current.setVolumeAsync(value);
    } else if (mediaType === 'audio' && audioRef.current) {
      audioRef.current.setVolumeAsync(value);
    }
  };

  // Toggle mute
  const handleMute = async () => {
    if (mediaType === 'video' && videoRef.current) {
      await videoRef.current.setVolumeAsync(isMuted ? volume : 0);
    } else if (mediaType === 'audio' && audioRef.current) {
      await audioRef.current.setVolumeAsync(isMuted ? volume : 0);
    }
    setIsMuted(!isMuted);
  };

  // Format time display (MM:SS)
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle load complete
  const handleLoadComplete = (status) => {
    if (status.durationMillis) {
      setDuration(status.durationMillis);
    }
  };

  // Handle playback status update
  const handlePlaybackStatus = (status) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis);
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
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
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Video Player */}
        {mediaType === 'video' && (
          <View style={styles.videoContainer}>
            {isLoading && (
              <ActivityIndicator
                size="large"
                color="#FF6B35"
                style={styles.loader}
              />
            )}
            <Video
              ref={videoRef}
              source={{ uri: mediaUrl }}
              rate={1.0}
              volume={isMuted ? 0 : volume}
              isMuted={isMuted}
              resizeMode="contain"
              shouldPlay={isPlaying}
              isLooping={false}
              style={styles.video}
              onLoadStart={() => setIsLoading(true)}
              onLoad={(status) => {
                handleLoadComplete(status);
                setIsLoading(false);
              }}
              onPlaybackStatusUpdate={handlePlaybackStatus}
              onError={(error) => {
                console.warn('Video Error:', error);
                setIsLoading(false);
              }}
            />
          </View>
        )}

        {/* Audio Player */}
        {mediaType === 'audio' && (
          <View style={styles.audioContainer}>
            <MaterialIcons name="audiotrack" size={80} color="#FF6B35" />
            <Text style={styles.audioTitle}>{title}</Text>
          </View>
        )}

        {/* Control Panel */}
        <View style={styles.controlPanel}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(currentTime / duration) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.buttonContainer}>
            {/* Play/Pause */}
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.controlButton}
            >
              <MaterialIcons
                name={isPlaying ? 'pause' : 'play-arrow'}
                size={32}
                color="#FF6B35"
              />
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              onPress={handleMute}
              style={styles.controlButton}
            >
              <MaterialIcons
                name={isMuted ? 'volume-off' : 'volume-up'}
                size={28}
                color="#FF6B35"
              />
            </TouchableOpacity>

            {/* Volume Slider (simplified - tap to toggle 0/1) */}
            <View style={styles.volumeIndicator}>
              <Text style={styles.volumeText}>
                {Math.round(isMuted ? 0 : volume * 100)}%
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={[styles.controlButton, styles.closeButton]}
            >
              <MaterialIcons name="stop" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-between',
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
  closeBtn: {
    padding: 8,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loader: {
    position: 'absolute',
  },
  audioContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  audioTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  controlPanel: {
    backgroundColor: '#000',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  progressContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
  },
  closeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
  },
  volumeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#333',
    borderRadius: 4,
  },
  volumeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MediaPlayer;
