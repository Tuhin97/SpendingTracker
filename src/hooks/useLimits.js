/**
 * useLimits.js
 *
 * Custom React hook that manages the user's weekly spend limit and savings goal.
 * Both values are persisted to AsyncStorage so they survive app restarts.
 *
 * Exposed API:
 *   limit            - the weekly spend limit in AUD (null if not set yet)
 *   savingsGoal      - the weekly savings goal in AUD (null if not set yet)
 *   setLimit()       - update the spend limit in state and storage
 *   setSavingsGoal() - update the savings goal in state and storage
 *   loadLimits()     - re-read both values from storage (called on tab focus)
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@spend_limit';
const SAVINGS_KEY = '@savings_goal';

export function useLimits() {
  const [limit, setLimitState] = useState(null);
  const [savingsGoal, setSavingsGoalState] = useState(null);

  // Load saved values when the hook first mounts
  useEffect(() => {
    loadLimits();
  }, []);

  /**
   * loadLimits
   *
   * Reads the spend limit and savings goal from AsyncStorage and updates state.
   * Exposed so screens can call it via useFocusEffect — without this, the
   * Dashboard would show stale values after the user saves new limits in
   * the Set Limit tab.
   */
  async function loadLimits() {
    const val = await AsyncStorage.getItem(STORAGE_KEY);
    if (val) setLimitState(parseFloat(val));
    const sval = await AsyncStorage.getItem(SAVINGS_KEY);
    if (sval) setSavingsGoalState(parseFloat(sval));
  }

  // Updates the spend limit in both React state and AsyncStorage
  async function setLimit(value) {
    setLimitState(value);
    await AsyncStorage.setItem(STORAGE_KEY, String(value));
  }

  // Updates the savings goal in both React state and AsyncStorage
  async function setSavingsGoal(value) {
    setSavingsGoalState(value);
    await AsyncStorage.setItem(SAVINGS_KEY, String(value));
  }

  return { limit, setLimit, savingsGoal, setSavingsGoal, loadLimits };
}
