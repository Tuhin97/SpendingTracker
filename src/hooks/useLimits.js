import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@spend_limit';

export function useLimits() {
  const [limit, setLimitState] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setLimitState(parseFloat(val));
    });
  }, []);

  async function setLimit(value) {
    setLimitState(value);
    await AsyncStorage.setItem(STORAGE_KEY, String(value));
  }

  return { limit, setLimit };
}
