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
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useTransactions } from '../hooks/useTransactions';
import { handleNotification } from '../utils/backgroundTask';

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
        text: 'You\'ve been paid $1000.00 into your account ending 6373.',
        time: Date.now() + 1,
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
        time: Date.now() + 2,
      });
      Alert.alert('Test Complete', 'A $750.00 debit added. Check Dashboard to see limit warning!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Manage your data and test the app</Text>
      </View>

      {/* Data management */}
      <Text style={styles.sectionTitle}>Data Management</Text>

      <TouchableOpacity style={styles.actionCard} onPress={handleArchive}>
        <View style={[styles.iconBox, { backgroundColor: '#ede7f6' }]}>
          <Ionicons name="archive-outline" size={22} color="#6200ee" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>Archive This Week</Text>
          <Text style={styles.actionDesc}>Save this week's data and reset for next week</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={handleClearAll}>
        <View style={[styles.iconBox, { backgroundColor: '#ffebee' }]}>
          <Ionicons name="trash-outline" size={22} color="#e53935" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={[styles.actionTitle, { color: '#e53935' }]}>Clear All Data</Text>
          <Text style={styles.actionDesc}>Permanently delete all transactions</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
      </TouchableOpacity>

      {/* Test mode */}
      {/*<Text style={styles.sectionTitle}>Test Mode</Text>

      <TouchableOpacity style={styles.actionCard} onPress={testDebit}>
        <View style={[styles.iconBox, { backgroundColor: '#ffebee' }]}>
          <Ionicons name="cart-outline" size={22} color="#e53935" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>Test Debit</Text>
          <Text style={styles.actionDesc}>Add a $45.00 debit from COLES</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={testCredit}>
        <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
          <Ionicons name="cash-outline" size={22} color="#43a047" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>Test Credit</Text>
          <Text style={styles.actionDesc}>Add a $1000.00 pay credit</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={testLimitWarning}>
        <View style={[styles.iconBox, { backgroundColor: '#fff3e0' }]}>
          <Ionicons name="warning-outline" size={22} color="#fb8c00" />
        </View>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>Test Limit Warning</Text>
          <Text style={styles.actionDesc}>Add a $750.00 debit to trigger alerts</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#bdbdbd" />
      </TouchableOpacity>*/}

      {/* Archived weeks */}
      <Text style={styles.sectionTitle}>Archived Weeks</Text>

      {archivedFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={40} color="#e0e0e0" />
          <Text style={styles.empty}>No archived weeks yet</Text>
        </View>
      ) : (
        archivedFiles.map(file => (
          <View key={file} style={styles.actionCard}>
            <View style={[styles.iconBox, { backgroundColor: '#e8f5e9' }]}>
              <Ionicons name="document-text-outline" size={22} color="#43a047" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>{file.replace('week_', '').replace('.json', '')}</Text>
              <Text style={styles.actionDesc}>Archived week</Text>
            </View>
          </View>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f7',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 13,
    color: '#ce93d8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#9e9e9e',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    elevation: 2,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  empty: {
    color: '#9e9e9e',
    fontSize: 14,
  },
});
