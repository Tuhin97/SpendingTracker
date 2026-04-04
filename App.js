/**
 * App.js
 *
 * Root component of the SpendingTracker app.
 * Responsible for starting the CommBank notification listener as soon as
 * the app launches, and stopping it cleanly when the app is unmounted.
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { startNotificationListener, stopNotificationListener, handleNotification } from './src/utils/backgroundTask';
import { requestPermissions } from './src/utils/notifications';

// REQUIRED: tells expo-notifications how to handle incoming notifications.
// Without this, all scheduled notifications are silently dropped.
// Must be set at the module level before any notification is sent.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,   // show the notification banner
    shouldPlaySound: true,   // play the default sound
    shouldSetBadge: false,   // don't change the app badge number
  }),
});


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
