/**
 * backgroundTask.js
 *
 * Manages the CommBank notification listener lifecycle and processes
 * incoming notifications into saved transactions.
 *
 * Why require() instead of import?
 * react-native-notification-listener is a native Android module. If the
 * device doesn't support it (e.g. iOS simulator or Expo Go), a top-level
 * import would crash the entire app. Using require() inside a try/catch
 * means handleNotification() still works (e.g. for test buttons) even if
 * the listener itself fails to load.
 */

import { parseNotification } from './notificationParser';
import { sendThresholdAlert } from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Safely load the native notification listener module
let NotificationListener = null;
try {
  NotificationListener = require('react-native-notification-listener').default;
} catch (e) {
  console.log('NotificationListener not available:', e.message);
}

/**
 * startNotificationListener
 *
 * Requests notification access permission (opens Android settings if not granted),
 * then starts listening to all device notifications. Only forwards notifications
 * from the CommBank app to the onNotification callback.
 */
export async function startNotificationListener(onNotification) {
  if (!NotificationListener) return;

  const status = await NotificationListener.getPermissionStatus();

  // If the user hasn't granted notification access, send them to settings to enable it
  if (status !== 'authorized') {
    await NotificationListener.requestPermission();
  }

  NotificationListener.startListening(notification => {
    // Filter: only process CommBank notifications (by app name or text content)
    if (notification.app?.toLowerCase().includes('commbank') ||
        notification.title?.toLowerCase().includes('commbank') ||
        notification.text?.toLowerCase().includes('commbank')) {
      onNotification(notification);
    }
  });
}

/**
 * stopNotificationListener
 *
 * Cleans up the listener when the app is unmounted (called in App.js useEffect cleanup).
 */
export function stopNotificationListener() {
  if (!NotificationListener) return;
  NotificationListener.stopListening();
}

/**
 * getLastTuesday
 *
 * Returns midnight on the most recent Tuesday (start of pay cycle).
 * Duplicated here from useTransactions.js so backgroundTask.js can
 * calculate the weekly total independently without importing a React hook.
 */
function getLastTuesday() {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 2) ? 0 : (day + 5) % 7;
  const lastTuesday = new Date(today);
  lastTuesday.setDate(today.getDate() - diff);
  lastTuesday.setHours(0, 0, 0, 0);
  return lastTuesday;
}

/**
 * checkAndNotifyThresholds
 *
 * Called immediately after a new debit transaction is saved.
 * Calculates the current weekly spend percentage and fires a push
 * notification the first time each threshold (50, 75, 90, 100%) is crossed.
 *
 * Thresholds already notified are stored in AsyncStorage under
 * '@notified_thresholds' as { weekStart: 'YYYY-MM-DD', thresholds: [50, 75] }.
 * The weekStart key ensures thresholds reset automatically each Tuesday.
 */
async function checkAndNotifyThresholds() {
  // Load the user's spend limit — if not set, nothing to check
  const limitRaw = await AsyncStorage.getItem('@spend_limit');
  if (!limitRaw) return;
  const limit = parseFloat(limitRaw);

  // Load all transactions and calculate this week's total spending
  const raw = await AsyncStorage.getItem('@transactions');
  const transactions = raw ? JSON.parse(raw) : [];
  const lastTuesday = getLastTuesday();

  const weeklySpent = transactions
    .filter(txn => txn.type === 'debit')
    .filter(txn => new Date(txn.date) >= lastTuesday)
    .reduce((total, txn) => total + txn.amount, 0);

  const progress = (weeklySpent / limit) * 100;

  // Load which thresholds have already been notified this week
  const weekKey = lastTuesday.toISOString().split('T')[0];
  const notifiedRaw = await AsyncStorage.getItem('@notified_thresholds');
  let notified = notifiedRaw ? JSON.parse(notifiedRaw) : { weekStart: weekKey, thresholds: [] };

  // If it's a new week (past Tuesday), reset all threshold flags
  if (notified.weekStart !== weekKey) {
    notified = { weekStart: weekKey, thresholds: [] };
  }

  // Check each threshold in order — fire an alert for any newly crossed one
  const thresholds = [50, 75, 90, 100];
  let anyNewAlert = false;

  for (const threshold of thresholds) {
    if (progress >= threshold && !notified.thresholds.includes(threshold)) {
      await sendThresholdAlert(threshold, weeklySpent, limit);
      notified.thresholds.push(threshold);
      anyNewAlert = true;
    }
  }

  // Save updated threshold state back to storage
  if (anyNewAlert) {
    await AsyncStorage.setItem('@notified_thresholds', JSON.stringify(notified));
  }
}

/**
 * handleNotification
 *
 * Parses an incoming notification and saves it to AsyncStorage if it's valid
 * and hasn't been seen before. This function is intentionally decoupled from
 * NotificationListener so the Settings test buttons can call it directly.
 */
export async function handleNotification(notification) {
  // Parse the raw notification text into a structured transaction object
  const parsed = parseNotification({
    text: notification.text ?? '',
    time: notification.time ?? Date.now(),
  });

  // If the parser didn't recognise this as a valid transaction, do nothing
  if (!parsed.valid) return;

  // Load existing transactions from storage
  const raw = await AsyncStorage.getItem('@transactions');
  const transactions = raw ? JSON.parse(raw) : [];

  // Deduplicate: the transaction ID is the notification timestamp,
  // so the same notification can never be added twice
  const alreadyExists = transactions.some(txn => txn.id === parsed.id);
  if (alreadyExists) return;

  // Prepend the new transaction so the newest always appears first
  const updated = [parsed, ...transactions];
  await AsyncStorage.setItem('@transactions', JSON.stringify(updated));

  // After saving, immediately check if any spending threshold has been crossed
  // and fire a push notification if so (only for debits — credits don't affect spending)
  if (parsed.type === 'debit') {
    await checkAndNotifyThresholds();
  }
}