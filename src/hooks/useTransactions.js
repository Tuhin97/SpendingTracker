import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  return { transactions, addTransaction, clearTransactions };
}
