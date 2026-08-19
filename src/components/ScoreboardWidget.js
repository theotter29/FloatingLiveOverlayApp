import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

/**
 * ScoreboardWidget Component
 * Display scoreboard untuk games, sports, atau competitions
 */
export const ScoreboardWidget = ({
  visible,
  onClose,
  position = { top: 60, right: 20 },
  team1Name = 'Team 1',
  team1Score = 0,
  team2Name = 'Team 2',
  team2Score = 0,
  onScoreUpdate,
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.scoreboardContainer, position]}>
      <View style={styles.scoreboard}>
        {/* Team 1 */}
        <View style={styles.teamSection}>
          <Text style={styles.teamName} numberOfLines={1}>
            {team1Name}
          </Text>
          <Text style={styles.score}>{team1Score}</Text>
        </View>

        {/* VS Separator */}
        <View style={styles.separator}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Team 2 */}
        <View style={styles.teamSection}>
          <Text style={styles.teamName} numberOfLines={1}>
            {team2Name}
          </Text>
          <Text style={styles.score}>{team2Score}</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * ScoreboardManager Component
 * Manage scoreboard settings dan scores
 */
export const ScoreboardManager = ({ visible, onClose, onApplyScoreboard }) => {
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [team2Score, setTeam2Score] = useState(0);
  const [position, setPosition] = useState('topRight');
  const [theme, setTheme] = useState('dark');

  const positions = [
    { id: 'topLeft', name: '⬉ Top Left' },
    { id: 'topRight', name: '⬈ Top Right' },
    { id: 'bottomLeft', name: '⬇ Bottom Left' },
    { id: 'bottomRight', name: '⬋ Bottom Right' },
  ];

  const themes = [
    { id: 'dark', name: 'Dark', colors: { bg: '#1a1a1a', text: '#fff' } },
    { id: 'light', name: 'Light', colors: { bg: '#fff', text: '#000' } },
    { id: 'orange', name: 'Orange', colors: { bg: '#FF6B35', text: '#fff' } },
    { id: 'blue', name: 'Blue', colors: { bg: '#3B82F6', text: '#fff' } },
  ];

  const handleAddScore = (team) => {
    if (team === 1) {
      setTeam1Score(team1Score + 1);
    } else {
      setTeam2Score(team2Score + 1);
    }
  };

  const handleRemoveScore = (team) => {
    if (team === 1 && team1Score > 0) {
      setTeam1Score(team1Score - 1);
    } else if (team === 2 && team2Score > 0) {
      setTeam2Score(team2Score - 1);
    }
  };

  const handleReset = () => {
    setTeam1Score(0);
    setTeam2Score(0);
  };

  const handleApply = () => {
    const settings = {
      team1: { name: team1Name, score: team1Score },
      team2: { name: team2Name, score: team2Score },
      position,
      theme,
    };

    if (onApplyScoreboard) {
      onApplyScoreboard(settings);
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
          <Text style={styles.title}>Scoreboard Manager</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionTitle}>Preview</Text>
            <View style={styles.previewBox}>
              <ScoreboardWidget
                visible={true}
                team1Name={team1Name}
                team1Score={team1Score}
                team2Name={team2Name}
                team2Score={team2Score}
                position={{ top: 0, right: 0 }}
              />
            </View>
          </View>

          {/* Team 1 Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team 1</Text>

            {/* Team Name */}
            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              placeholderTextColor="#666"
              value={team1Name}
              onChangeText={setTeam1Name}
              maxLength={15}
            />

            {/* Score Controls */}
            <Text style={styles.label}>Score</Text>
            <View style={styles.scoreControlsContainer}>
              <TouchableOpacity
                onPress={() => handleRemoveScore(1)}
                style={styles.scoreButton}
              >
                <MaterialIcons name="remove" size={24} color="#FF6B35" />
              </TouchableOpacity>

              <Text style={styles.scoreDisplay}>{team1Score}</Text>

              <TouchableOpacity
                onPress={() => handleAddScore(1)}
                style={styles.scoreButton}
              >
                <MaterialIcons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Team 2 Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team 2</Text>

            {/* Team Name */}
            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter team name"
              placeholderTextColor="#666"
              value={team2Name}
              onChangeText={setTeam2Name}
              maxLength={15}
            />

            {/* Score Controls */}
            <Text style={styles.label}>Score</Text>
            <View style={styles.scoreControlsContainer}>
              <TouchableOpacity
                onPress={() => handleRemoveScore(2)}
                style={styles.scoreButton}
              >
                <MaterialIcons name="remove" size={24} color="#FF6B35" />
              </TouchableOpacity>

              <Text style={styles.scoreDisplay}>{team2Score}</Text>

              <TouchableOpacity
                onPress={() => handleAddScore(2)}
                style={styles.scoreButton}
              >
                <MaterialIcons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Position Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Position</Text>
            <View style={styles.optionsContainer}>
              {positions.map((pos) => (
                <TouchableOpacity
                  key={pos.id}
                  onPress={() => setPosition(pos.id)}
                  style={[
                    styles.optionButton,
                    position === pos.id && styles.optionButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      position === pos.id && styles.optionButtonTextActive,
                    ]}
                  >
                    {pos.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Theme</Text>
            <View style={styles.optionsContainer}>
              {themes.map((thm) => (
                <TouchableOpacity
                  key={thm.id}
                  onPress={() => setTheme(thm.id)}
                  style={[
                    styles.themeButton,
                    { backgroundColor: thm.colors.bg },
                    theme === thm.id && styles.themeButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.themeButtonText,
                      { color: thm.colors.text },
                      theme === thm.id && styles.themeButtonTextActive,
                    ]}
                  >
                    {thm.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleReset}
              style={[styles.button, styles.resetButton]}
            >
              <MaterialIcons name="refresh" size={20} color="#FF6B35" />
              <Text style={styles.resetButtonText}>Reset Scores</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              style={[styles.button, styles.applyButton]}
            >
              <MaterialIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.applyButtonText}>Apply</Text>
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
  previewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewBox: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scoreboardContainer: {
    position: 'absolute',
  },
  scoreboard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 2,
    borderColor: '#FF6B35',
    minWidth: 200,
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  teamName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  score: {
    color: '#FF6B35',
    fontSize: 32,
    fontWeight: 'bold',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  vsText: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  scoreControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  scoreButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  scoreDisplay: {
    color: '#FF6B35',
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
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
  themeButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  themeButtonActive: {
    borderColor: '#fff',
  },
  themeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  themeButtonTextActive: {
    fontWeight: 'bold',
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

export default ScoreboardManager;
