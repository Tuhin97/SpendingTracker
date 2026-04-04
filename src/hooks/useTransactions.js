/**
 * useTransactions.js
 *
 * Custom React hook that manages all transaction state for the app.
 * Transactions are persisted to AsyncStorage so they survive app restarts.
 *
 * Exposed API:
 *   transactions      - array of all saved transaction objects
 *   load()            - re-reads transactions from storage (called on tab focus)
 *   addTransaction()  - manually add a transaction (used in testing)
 *   clearTransactions() - wipe all transactions from storage
 *   getWeeklyTotal()  - sum of debits since last Tuesday (pay day)
 *   getWeeklyCredits() - sum of credits since last Tuesday
 *   archiveAndReset() - export this week's data to a JSON file, then clear
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = '@transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);

  // Load transactions from storage when the hook first mounts
  useEffect(() => {
    load();
  }, []);

  // Reads the latest transactions from AsyncStorage and updates state.
  // Called on mount and every time a tab gains focus (via useFocusEffect in screens).
  async function load() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setTransactions(JSON.parse(raw));
  }

  // Prepends a new transaction to the list and persists it.
  // Used by the Settings test buttons to simulate real transactions.
  async function addTransaction(txn) {
    const updated = [txn, ...transactions];
    setTransactions(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  // Wipes all transactions from both state and storage.
  // Triggered by "Clear All Data" in Settings (with confirmation dialog).
  async function clearTransactions() {
    setTransactions([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  /**
   * getLastTuesday
   *
   * Returns midnight on the most recent Tuesday, which is the start of the
   * current pay cycle (the user gets paid every Tuesday at Woolworths).
   *
   * How the maths works:
   *   JavaScript getDay() returns: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
   *   If today IS Tuesday (day === 2), diff = 0, so lastTuesday = today.
   *   Otherwise: (day + 5) % 7 gives how many days ago the last Tuesday was.
   *     e.g. Wednesday (3): (3+5)%7 = 1 → 1 day ago = Tuesday ✓
   *     e.g. Monday   (1): (1+5)%7 = 6 → 6 days ago = Tuesday ✓
   *     e.g. Sunday   (0): (0+5)%7 = 5 → 5 days ago = Tuesday ✓
   */
  function getLastTuesday() {
    const today = new Date();
    const day = today.getDay();
    const diff = (day === 2) ? 0 : (day + 5) % 7;
    const lastTuesday = new Date(today);
    lastTuesday.setDate(today.getDate() - diff);
    lastTuesday.setHours(0, 0, 0, 0); // Start of day (midnight)
    return lastTuesday;
  }

  // Returns the total amount spent (debits only) since the last Tuesday
  function getWeeklyTotal() {
    const lastTuesday = getLastTuesday();
    return transactions
      .filter(txn => txn.type === 'debit')
      .filter(txn => new Date(txn.date) >= lastTuesday)
      .reduce((total, txn) => total + txn.amount, 0);
  }

  // Returns the total amount earned (credits only) since the last Tuesday
  function getWeeklyCredits() {
    const lastTuesday = getLastTuesday();
    return transactions
      .filter(txn => txn.type === 'credit')
      .filter(txn => new Date(txn.date) >= lastTuesday)
      .reduce((total, txn) => total + txn.amount, 0);
  }

  /**
   * archiveAndReset
   *
   * At the end of each pay week:
   * 1. Collects all transactions since last Tuesday into a summary object
   * 2. Writes it as a JSON file to the device's local document directory
   *    (filename: week_YYYY-MM-DD.json)
   * 3. Sends a local push notification to tell the user it's ready
   * 4. Clears all transactions to start fresh for the new week
   *
   * Files are stored on-device for now; future plan is to upload to cloud.
   */
  async function archiveAndReset() {
    const lastTuesday = getLastTuesday();
    // Use the date as a label, e.g. "2025-04-01"
    const weekLabel = lastTuesday.toISOString().split('T')[0];

    const weekData = {
      weekStarting: weekLabel,
      totalSpent: getWeeklyTotal(),
      totalEarned: getWeeklyCredits(),
      // Only archive transactions from this pay week
      transactions: transactions.filter(
        txn => new Date(txn.date) >= lastTuesday
      ),
    };

    // Write the JSON file to the app's private document directory
    const path = FileSystem.documentDirectory + `week_${weekLabel}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(weekData, null, 2));

    // Fire an immediate local notification (trigger: null = send right now)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Summary Ready!',
        body: `Your data for week of ${weekLabel} is saved and ready to upload.`,
      },
      trigger: null,
    });

    // Reset tracker for the new week
    await clearTransactions();
  }

  return { transactions, load, addTransaction, clearTransactions, getWeeklyTotal, getWeeklyCredits, archiveAndReset };
}
