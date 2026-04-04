import NotificationListener from 'react-native-notification-listener';
import { parseNotification } from './notificationParser';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function startNotificationListener(onNotification) {
  const status = await NotificationListener.getPermissionStatus();
  
  if (status !== 'authorized') {
    await NotificationListener.requestPermission();
  }

  NotificationListener.startListening(notification => {
    if (notification.app?.toLowerCase().includes('commbank') || 
        notification.text?.toLowerCase().includes('commbank')) {
      onNotification(notification);
    }
  });
}

export function stopNotificationListener() {
  NotificationListener.stopListening();
}

export async function handleNotification(notification) {
  const parsed = parseNotification({
    text: notification.text ?? '',
    time: notification.time ?? Date.now(),
  });

  if (!parsed.valid) return;

  const raw = await AsyncStorage.getItem('@transactions');
  const transactions = raw ? JSON.parse(raw) : [];
  
  const alreadyExists = transactions.some(txn => txn.id === parsed.id);
  if (alreadyExists) return;

  const updated = [parsed, ...transactions];
  await AsyncStorage.setItem('@transactions', JSON.stringify(updated));
}