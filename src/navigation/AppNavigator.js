import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text } from 'react-native';
import { useAuth } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import WalletScreen from '../screens/WalletScreen';
import AccountScreen from '../screens/AccountScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import CryptoScreen from '../screens/CryptoScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#555' };

const tabIcon = (name, focused) => {
  const icons = { Home: '🏠', Scan: '📷', List: '🛒', Wallet: '💰', Crypto: '🔗', Account: '👤', Subscription: '👑' };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>;
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.sub,
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: '#333', height: 80, paddingBottom: 12 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="List" component={GroceryListScreen} options={{ title: 'List' }} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Crypto" component={CryptoScreen} options={{ title: 'Crypto' }} />
      <Tab.Screen name="Subscription" component={SubscriptionScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
