/**
 * SettingsScreen.js
 *
 * Provides app management tools:
 *
 *   Archive This Week  - saves current week's transactions as a JSON file
 *                        on the device, then resets the tracker for next week
 *   Clear All Data     - permanently deletes all transactions (with confirmation)
 *
 *   Test Mode          - simulates CommBank notifications without needing real
 *                        purchases. Calls handleNotification() directly so the
 *                        exact same parsing and storage logic runs as with real
 *                        notifications. Useful for verifying the app works.
 *
 *   Archived Weeks     - lists all week_YYYY-MM-DD.json files saved on device
 */

import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import { useTransactions } from '../hooks/useTransactions';
import { handleNotification } from '../utils/backgroundTask';


export default function SettingsScreen() {
  const { clearTransactions, archiveAndReset } = useTransactions();
  const [archivedFiles, setArchivedFiles] = useState([]);

  // Load the list of archived week files when the screen first mounts
  useEffect(() => {
    loadArchivedFiles();
  }, []);

  // Reads the app's document directory and filters for week_*.json files.
  // Files are sorted in reverse so the most recent week appears at the top.
  async function loadArchivedFiles() {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const weekFiles = files.filter(f => f.startsWith('week_') && f.endsWith('.json'));
    setArchivedFiles(weekFiles.sort().reverse());
  }

  // Shows a confirmation dialog before archiving to prevent accidental resets
  function handleArchive() {
    Alert.alert(
      'Archive This Week',
      'This will save this week\'s data and reset the tracker. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', onPress: async () => {
          await archiveAndReset();
          // Refresh the archived files list so the new file shows immediately
          await loadArchivedFiles();
        }},
      ]
    );
  }

  // Shows a destructive confirmation before wiping all data
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

  // --- Test Mode functions ---
  // These simulate real CommBank notification text being received.
  // time: Date.now() + 1/2 ensures each test transaction gets a unique ID
  // (since the ID is the notification timestamp).

  async function testDebit() {
    try {
      await handleNotification({
        text: '$45.00 spent at COLES SUPERMARKETS.',
        time: Date.now(),
      });
      Alert.alert('Test Complete', 'A $45.00 debit from COLES has been added. Check History tab!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function testCredit() {
    try {
      await handleNotification({
        // Simulates a Woolworths pay deposit notification
        text: 'You\'ve been paid $1000.00 into your account ending 6373.',
        time: Date.now() + 1, // +1ms offset so it gets a unique ID from testDebit
      });
      Alert.alert('Test Complete', 'A $1000.00 credit has been added. Check History tab!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function testLimitWarning() {
    try {
      await handleNotification({
        text: '$750.00 spent at AMAZON AU.',
        time: Date.now() + 2, // +2ms offset for a unique ID
      });
      Alert.alert('Test Complete', 'A $750.00 debit added. Check Dashboard to see limit warning!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  async function checkListenerStatus() {
  try {
    let NotificationListener = null;
    try {
      NotificationListener = require('react-native-notification-listener').default;
    } catch (e) {
      Alert.alert('Listener Status', 'NotificationListener module failed to load: ' + e.message);
      return;
    }
    const status = await NotificationListener.getPermissionStatus();
    Alert.alert(
      'Listener Status',
      `Permission: ${status}\n\n${status === 'authorized'
        ? '✅ Listener has permission. Make sure the app is not being killed by battery optimisation.'
        : '❌ Permission not granted. Go to Settings → Special App Access → Notification Access → SpendingTracker → Allow'
      }`
    );
  } catch (e) {
    Alert.alert('Error', e.message);
  }
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

      <Text style={styles.sectionTitle}>Test Mode</Text>

      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testDebit}>
        <Text style={styles.buttonText}>🛒 Test Debit ($45 COLES)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testCredit}>
        <Text style={styles.buttonText}>💰 Test Credit ($1000 Pay)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testLimitWarning}>
        <Text style={styles.buttonText}>⚠️ Test Limit Warning ($750)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.debugButton]} onPress={checkListenerStatus}>
        <Text style={styles.buttonText}>🔍 Check Listener Status</Text>
      </TouchableOpacity>


      {/* List of archived week files stored on this device */}
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
  testButton: {
    backgroundColor: '#0288d1',
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

  debugButton: {
  backgroundColor: '#37474f',
},
});
