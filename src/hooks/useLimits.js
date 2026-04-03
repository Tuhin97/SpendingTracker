import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@spend_limit';
const SAVINGS_KEY = '@savings_goal';

export function useLimits() {
  const [limit, setLimitState] = useState(null);
  const [savingsGoal, setSavingsGoalState] = useState(null);

    useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setLimitState(parseFloat(val));
    });
    AsyncStorage.getItem(SAVINGS_KEY).then((val) => {
      if (val) setSavingsGoalState(parseFloat(val));
    });
  }, []);

  async function setLimit(value) {
    setLimitState(value);
    await AsyncStorage.setItem(STORAGE_KEY, String(value));
  }

  async function setSavingsGoal(value) {
    setSavingsGoalState(value);
    await AsyncStorage.setItem(SAVINGS_KEY, String(value));
  }


  return { limit, setLimit, savingsGoal, setSavingsGoal };

}
