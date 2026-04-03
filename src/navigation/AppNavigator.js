// Install required packages before using this file:
// npx expo install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context

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
