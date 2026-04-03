import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { parseNotification } from './src/utils/notificationParser';
import { useTransactions } from './src/hooks/useTransactions';
import * as Notifications from 'expo-notifications';

export default function App() {
  const { addTransaction } = useTransactions();

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const text = notification.request.content.body ?? '';
      const parsed = parseNotification({ 
        text, 
        time: Date.now() 
      });
      if (parsed.valid) {
        addTransaction(parsed);
      }
    });

    return () => subscription.remove();
  }, []);

  return <AppNavigator />;
}