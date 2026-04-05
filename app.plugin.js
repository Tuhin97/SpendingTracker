const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAllowBackupFix(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    mainApplication.$['tools:replace'] = 'android:allowBackup';
    mainApplication.$['android:allowBackup'] = 'false';

    // Register the NotificationListenerService for react-native-notification-listener.
    // Without this, Android will never deliver notifications to the app.
    if (!mainApplication.service) {
      mainApplication.service = [];
    }

    const serviceExists = mainApplication.service.some(
      s => s.$['android:name'] === 'com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener'
    );

    if (!serviceExists) {
      mainApplication.service.push({
        $: {
          'android:name': 'com.lesimoes.androidnotificationlistener.RNAndroidNotificationListener'
,
          'android:label': '@string/app_name',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:exported': 'true',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'android.service.notification.NotificationListenerService',
                },
              },
            ],
          },
        ],
      });
    }
    
    return config;
  });
};
