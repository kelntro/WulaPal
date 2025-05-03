import React, {useEffect, useState} from 'react';
import {Alert, ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessaging} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {API_BASE_URL} from '@env';

// Screens
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingOne from './screens/onboarding/onboarding-one';
import OnboardingTwo from './screens/onboarding/onboarding-two';
import OnboardingThree from './screens/onboarding/onboarding-three';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import GroupDetailsScreen from './screens/groups/GroupDetailsScreen';
import TransactionDetailsScreen from './screens/transactions/TransactionDetailsScreen';
import OTPVerificationScreen from './screens/OTPVerificationScreen';
import DepositScreen from './screens/wallet/DepositScreen';
import DepositSuccessScreen from './screens/wallet/DepositSuccessScreen';
import TransferScreen from './screens/wallet/TransferScreen';
import WithdrawScreen from './screens/wallet/WithdrawScreen';
import NotificationScreen from './screens/notifications/NotificationScreen';
import GroupChats from './screens/chat/GroupChats';
import MemberGroupChat from './screens/chat/MemberGroupChat';
import SearchScreen from './screens/SearchScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import ProfileScreen from './screens/ProfileScreen';
import MessageUserScreen from './screens/MessageUserScreen';
import PinCodeScreen from './screens/pin/PinCodeScreen';
import TermsScreen from './screens/settings/TermsScreen';
import PrivacyPolicyScreen from './screens/settings/PrivacyPolicyScreen';
import AboutScreen from './screens/settings/AboutScreen';
import SetPinScreen from './screens/pin/SetPinScreen';

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
  const [showPinScreen, setShowPinScreen] = useState(false);
const [storedUserId, setStoredUserId] = useState(null);

  +useEffect(() => {
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
          Alert.alert('Notifications Disabled', 'Please enable notifications.');
        }
      } catch (err) {
        console.error('❌ FCM Setup Error:', err.message);
      }
    };

    const checkSession = async () => {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
    
      if (token && user) {
        const parsedUser = JSON.parse(user);
    
        try {
          // 🔍 Fetch latest user data (to check pinCode existence)
          const res = await fetch(`${API_BASE_URL}/api/users/${parsedUser._id}`);
          const freshUser = await res.json();
    
          if (!res.ok || !freshUser || freshUser.error || !freshUser._id) {
            console.warn('⚠️ Failed to fetch user profile. Clearing session and redirecting to login.');
    
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
    
            Alert.alert(
              'Session Expired',
              'Your account no longer exists or was reset. Please log in again.'
            );
    
            setIsAuthenticated(false);
            setLoading(false); // ✅ Ensure this is before return
            return;
          }
    
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
    
          console.log('🔍 Received pinCode value:', freshUser.pinCode);
    
          if (freshUser.pinCode && freshUser.pinCode !== 'null') {
            console.log('🔐 PIN is set. Requiring verification.');
            setStoredUserId(freshUser._id);
            setShowPinScreen(true);
          } else {
            console.log('✅ No PIN set. Logging in directly.');
            setIsAuthenticated(true);
          }
    
          // 🔄 Refresh notifications
          await setupNotifications();
          const fcmToken = await getMessaging(getApp()).getToken();
          if (fcmToken) {
            await fetch(`${API_BASE_URL}/api/users/save-fcm-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: freshUser._id, fcmToken }),
            });
          }
    
        } catch (err) {
          console.error('❌ Session check failed:', err.message);
          setIsAuthenticated(false);
          setLoading(false); // ✅ Catch block sets loading to false
          return;
        }
      } else {
        console.log('🔒 No session found. Redirecting to login.');
        setIsAuthenticated(false);
        setLoading(false); // ✅ Handles missing token/user session
        return;
      }
    
      setLoading(false); // ✅ Covers successful case
    };       
    

    checkSession();

    // ✅ Foreground listener
    const unsubscribe = getMessaging(getApp()).onMessage(
      async remoteMessage => {
        console.log(
          '🔔 [Foreground] Received message:',
          JSON.stringify(remoteMessage, null, 2),
        );
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
      },
    );

    // ✅ Background when app is resumed by clicking notification
    getMessaging(getApp()).onNotificationOpenedApp(remoteMessage => {
      console.log('🔁 [Opened from background]:', remoteMessage.notification);
    });

    // ✅ Cold start
    getMessaging(getApp())
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            '💥 [Opened from quit state]:',
            remoteMessage.notification,
          );
        }
      });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {showPinScreen ? (
 <Stack.Screen
 name="PinCodeScreen"
 options={{ headerShown: false }}
 initialParams={{
   userId: storedUserId,
   onSuccess: () => {
     setShowPinScreen(false);
     setIsAuthenticated(true);
   },
 }}
>
 {props => <PinCodeScreen {...props} />}
</Stack.Screen>

        ) : isAuthenticated ? (
          <Stack.Screen name="MainApp" component={BottomTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
            <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
            <Stack.Screen name="OnboardingThree" component={OnboardingThree} />
          </>
        )}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Stack.Screen
          name="TransactionDetails"
          component={TransactionDetailsScreen}
        />
        <Stack.Screen name="DepositScreen" component={DepositScreen} />
        <Stack.Screen name="DepositSuccessScreen" component={DepositSuccessScreen} />
        <Stack.Screen name="TransferScreen" component={TransferScreen} />
        <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} />
        <Stack.Screen
          name="OTPVerificationScreen"
          component={OTPVerificationScreen}
        />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="GroupChats" component={GroupChats} />
        <Stack.Screen name="MemberGroupChat" component={MemberGroupChat} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
        <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />

        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="About" component={AboutScreen} />

        <Stack.Screen name="SetPinScreen" component={SetPinScreen} />

        <Stack.Screen name="MessageUserScreen" component={MessageUserScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
