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
import CouponsScreen from '../screens/CouponsScreen';
import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const HomeStack = createStackNavigator();
const WalletStack = createStackNavigator();
const AccountStack = createStackNavigator();

const COLORS = { primary: '#FFD700', dark: '#1a1a2e', card: '#16213e', text: '#fff', sub: '#555' };

const tabIcon = (name, focused) => {
  const icons = { Home: '🏠', Scan: '📷', List: '🛒', Wallet: '💰', Account: '👤' };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name]}</Text>;
};

// Home stack: Home → Coupons
function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Coupons" component={CouponsScreen} />
    </HomeStack.Navigator>
  );
}

// Wallet stack: Wallet → Crypto → Subscription
function WalletStackNav() {
  return (
    <WalletStack.Navigator screenOptions={{ headerShown: false }}>
      <WalletStack.Screen name="WalletMain" component={WalletScreen} />
      <WalletStack.Screen name="Crypto" component={CryptoScreen} />
      <WalletStack.Screen name="Subscription" component={SubscriptionScreen} />
    </WalletStack.Navigator>
  );
}

// Account stack: Account → PurchaseHistory → Subscription
function AccountStackNav() {
  return (
    <AccountStack.Navigator screenOptions={{ headerShown: false }}>
      <AccountStack.Screen name="AccountMain" component={AccountScreen} />
      <AccountStack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
      <AccountStack.Screen name="Subscription" component={SubscriptionScreen} />
      <AccountStack.Screen name="Crypto" component={CryptoScreen} />
    </AccountStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => tabIcon(route.name, focused),
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.sub,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: '#333',
          height: 80,
          paddingBottom: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNav} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="List" component={GroceryListScreen} />
      <Tab.Screen name="Wallet" component={WalletStackNav} />
      <Tab.Screen name="Account" component={AccountStackNav} />
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
