import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { useTransactions } from '../hooks/useTransactions';

export default function SettingsScreen() {
  const { clearTransactions, archiveAndReset } = useTransactions();
  const [archivedFiles, setArchivedFiles] = useState([]);

  useEffect(() => {
    loadArchivedFiles();
  }, []);

  async function loadArchivedFiles() {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const weekFiles = files.filter(f => f.startsWith('week_') && f.endsWith('.json'));
    setArchivedFiles(weekFiles.sort().reverse());
  }
  function handleArchive() {
      Alert.alert(
        'Archive This Week',
        'This will save this week\'s data and reset the tracker. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Archive', onPress: async () => {
            await archiveAndReset();
            await loadArchivedFiles();
          }},
        ]
      );
  }

  function handleClearAll() {
      Alert.alert(
        'Clear All Data',
        'This will permanently delete all transactions. This cannot be undone!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: async () => {
            await clearTransactions();
          }},
        ]
      );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleArchive}>
        <Text style={styles.buttonText}>📦 Archive This Week</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearAll}>
        <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Archived Weeks</Text>

      {archivedFiles.length === 0
        ? <Text style={styles.empty}>No archived weeks yet</Text>
        : archivedFiles.map(file => (
          <View key={file} style={styles.fileRow}>
            <Text style={styles.fileName}>{file}</Text>
          </View>
        ))
      }

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 40,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  dangerButton: {
    backgroundColor: '#e53935',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
    marginBottom: 16,
  },
  fileRow: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
  },
  fileName: {
    fontSize: 14,
    color: '#212121',
  },
  empty: {
    color: '#9e9e9e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
});
