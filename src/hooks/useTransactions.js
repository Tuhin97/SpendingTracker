import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';

const STORAGE_KEY = '@transactions';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setTransactions(JSON.parse(raw));
  }

  async function addTransaction(txn) {
    const updated = [txn, ...transactions];
    setTransactions(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  async function clearTransactions() {
    setTransactions([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  function getLastTuesday() {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 2) ? 0 : (day + 5) % 7;
  const lastTuesday = new Date(today);
  lastTuesday.setDate(today.getDate() - diff);
  lastTuesday.setHours(0, 0, 0, 0);
  return lastTuesday;
}

  function getWeeklyTotal() {
    const lastTuesday = getLastTuesday();
    return transactions
      .filter(txn => txn.type === 'debit')
      .filter(txn => new Date(txn.date) >= lastTuesday)
      .reduce((total, txn) => total + txn.amount, 0);
  }

    async function archiveAndReset() {
    const lastTuesday = getLastTuesday();
    const weekLabel = lastTuesday.toISOString().split('T')[0];
    
    const weekData = {
      weekStarting: weekLabel,
      totalSpent: getWeeklyTotal(),
      totalEarned: getWeeklyCredits(),
      transactions: transactions.filter(
        txn => new Date(txn.date) >= lastTuesday
      ),
    };

    const path = FileSystem.documentDirectory + `week_${weekLabel}.json`;
    await FileSystem.writeAsStringAsync(path, JSON.stringify(weekData, null, 2));

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Summary Ready!',
        body: `Your data for week of ${weekLabel} is saved and ready to upload.`,
      },
      trigger: null,
    });

    await clearTransactions();
  }

  return { transactions, addTransaction, clearTransactions, getWeeklyTotal, getWeeklyCredits, archiveAndReset };

}
