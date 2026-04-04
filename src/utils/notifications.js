import * as Notifications from 'expo-notifications';

// Request permission for the app to send local push notifications.
// Must be called once at app startup before any notifications can be sent.
export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Sends an immediate push notification when the user hits 80% or 100% of their limit.
// isOverLimit = true → red "Over Limit" alert
// isOverLimit = false → orange "Spending Alert" warning
export async function sendLimitWarning(spent, limit, isOverLimit = false) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: isOverLimit ? '🚨 Over Limit!' : '⚠️ Spending Alert',
      body: isOverLimit
        ? `You've exceeded your $${limit} limit! Total spent: $${spent.toFixed(2)}`
        : `You've spent $${spent.toFixed(2)} of your $${limit} limit. Almost there!`,
    },
    trigger: null, // null = send immediately
  });
}
