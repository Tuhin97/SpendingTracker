import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { parseCommBankNotification } from './notificationParser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND_NOTIFICATION_TASK';

TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  if (error) {
    console.log('Background task error:', error);
    return;
  }

  if (data) {
    const { notification } = data;
    const text = notification.request.content.body ?? '';
    
    const parsed = parseNotification({
      text,
      time: Date.now(),
    });

    if (parsed.valid) {
      const raw = await AsyncStorage.getItem('@transactions');
      const transactions = raw ? JSON.parse(raw) : [];
      const updated = [parsed, ...transactions];
      await AsyncStorage.setItem('@transactions', JSON.stringify(updated));
    }
  }
});

export async function registerBackgroundTask() {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
}