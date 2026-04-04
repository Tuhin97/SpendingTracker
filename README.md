# SpendingTracker

A React Native (Expo) Android app that automatically reads CommBank Australia push notifications to track weekly spending against a set limit. Built around a Tuesday pay cycle (Woolworths weekly pay).

---

## Features

- **Automatic transaction tracking** — reads CommBank app notifications in real time, no manual entry needed
- **Weekly pay cycle** — resets every Tuesday (payday), tracking spending from Tuesday to Monday
- **Weekly spend limit** — set a limit and see a live colour-coded progress bar (green → orange → red)
- **Savings goal** — set a savings target and see whether you've hit it each week
- **Spending alerts** — phone notification when you hit 80% and 100% of your limit
- **Transaction history** — full list of all transactions with All / Debits / Credits filter
- **Weekly archive** — export each week's data as a JSON file saved on the device
- **Test mode** — simulate CommBank notifications without needing real purchases

---

## Project Structure

```
SpendingTracker/
├── App.js                          # Entry point — starts notification listener
├── app.json                        # Expo config (package name, plugins)
├── app.plugin.js                   # Custom config plugin (Android manifest fix)
├── .npmrc                          # legacy-peer-deps=true for dependency conflicts
│
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js         # Bottom tab navigation setup
│   │
│   ├── screens/
│   │   ├── DashboardScreen.js      # Main screen — summary, progress bar, recent transactions
│   │   ├── SetLimitScreen.js       # Set weekly spend limit and savings goal
│   │   ├── TransactionHistoryScreen.js  # Full transaction list with filters
│   │   └── SettingsScreen.js       # Archive, clear data, test buttons
│   │
│   ├── hooks/
│   │   ├── useTransactions.js      # Transaction state, weekly totals, archive logic
│   │   └── useLimits.js            # Spend limit and savings goal state
│   │
│   └── utils/
│       ├── backgroundTask.js       # Notification listener lifecycle and handler
│       ├── notificationParser.js   # Parses CommBank notification text into transactions
│       ├── notifications.js        # Local push notification helpers (alerts)
│       └── formatCurrency.js       # AUD currency and date formatting
```

---

## Requirements

- **Node.js** v18 or later
- **Expo CLI** — `npm install -g expo-cli`
- **EAS CLI** — `npm install -g eas-cli` (for building the APK)
- **Android device** running Android 10 or later (Android 15 tested)
- A **CommBank** account with push notifications enabled in the CommBank app

> ⚠️ This app is **Android only**. The `react-native-notification-listener` library that reads other apps' notifications is not available on iOS.

---

## Installation

### 1. Clone the project

```bash
git clone <your-repo-url>
cd SpendingTracker
```

### 2. Install dependencies

The project uses `legacy-peer-deps` due to a version conflict with `react-native-notification-listener`. The `.npmrc` file handles this automatically:

```bash
npm install
```

### 3. Log in to Expo

```bash
eas login
```

### 4. Build the APK

You have two options:

#### Option A — EAS Cloud Build (easiest, 30 free builds/month)

```bash
eas build --platform android --profile preview
```

This builds on Expo's cloud servers. Once complete, download the APK from the link shown in the terminal. Takes 10–15 minutes the first time.

> The free plan allows 30 Android builds per month, resetting on the 1st of each month.

#### Option B — Local Build (unlimited, no account needed)

Builds the APK directly on your Mac. Requires Android Studio to be installed with the Android SDK.

**Prerequisites:**
- [Android Studio](https://developer.android.com/studio) installed
- Android SDK installed via Android Studio
- `ANDROID_HOME` set in your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Connect your Android device wirelessly (recommended for Android 11+):**

1. Enable Developer options: **Settings → About phone → Software information** → tap **Build number** 7 times
2. Go to **Settings → Developer options → Wireless debugging → ON**
3. Tap **"Pair device with pairing code"** and note the IP, port, and 6-digit code
4. On your Mac terminal:
```bash
source ~/.zshrc && adb pair YOUR_IP:PAIRING_PORT
# enter the 6-digit code when prompted
```
5. Then connect using the IP and port shown at the top of the Wireless debugging screen:
```bash
adb connect YOUR_IP:CONNECTION_PORT
```
6. Verify your device is connected:
```bash
adb devices
# should show "device" not "unauthorized"
```

**Run the build:**

```bash
cd SpendingTracker && source ~/.zshrc && npx expo run:android --variant release
```

This takes 5–10 minutes the first time. The APK is installed automatically on your phone when done.

**Find the APK file:**

After building, the APK is saved at:
```
android/app/build/outputs/apk/release/app-release.apk
```

To find it in Finder: press **Cmd + Shift + G** and paste:
```
/path/to/SpendingTracker/android/app/build/outputs/apk/release
```

### 5. Install on your Android device

Since this is not on the Play Store, you need to sideload the APK:

1. Transfer the `.apk` file to your phone (via USB, Google Drive, email, etc.)
2. On your phone go to **Settings → Apps → Install unknown apps**
3. Allow the file manager or browser you're using to install unknown apps
4. Tap the `.apk` file and tap **Install**

---

## First-Time Setup on Device

### 1. Grant Notification Access

This is the most important permission — without it the app cannot read CommBank notifications.

**Settings → Apps → ⋮ (three dots) → Special app access → Notification access → SpendingTracker → Allow**

### 2. Disable Battery Optimisation

Samsung and other Android manufacturers aggressively kill background apps. To keep the listener alive:

**Settings → Apps → SpendingTracker → Battery → Unrestricted**

Also add to never-sleeping apps:

**Settings → Battery → Background usage limits → Never sleeping apps → + → SpendingTracker**

### 3. Set Your Limit

Open the app → tap **Set Limit** tab → enter your weekly spend limit and savings goal → tap **Save**.

---

## How It Works

1. The app starts a `NotificationListenerService` when launched
2. Every notification on the device is checked — only CommBank ones are processed
3. CommBank notification text is parsed by `notificationParser.js` to extract the amount, merchant, and transaction type
4. Valid transactions are saved to `AsyncStorage` on the device
5. The Dashboard reads from storage every time you switch to it and displays the weekly summary

### Supported CommBank notification formats

| Format | Type |
|---|---|
| `$7.90 spent at On the Run.` | Debit |
| `$45.00 spent at COLES SUPERMARKETS.` | Debit |
| `You've been paid $70.00 into your account ending 6373.` | Credit (Direct Credit) |
| `You've been paid $70.00 by Woolworths into your account.` | Credit (Woolworths) |

---

## Weekly Archive

At the end of each pay week (before Tuesday), go to **Settings → Archive This Week**. This will:

1. Save all this week's transactions to a `week_YYYY-MM-DD.json` file on the device
2. Send a push notification confirming it's saved
3. Reset the tracker ready for the new week

Archived files are stored in the app's private document directory and listed at the bottom of the Settings screen.

---

## Test Mode

The Settings screen has three test buttons that simulate real CommBank notifications without needing actual purchases. Use these to verify the app is working after installation:

| Button | Simulates |
|---|---|
| 🛒 Test Debit ($45 COLES) | A $45 purchase at Coles |
| 💰 Test Credit ($1000 Pay) | A $1000 pay deposit |
| ⚠️ Test Limit Warning ($750) | A $750 purchase to trigger limit alerts |

After pressing a test button, switch to the **Dashboard** or **History** tab to see the result.

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~54.0.33 | Framework |
| `react-native` | 0.81.5 | Core |
| `react-native-notification-listener` | ^5.0.2 | Reads other apps' notifications |
| `@react-native-async-storage/async-storage` | 2.2.0 | Local data persistence |
| `@react-navigation/bottom-tabs` | ^7.15.9 | Tab navigation |
| `expo-notifications` | 0.32.16 | Local push notifications (spending alerts) |
| `expo-file-system` | included with expo | Weekly JSON archive exports |
| `expo-build-properties` | ~1.0.10 | Android manifest configuration |

---

## Customising for Your Own Use

This app was built specifically for a Woolworths employee in Australia who banks with CommBank and gets paid every Tuesday. If your situation is different, here's exactly what to change.

---

### Change the Pay Day

The weekly reset is hardcoded to **Tuesday** in `src/hooks/useTransactions.js` inside the `getLastTuesday()` function.

Open `src/hooks/useTransactions.js` and find this function:

```js
function getLastTuesday() {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 2) ? 0 : (day + 5) % 7;
  ...
}
```

JavaScript's `getDay()` returns:

| Day | Number |
|---|---|
| Sunday | 0 |
| Monday | 1 |
| **Tuesday** | **2** ← currently hardcoded |
| Wednesday | 3 |
| Thursday | 4 |
| Friday | 5 |
| Saturday | 6 |

**To change to a different pay day**, replace every `2` with your pay day number and rename the function to match. For example, for a **Friday** pay cycle:

```js
function getLastFriday() {
  const today = new Date();
  const day = today.getDay();
  const diff = (day === 5) ? 0 : (day + 2) % 7;  // 5 = Friday
  const lastFriday = new Date(today);
  lastFriday.setDate(today.getDate() - diff);
  lastFriday.setHours(0, 0, 0, 0);
  return lastFriday;
}
```

The formula for the `diff` line for any pay day is:
```
diff = (day === YOUR_PAY_DAY) ? 0 : (day + (7 - YOUR_PAY_DAY)) % 7
```

Then update the three places inside `useTransactions.js` that call `getLastTuesday()` to call your renamed function instead:
- inside `getWeeklyTotal()`
- inside `getWeeklyCredits()`
- inside `archiveAndReset()`

---

### Change the Pay Cycle (Fortnightly or Monthly)

If you get paid **fortnightly**, the Tuesday reset won't work correctly because it resets every week. The simplest approach is to change `getLastTuesday()` to calculate a fixed date 14 days before today instead:

```js
function getLastPayDay() {
  const today = new Date();
  const lastPayDay = new Date(today);
  lastPayDay.setDate(today.getDate() - 14); // 14 days = fortnightly
  lastPayDay.setHours(0, 0, 0, 0);
  return lastPayDay;
}
```

For **monthly**, replace `14` with `30`.

> Note: A more accurate monthly solution would track the specific date of the month (e.g. always the 15th). If you need that, open an issue or reach out.

---

### Change the Currency

The app is hardcoded to **Australian Dollars (AUD)**. To change it, open `src/utils/formatCurrency.js`:

```js
export function formatCurrency(amount, currency = 'AUD') {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(amount);
}
```

Change `'AUD'` to your currency code and `'en-AU'` to your locale:

| Country | Currency Code | Locale |
|---|---|---|
| Australia | `AUD` | `en-AU` |
| United States | `USD` | `en-US` |
| United Kingdom | `GBP` | `en-GB` |
| India | `INR` | `en-IN` |
| New Zealand | `NZD` | `en-NZ` |
| Canada | `CAD` | `en-CA` |
| Europe | `EUR` | `de-DE` |

Example for USD:
```js
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
```

---

### Change the Bank

This app reads notifications from **CommBank Australia**. The filter is in `src/utils/backgroundTask.js`:

```js
if (notification.app?.toLowerCase().includes('commbank') ||
    notification.title?.toLowerCase().includes('commbank') ||
    notification.text?.toLowerCase().includes('commbank')) {
```

Replace `'commbank'` with a keyword from your bank's app name. For example:

| Bank | Replace with |
|---|---|
| ANZ | `'anz'` |
| NAB | `'nab'` |
| Westpac | `'westpac'` |
| ING | `'ing'` |
| HSBC | `'hsbc'` |
| Barclays | `'barclays'` |

---

### Change the Notification Format (for other banks)

Different banks format their notifications differently. The parsing logic is in `src/utils/notificationParser.js`.

The two key lines to update are:

**1. Credit/Debit detection** — change the keywords that identify money in vs money out:
```js
const isCredit = body.toLowerCase().includes('been paid') || body.toLowerCase().includes('credited');
const isDebit = body.toLowerCase().includes('spent at') || body.toLowerCase().includes('debited');
```

**2. Merchant extraction** — change the regex to match your bank's format:
```js
// CommBank format: "$7.90 spent at COLES."
const merchantMatch = body.match(/spent at ([A-Za-z0-9][A-Za-z0-9\s&'()-]{1,40}?)\./i);
```

To figure out what keywords and format your bank uses, enable notifications in your banking app, make a small purchase, and note exactly what the notification says. Then update the keywords and regex to match.

**Example for a bank that uses "Purchase at" instead of "spent at":**
```js
const isDebit = body.toLowerCase().includes('purchase at') || body.toLowerCase().includes('debited');
const merchantMatch = body.match(/purchase at ([A-Za-z0-9][A-Za-z0-9\s&'()-]{1,40}?)\./i);
```

---

### Change the Employer Name for Credits

When a credit is detected, the app checks whether the notification mentions `woolworths` and labels it accordingly. This is in `src/utils/notificationParser.js`:

```js
if (body.toLowerCase().includes('woolworths')) {
    creditMerchant = 'Woolworths';
}
```

Replace `'woolworths'` and `'Woolworths'` with your employer's name. For example for a Coles employee:

```js
if (body.toLowerCase().includes('coles')) {
    creditMerchant = 'Coles';
}
```

---

### Change the App Name and Package

Open `app.json` and update these two fields:

```json
{
  "expo": {
    "name": "SpendingTracker",
    "android": {
      "package": "com.tutu21.SpendingTracker"
    }
  }
}
```

- `name` — the display name shown on your home screen
- `package` — must be unique if you plan to distribute the app (use your own domain in reverse, e.g. `com.yourname.spendingtracker`)

---

### Summary of Files to Change

| What you want to change | File to edit |
|---|---|
| Pay day (Tuesday → Friday etc.) | `src/hooks/useTransactions.js` |
| Pay cycle (weekly → fortnightly/monthly) | `src/hooks/useTransactions.js` |
| Currency and locale | `src/utils/formatCurrency.js` |
| Which bank's notifications to read | `src/utils/backgroundTask.js` |
| Notification text format (credit/debit detection) | `src/utils/notificationParser.js` |
| Employer name shown on credits | `src/utils/notificationParser.js` |
| App name and package ID | `app.json` |

---

## Known Limitations

- **Android only** — iOS does not allow reading other apps' notifications
- **App must be running** — the listener only works while the app is alive in the background; if Android kills the process, new notifications won't be captured until the app is reopened
- **Past notifications are not captured** — only notifications that arrive while the listener is active are tracked
- **Cloud sync not yet implemented** — archived JSON files are stored locally on the device only

---

## Future Plans

- Cloud sync for weekly archives (upload JSON files to a remote server)
- Cross-device integration (phone ↔ Mac)
- Support for multiple bank accounts
