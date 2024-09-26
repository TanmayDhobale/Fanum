import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{ false: "#767577", true: "#4CAF50" }}
          thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={setIsNotificationsEnabled}
          trackColor={{ false: "#767577", true: "#4CAF50" }}
          thumbColor={isNotificationsEnabled ? "#f4f3f4" : "#f4f3f4"}
        />
      </View>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingText: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});