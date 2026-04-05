import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';
import { RNAndroidNotificationListenerHeadlessJsName } from 'react-native-notification-listener';
import { handleNotification } from './src/utils/backgroundTask';

// Register the Headless JS task.
// This is how react-native-notification-listener actually delivers notifications —
// Android wakes up this background task each time a notification arrives,
// even when the app is not open. Without this, startListening() runs but
// notifications are never received.
AppRegistry.registerHeadlessTask(
  RNAndroidNotificationListenerHeadlessJsName,
  () => async (taskData) => {
    try {
      const notification = JSON.parse(taskData.notification);
      await handleNotification(notification);
    } catch (e) {}
  }
);


registerRootComponent(App);