import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@spend_limit';
const SAVINGS_KEY = '@savings_goal';

export function useLimits() {
  const [limit, setLimitState] = useState(null);
  const [savingsGoal, setSavingsGoalState] = useState(null);

  useEffect(() => {
    loadLimits();
  }, []);

  async function loadLimits() {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val) setLimitState(parseFloat(val));
    const sval = await AsyncStorage.getItem(SAVINGS_KEY);
    if (sval) setSavingsGoalState(parseFloat(sval));
  }
  async function setLimit(value) {
    setLimitState(value);
    await AsyncStorage.setItem(STORAGE_KEY, String(value));
  }

  async function setSavingsGoal(value) {
    setSavingsGoalState(value);
    await AsyncStorage.setItem(SAVINGS_KEY, String(value));
  }


  return { limit, setLimit, savingsGoal, setSavingsGoal, loadLimits };

}
