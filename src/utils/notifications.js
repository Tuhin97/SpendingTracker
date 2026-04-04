import * as Notifications from 'expo-notifications';

// Request permission for the app to send local push notifications.
// Must be called once at app startup before any notifications can be sent.
export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * sendThresholdAlert
 *
 * Sends an immediate push notification for a specific spending threshold.
 * Called from backgroundTask.js the moment a new debit transaction is saved.
 *
 * Supported thresholds: 50, 75, 90, 100
 */
export async function sendThresholdAlert(threshold, spent, limit) {
  const messages = {
    50:  { title: 'Halfway Through Your Limit', body: `You've spent $${spent.toFixed(2)} of your $${limit} limit (50%).` },
    75:  { title: '75% of Limit Used',          body: `You've spent $${spent.toFixed(2)} of your $${limit} limit. Slow down!` },
    90:  { title: 'Almost at Your Limit',        body: `You've spent $${spent.toFixed(2)} of your $${limit} limit. Nearly nothing left!` },
    100: { title: 'Over Your Limit!',            body: `You've exceeded your $${limit} weekly limit! Total spent: $${spent.toFixed(2)}` },
  };

  const msg = messages[threshold];
  if (!msg) return;

  await Notifications.scheduleNotificationAsync({
    content: { title: msg.title, body: msg.body },
    trigger: null, // null = send immediately
  });
}

