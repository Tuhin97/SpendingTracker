/**
 * App.js
 *
 * Root component of the SpendingTracker app.
 * Responsible for starting the CommBank notification listener as soon as
 * the app launches, and stopping it cleanly when the app is unmounted.
 */

import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { startNotificationListener, stopNotificationListener, handleNotification } from './src/utils/backgroundTask';
import { requestPermissions } from './src/utils/notifications';

export default function App() {

  useEffect(() => {
    // Ask for notification permission so the app can send spending alerts.
    // This shows the Android permission dialog on first launch.
    requestPermissions();

    // Start listening for CommBank notifications when the app mounts.
    // Every matching notification is passed to handleNotification(),
    // which parses it and saves it to AsyncStorage.
    startNotificationListener(async (notification) => {
      await handleNotification(notification);
    });

    // Cleanup: stop the listener when the app is closed or unmounted
    // to avoid memory leaks or ghost listeners running in the background.
    return () => stopNotificationListener();
  }, []); // Empty array = run once on mount, clean up on unmount

  return <AppNavigator />;
}
