import React, { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

const Stack = createStackNavigator();

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📨 Push in background:', remoteMessage);
});

const App = () => {
  // 🔔 Request permission + get token
  useEffect(() => {
    const setupPush = async () => {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          const fcmToken = await messaging().getToken();
          console.log('📲 FCM Token:', fcmToken);

          // 🧠 Save this token to your backend (optional):
          // await axios.post('http://10.0.2.2:5050/api/save-fcm-token', {
          //   userId: ..., token: fcmToken
          // });
        } else {
          Alert.alert("Notifications Disabled", "Please enable notifications.");
        }

        // Foreground messages
        messaging().onMessage(async remoteMessage => {
          Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
        });

        // When app opened from notification
        messaging().onNotificationOpenedApp(remoteMessage => {
          console.log('🔁 Notification caused app to open:', remoteMessage.notification);
        });

        // App was opened by tapping a notification (cold start)
        messaging()
          .getInitialNotification()
          .then(remoteMessage => {
            if (remoteMessage) {
              console.log('💥 App opened from quit by notification:', remoteMessage.notification);
            }
          });

      } catch (error) {
        console.error("❌ Error setting up FCM:", error.message);
      }
    };

    setupPush();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
        <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
        <Stack.Screen name="OnboardingThree" component={OnboardingThree} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
        <Stack.Screen name="DepositScreen" component={DepositScreen} />
        <Stack.Screen name="TransferScreen" component={TransferScreen} />
        <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} />
        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        <Stack.Screen name="MainApp" component={BottomTabNavigator} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
