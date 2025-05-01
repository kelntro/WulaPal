import React, { useEffect, useState } from 'react';
import { Alert, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { API_BASE_URL } from '@env';

// Screens
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingOne from './screens/onboarding/onboarding-one';
import OnboardingTwo from './screens/onboarding/onboarding-two';
import OnboardingThree from './screens/onboarding/onboarding-three';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import GroupDetailsScreen from './screens/groups/GroupDetailsScreen';
import TransactionDetailsScreen from './screens/transactions/TransactionDetailsScreen';
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import DepositScreen from './screens/wallet/DepositScreen';
import TransferScreen from './screens/wallet/TransferScreen';
import WithdrawScreen from './screens/wallet/WithdrawScreen';
import NotificationScreen from './screens/notifications/NotificationScreen';
import GroupChats from './screens/chat/GroupChats';
import MemberGroupChat from './screens/chat/MemberGroupChat'; 
import SearchScreen from './screens/SearchScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ProfileScreen from './screens/ProfileScreen';
import MessageUserScreen from './screens/MessageUserScreen';

const Stack = createStackNavigator();

// ✅ Background handler
getMessaging(getApp()).setBackgroundMessageHandler(async remoteMessage => {
  console.log('📨 [Background] Message:', remoteMessage);
  await notifee.displayNotification({
    id: `${Date.now()}`, // 🔥 unique per message
    title: remoteMessage.notification?.title || 'WulaPal',
    body: remoteMessage.notification?.body || '',
    android: {
      channelId: 'default',
      smallIcon: 'ic_notification',
      importance: AndroidImportance.HIGH,
    },
  });  
});

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await notifee.requestPermission();

        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        const authStatus = await getMessaging(getApp()).requestPermission();
        const enabled = authStatus === 1 || authStatus === 2;

        if (!enabled) {
          Alert.alert("Notifications Disabled", "Please enable notifications.");
        }
      } catch (err) {
        console.error("❌ FCM Setup Error:", err.message);
      }
    };

    const checkSession = async () => {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
    
      if (token && user) {
        console.log("✅ Session found. Auto login...");
        setIsAuthenticated(true);
    
        await setupNotifications();
    
        const fcmToken = await getMessaging(getApp()).getToken();
        if (fcmToken) {
          const userObj = JSON.parse(user);
          await fetch(`${API_BASE_URL}/api/users/save-fcm-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userObj._id, fcmToken }),
          });
    
          console.log("🔁 FCM token refreshed for existing session.");
        }
      } else {
        console.log("🔒 No session found. Redirecting to login.");
        setIsAuthenticated(false);
      }
    
      setLoading(false);
    };
    

    checkSession();

    
    // ✅ Foreground listener
    const unsubscribe = getMessaging(getApp()).onMessage(async remoteMessage => {
      console.log('🔔 [Foreground] Received message:', JSON.stringify(remoteMessage, null, 2));
      console.log('🔔 [Foreground] onMessage triggered for:', remoteMessage);
      await notifee.displayNotification({
        id: `${Date.now()}`, // 🔥 unique per message
        title: remoteMessage.notification?.title || 'WulaPal',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          smallIcon: 'ic_notification',
          importance: AndroidImportance.HIGH,
        },
      });      
    });

    // ✅ Background when app is resumed by clicking notification
    getMessaging(getApp()).onNotificationOpenedApp(remoteMessage => {
      console.log('🔁 [Opened from background]:', remoteMessage.notification);
    });

    // ✅ Cold start
    getMessaging(getApp())
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('💥 [Opened from quit state]:', remoteMessage.notification);
        }
      });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={BottomTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
          <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
          <Stack.Screen name="OnboardingThree" component={OnboardingThree} />
        </>
      )}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
      <Stack.Screen name="DepositScreen" component={DepositScreen} />
      <Stack.Screen name="TransferScreen" component={TransferScreen} />
      <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} />
      <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="GroupChats" component={GroupChats} />
      <Stack.Screen name="MemberGroupChat" component={MemberGroupChat} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

      <Stack.Screen name="MessageUserScreen" component={MessageUserScreen} />
      <Stack.Screen name="Main" component={BottomTabNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);
};

export default App;
