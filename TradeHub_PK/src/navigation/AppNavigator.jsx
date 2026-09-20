import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import PoolBuyingScreen from '../screens/PoolBuyingScreen';
import PoolDetailScreen from '../screens/PoolDetailScreen';
import InventoryListScreen from '../screens/InventoryListScreen';
import BarcodeScannerScreen from '../screens/BarcodeScannerScreen';
import InventoryScanResultScreen from '../screens/InventoryScanResultScreen';
import VisualSearchScreen from '../screens/VisualSearchScreen';
import ChangeNumberScreen from '../screens/ChangeNumberScreen';
import VerifyBusinessScreen from '../screens/VerifyBusinessScreen';
import SplashScreen from '../screens/SplashScreen';
import OTPLoginScreen from '../screens/OTPLoginScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import DashboardScreen from '../screens/DashboardScreen';
import BiddingScreen from '../screens/BiddingScreen';
import BidDetailScreen from '../screens/BidDetailScreen';
import LedgerScreen from '../screens/LedgerScreen';
import AIPredictorScreen from '../screens/AIPredictorScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const BiddingStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();

const tabIcons = {
  Ledger: 'book-open-variant',
  Bidding: 'gavel',
  'AI Tools': 'robot-outline',
  Chat: 'chat-outline',
};

const DashboardStackNavigator = () => {
  return (
    <DashboardStack.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStack.Screen name="DashboardHome" component={DashboardScreen} />
      <DashboardStack.Screen name="Ledger" component={LedgerScreen} />
      <DashboardStack.Screen name="Settings" component={SettingsScreen} />
      <DashboardStack.Screen name="EditProfile" component={EditProfileScreen} />
      <DashboardStack.Screen name="PoolBuying" component={PoolBuyingScreen} />
      <DashboardStack.Screen name="PoolDetail" component={PoolDetailScreen} />
      <DashboardStack.Screen name="InventoryList" component={InventoryListScreen} />
      <DashboardStack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
      <DashboardStack.Screen name="InventoryScanResult" component={InventoryScanResultScreen} />
      <DashboardStack.Screen name="VisualSearch" component={VisualSearchScreen} />
      <DashboardStack.Screen name="ChangeNumber" component={ChangeNumberScreen} />
      <DashboardStack.Screen name="VerifyBusinessUpdate" component={VerifyBusinessScreen} />
    </DashboardStack.Navigator>
  );
};

const BiddingStackNavigator = () => {
  return (
    <BiddingStack.Navigator screenOptions={{ headerShown: false }}>
      <BiddingStack.Screen name="BiddingList" component={BiddingScreen} />
      <BiddingStack.Screen name="BidDetail" component={BidDetailScreen} />
    </BiddingStack.Navigator>
  );
};

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatConversation" component={ChatScreen} />
    </ChatStack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Ledger"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1B7A4A',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Icon name={tabIcons[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Ledger" component={DashboardStackNavigator} />
      <Tab.Screen name="Bidding" component={BiddingStackNavigator} />
      <Tab.Screen name="AI Tools" component={AIPredictorScreen} />
      <Tab.Screen name="Chat" component={ChatStackNavigator} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="OTPLogin" component={OTPLoginScreen} />
        <RootStack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <RootStack.Screen
          name="VerifyBusiness"
          component={VerifyBusinessScreen}
        />
        <RootStack.Screen name="MainApp" component={MainTabNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
