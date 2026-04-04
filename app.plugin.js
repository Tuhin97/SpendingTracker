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

    return config;
  });
};
