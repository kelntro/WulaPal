import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingOne from './screens/onboarding/onboarding-one';
import OnboardingTwo from './screens/onboarding/onboarding-two';
import OnboardingThree from './screens/onboarding/onboarding-three';
import GroupsScreen from './screens/GroupsScreen';
import GroupDetailsScreen from './screens/GroupDetailsScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="OnboardingOne" component={OnboardingOne} />
        <Stack.Screen name="OnboardingTwo" component={OnboardingTwo} />
        <Stack.Screen name="OnboardingThree" component={OnboardingThree} />
        <Stack.Screen name="Groups" component={GroupsScreen} />
        <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
