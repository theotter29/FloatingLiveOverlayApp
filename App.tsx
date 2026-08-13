import React, {useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FloatingLiveOverlay from './src/FloatingLiveOverlay';

function App(): React.JSX.Element {
  const [isLive, setIsLive] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <Text style={styles.title}>Floating Live Overlay</Text>
        <TouchableOpacity
          style={[styles.button, isLive && styles.buttonActive]}
          onPress={() => setIsLive(!isLive)}>
          <Text style={styles.buttonText}>
            {isLive ? 'Stop Live' : 'Start Live'}
          </Text>
        </TouchableOpacity>
      </View>
      {isLive && <FloatingLiveOverlay />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonActive: {
    backgroundColor: '#c0392b',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default App;
