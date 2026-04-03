import * as Notifications from 'expo-notifications';

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendLimitWarning(spent, limit) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Spending Alert',
      body: `You've spent ₹${spent} of your ₹${limit} limit.`,
    },
    trigger: null, // immediate
  });
}
