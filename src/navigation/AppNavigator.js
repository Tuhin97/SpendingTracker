/**
 * AppNavigator.js
 *
 * Sets up the bottom tab navigation for the app.
 * Each tab maps to a screen component. The NavigationContainer wraps
 * everything and provides navigation context to all child screens.
 *
 * Tabs:
 *   Dashboard  - weekly summary, progress bar, recent transactions
 *   Set Limit  - configure weekly spend limit and savings goal
 *   History    - full transaction list with All/Debits/Credits filter
 *   Settings   - archive, clear data, and test buttons
 */

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardScreen from '../screens/DashboardScreen';
import SetLimitScreen from '../screens/SetLimitScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Set Limit" component={SetLimitScreen} />
        <Tab.Screen name="History" component={TransactionHistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
