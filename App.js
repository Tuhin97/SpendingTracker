import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { startNotificationListener, stopNotificationListener, handleNotification } from './src/utils/backgroundTask';

export default function App() {

  useEffect(() => {
    startNotificationListener(async (notification) => {
      await handleNotification(notification);
    });

    return () => stopNotificationListener();
  }, []);

  return <AppNavigator />;
}