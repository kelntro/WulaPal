import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingOne from './screens/onboarding/onboarding-one';
import OnboardingTwo from './screens/onboarding/onboarding-two';
import OnboardingThree from './screens/onboarding/onboarding-three';
import BottomTabNavigator from './navigation/BottomTabNavigator'; // Main App after onboarding
import GroupDetailsScreen from './screens/groups/GroupDetailsScreen';
import TransactionDetailsScreen from './screens/transactions/TransactionDetailsScreen';
import OTPVerificationScreen from "./screens/OTPVerificationScreen";
import DepositScreen from './screens/wallet/DepositScreen';
import TransferScreen from './screens/wallet/TransferScreen';
import WithdrawScreen from './screens/wallet/WithdrawScreen';
import NotificationScreen from './screens/notifications/NotificationScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Authentication Screens */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />

        {/* Onboarding Screens */}
        <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
        <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
        <Stack.Screen name="OnboardingThree" component={OnboardingThree} />

        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />

        <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />

        <Stack.Screen name="DepositScreen" component={DepositScreen} options={{ title: 'Deposit Funds' }} />
        <Stack.Screen name="TransferScreen" component={TransferScreen} options={{ title: 'Transfer Funds' }} />
        <Stack.Screen name="WithdrawScreen" component={WithdrawScreen} options={{ title: 'Withdraw Funds' }} />
        
        <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} />
        
        <Stack.Screen name="Notifications" component={NotificationScreen} />
        
        {/* Main App with Bottom Tabs after Onboarding */}
        <Stack.Screen name="MainApp" component={BottomTabNavigator} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
