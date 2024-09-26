import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import DashboardScreen from './screens/DashboardScreen';
import DepositScreen from './screens/DepositScreen';
import WithdrawScreen from './screens/WithdrawScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Colors } from './theme';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Deposit') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Withdraw') {
            iconName = focused ? 'remove-circle' : 'remove-circle-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text,
        tabBarStyle: { backgroundColor: Colors.card },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Deposit" component={DepositScreen} />
      <Tab.Screen name="Withdraw" component={WithdrawScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}