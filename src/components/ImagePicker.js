import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import * as ImagePickerLib from 'expo-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

/**
 * ImagePicker Component
 * Upload gambar dari galeri atau kamera untuk ditampilkan di overlay
 */
export const ImagePicker = ({ 
  visible, 
  onClose, 
  onImageSelected,
  title = 'Select Image'
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imageHistory, setImageHistory] = useState([]); // Track uploaded images

  // Request camera roll permissions
  const requestPermissions = async () => {
    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  // Request camera permissions
  const requestCameraPermissions = async () => {
    const { status } = await ImagePickerLib.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  // Pick image from gallery
  const pickImageFromGallery = async () => {
    try {
      const hasPermission = await requestPermissions();
      
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera roll permission is required');
        return;
      }

      setIsLoading(true);
      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.cancelled) {
        handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
      console.error('Gallery error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Take photo with camera
  const takePhotoWithCamera = async () => {
    try {
      const hasPermission = await requestCameraPermissions();
      
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required');
        return;
      }

      setIsLoading(true);
      const result = await ImagePickerLib.launchCameraAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.cancelled) {
        handleImageSelected(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
      console.error('Camera error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image selected
  const handleImageSelected = (image) => {
    setSelectedImage(image);
    
    // Get image dimensions
    Image.getSize(
      image.uri,
      (width, height) => {
        setImageSize({ width, height });
      },
      (error) => {
        console.error('Failed to get image size:', error);
      }
    );

    // Add to history
    const newHistory = [image, ...imageHistory].slice(0, 5); // Keep last 5
    setImageHistory(newHistory);

    // Callback to parent
    if (onImageSelected) {
      onImageSelected(image);
    }
  };

  // Upload image (mock - can be replaced with actual upload)
  const handleUploadImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || `image_${Date.now()}.jpg`,
      });

      // Send to server (replace with your actual endpoint)
      // const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
      //   method: 'POST',
      //   body: formData,
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
      
      // For now, just show success message
      Alert.alert('Success', 'Image uploaded successfully!');
      
      // Close modal after upload
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      Alert.alert('Upload Error', error.message);
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete image from history
  const deleteFromHistory = (index) => {
    const updated = imageHistory.filter((_, i) => i !== index);
    setImageHistory(updated);
  };

  // Clear all
  const clearAll = () => {
    setSelectedImage(null);
    setImageHistory([]);
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

        <ScrollView style={styles.content}>
          {/* Selected Image Preview */}
          {selectedImage && (
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
              />
              <Text style={styles.imageSizeText}>
                Size: {Math.round(imageSize.width)} x {Math.round(imageSize.height)}px
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Upload Image From</Text>
            
            {/* Gallery Button */}
            <TouchableOpacity
              onPress={pickImageFromGallery}
              style={[styles.actionButton, styles.galleryButton]}
              disabled={isLoading}
            >
              <MaterialIcons name="image" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Gallery</Text>
            </TouchableOpacity>

            {/* Camera Button */}
            <TouchableOpacity
              onPress={takePhotoWithCamera}
              style={[styles.actionButton, styles.cameraButton]}
              disabled={isLoading}
            >
              <MaterialIcons name="camera-alt" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Image History */}
          {imageHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {imageHistory.map((image, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleImageSelected(image)}
                    style={styles.historyItem}
                  >
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.historyImage}
                    />
                    <TouchableOpacity
                      onPress={() => deleteFromHistory(index)}
                      style={styles.deleteHistoryBtn}
                    >
                      <MaterialIcons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Upload Button */}
          {selectedImage && (
            <View style={styles.uploadSection}>
              {isLoading && (
                <ActivityIndicator size="large" color="#FF6B35" />
              )}
              <TouchableOpacity
                onPress={handleUploadImage}
                disabled={isLoading}
                style={[
                  styles.uploadButton,
                  isLoading && styles.uploadButtonDisabled,
                ]}
              >
                <FontAwesome name="upload" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>
                  {isLoading ? 'Uploading...' : 'Upload Image'}
                </Text>
              </TouchableOpacity>

              {/* Clear Button */}
              <TouchableOpacity
                onPress={clearAll}
                style={styles.clearButton}
              >
                <MaterialIcons name="delete" size={20} color="#FF6B35" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
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
  previewSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewImage: {
    width: width - 32,
    height: 300,
    borderRadius: 12,
    marginBottom: 8,
  },
  imageSizeText: {
    color: '#999',
    fontSize: 12,
  },
  actionSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  galleryButton: {
    backgroundColor: '#8B5CF6',
  },
  cameraButton: {
    backgroundColor: '#3B82F6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    marginRight: 12,
    position: 'relative',
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deleteHistoryBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 4,
  },
  uploadSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  clearButton: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ImagePicker;
