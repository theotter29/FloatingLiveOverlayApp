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
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

/**
 * WebLinkHandler Component
 * Input URL dan buka website di browser
 */
export const WebLinkHandler = ({ 
  visible, 
  onClose,
  title = 'Open Website',
  onLinkOpened,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkHistory, setLinkHistory] = useState([]); // Store recent links
  const [savedLinks, setSavedLinks] = useState([]); // Store saved links

  // Add http:// if missing
  const formatUrl = (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  // Validate URL format
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Open link in browser
  const handleOpenLink = async () => {
    const url = urlInput.trim();
    
    if (!url) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    const formattedUrl = formatUrl(url);

    if (!isValidUrl(formattedUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid website URL');
      return;
    }

    try {
      setIsLoading(true);

      // Check if URL can be opened
      const canOpen = await Linking.canOpenURL(formattedUrl);
      
      if (!canOpen) {
        Alert.alert('Cannot Open', `Unable to open: ${formattedUrl}`);
        return;
      }

      // Open the URL
      await Linking.openURL(formattedUrl);

      // Add to history
      addToHistory(formattedUrl);
      
      // Clear input
      setUrlInput('');

      // Callback
      if (onLinkOpened) {
        onLinkOpened(formattedUrl);
      }

      // Show success message
      Alert.alert('Success', 'Opening website in browser...');
    } catch (error) {
      Alert.alert('Error', 'Failed to open link: ' + error.message);
      console.error('Link error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add URL to history
  const addToHistory = (url) => {
    const newHistory = [{ url, timestamp: Date.now() }, ...linkHistory];
    setLinkHistory(newHistory.slice(0, 10)); // Keep last 10
  };

  // Save link for later
  const handleSaveLink = () => {
    const url = urlInput.trim();
    
    if (!url) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    const formattedUrl = formatUrl(url);

    if (!isValidUrl(formattedUrl)) {
      Alert.alert('Invalid URL', 'Please enter a valid website URL');
      return;
    }

    // Check if already saved
    if (savedLinks.some(link => link.url === formattedUrl)) {
      Alert.alert('Duplicate', 'This link is already saved');
      return;
    }

    const newLink = {
      id: Date.now(),
      url: formattedUrl,
      title: urlInput,
      savedAt: new Date().toLocaleString(),
    };

    setSavedLinks([newLink, ...savedLinks]);
    setUrlInput('');
    Alert.alert('Saved', 'Link saved successfully!');
  };

  // Open saved link
  const openSavedLink = async (url) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        addToHistory(url);
        if (onLinkOpened) {
          onLinkOpened(url);
        }
      } else {
        Alert.alert('Error', 'Cannot open this link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
      console.error('Error:', error);
    }
  };

  // Remove from saved links
  const removeSavedLink = (id) => {
    setSavedLinks(savedLinks.filter(link => link.id !== id));
  };

  // Remove from history
  const removeFromHistory = (index) => {
    setLinkHistory(linkHistory.filter((_, i) => i !== index));
  };

  // Quick links (popular websites)
  const quickLinks = [
    { name: 'Google', url: 'https://google.com', icon: 'language' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'play-circle' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'share' },
    { name: 'GitHub', url: 'https://github.com', icon: 'code' },
    { name: 'Reddit', url: 'https://reddit.com', icon: 'people' },
    { name: 'Medium', url: 'https://medium.com', icon: 'subject' },
  ];

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
          {/* URL Input */}
          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Enter Website URL</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="language"
                size={20}
                color="#FF6B35"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.urlInput}
                placeholder="example.com or https://..."
                placeholderTextColor="#666"
                value={urlInput}
                onChangeText={setUrlInput}
                keyboardType="url"
                editable={!isLoading}
                returnKeyType="go"
                onSubmitEditing={handleOpenLink}
              />
              {urlInput.length > 0 && (
                <TouchableOpacity onPress={() => setUrlInput('')}>
                  <MaterialIcons name="close" size={20} color="#FF6B35" />
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                onPress={handleOpenLink}
                disabled={isLoading}
                style={[styles.actionBtn, styles.openBtn, isLoading && styles.disabled]}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="open-in-new" size={18} color="#fff" />
                    <Text style={styles.actionBtnText}>Open</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveLink}
                style={[styles.actionBtn, styles.saveBtn]}
              >
                <MaterialIcons name="bookmark" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinksSection}>
            <Text style={styles.sectionTitle}>Quick Links</Text>
            <View style={styles.quickLinksGrid}>
              {quickLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => openSavedLink(link.url)}
                  style={styles.quickLinkCard}
                >
                  <MaterialIcons name={link.icon} size={28} color="#FF6B35" />
                  <Text style={styles.quickLinkName}>{link.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Saved Links */}
          {savedLinks.length > 0 && (
            <View style={styles.savedLinksSection}>
              <Text style={styles.sectionTitle}>Saved Links</Text>
              {savedLinks.map((link) => (
                <View key={link.id} style={styles.savedLinkItem}>
                  <TouchableOpacity
                    onPress={() => openSavedLink(link.url)}
                    style={styles.savedLinkContent}
                  >
                    <MaterialIcons name="link" size={20} color="#3B82F6" />
                    <View style={styles.savedLinkText}>
                      <Text style={styles.savedLinkTitle}>{link.title}</Text>
                      <Text style={styles.savedLinkUrl}>{link.url}</Text>
                      <Text style={styles.savedLinkTime}>{link.savedAt}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeSavedLink(link.id)}
                    style={styles.deleteLinkBtn}
                  >
                    <MaterialIcons name="delete" size={20} color="#FF6B35" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Link History */}
          {linkHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Links</Text>
              {linkHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <TouchableOpacity
                    onPress={() => openSavedLink(item.url)}
                    style={styles.historyContent}
                  >
                    <MaterialIcons name="history" size={18} color="#8B5CF6" />
                    <Text style={styles.historyUrl} numberOfLines={1}>
                      {item.url}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeFromHistory(index)}
                    style={styles.deleteHistoryBtn}
                  >
                    <MaterialIcons name="close" size={18} color="#FF6B35" />
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
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
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
  inputIcon: {
    marginRight: 8,
  },
  urlInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openBtn: {
    backgroundColor: '#FF6B35',
  },
  saveBtn: {
    backgroundColor: '#3B82F6',
  },
  disabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  quickLinksSection: {
    marginBottom: 24,
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLinkCard: {
    width: (width - 48) / 3,
    backgroundColor: '#222',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  quickLinkName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  savedLinksSection: {
    marginBottom: 24,
  },
  savedLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  savedLinkContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  savedLinkText: {
    flex: 1,
    marginLeft: 12,
  },
  savedLinkTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  savedLinkUrl: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  savedLinkTime: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
  },
  deleteLinkBtn: {
    padding: 8,
  },
  historySection: {
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  historyContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyUrl: {
    color: '#999',
    fontSize: 12,
    marginLeft: 8,
  },
  deleteHistoryBtn: {
    padding: 8,
  },
});

export default WebLinkHandler;
