import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

const Stack = createStackNavigator();

// ✅ Background handler (required)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📨 [Background] Message:', remoteMessage);

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'WulaPal',
    body: remoteMessage.notification?.body || '',
    android: {
      channelId: 'default',
      importance: AndroidImportance.HIGH,
    },
  });
});

const App = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await notifee.requestPermission();

        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
        });

        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          Alert.alert("Notifications Disabled", "Please enable notifications.");
        }

      } catch (err) {
        console.error("❌ FCM Setup Error:", err.message);
      }
    };

    setupNotifications();

    // ✅ Foreground listener
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('🔔 [Foreground] Received message:', JSON.stringify(remoteMessage, null, 2));

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'WulaPal',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          smallIcon: 'ic_notification',
          importance: AndroidImportance.HIGH,
        },
      });
    });

    // ✅ Background (when app is in background and clicked)
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔁 [Opened from background]:', remoteMessage.notification);
    });

    // ✅ Cold start (when app is killed and opened by tapping)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('💥 [Opened from quit state]:', remoteMessage.notification);
        }
      });

    return () => unsubscribe();
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
