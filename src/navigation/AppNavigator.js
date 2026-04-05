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
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardScreen';
import SetLimitScreen from '../screens/SetLimitScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: '#9e9e9e',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 0,
            elevation: 10,
            height: 60,
            paddingBottom: 8,
          },
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Dashboard: focused ? 'home' : 'home-outline',
              'Set Limit': focused ? 'wallet' : 'wallet-outline',
              History: focused ? 'list' : 'list-outline',
              Settings: focused ? 'settings' : 'settings-outline',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Set Limit" component={SetLimitScreen} />
        <Tab.Screen name="History" component={TransactionHistoryScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}