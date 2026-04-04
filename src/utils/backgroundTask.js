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
}
