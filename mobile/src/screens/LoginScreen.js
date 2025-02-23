import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import logo from '../assets/logo-mobile.png';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const LoginScreen = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <StyledView className="flex-1 bg-white px-6 justify-center">
      {/* Logo */}
      <StyledView className="items-center mb-6">
        <Image source={logo} style={{ width: 130, height: 96 }} />
        <StyledText className="text-xl font-bold text-center mt-2">
          Welcome Back, Ka-Wula!
        </StyledText>
        <StyledText className="text-gray-500 text-sm">
          Please, enter your email and log in with password!
        </StyledText>
      </StyledView>

      {/* Email Input */}
      <StyledText className="text-gray-700 mb-1">Email Address</StyledText>
      <StyledTextInput
        placeholder="Mainideas@gmail.com"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <StyledText className="text-gray-700 mb-1">Password</StyledText>
      <StyledView className="flex-row border border-gray-300 rounded-lg px-4 py-3 items-center mb-4">
        <StyledTextInput
          placeholder="Enter your password"
          className="flex-1"
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon name={passwordVisible ? "eye-off" : "eye"} size={20} color="gray" />
        </TouchableOpacity>
      </StyledView>

      {/* Log In Button */}
      <StyledTouchableOpacity className="bg-green-700 rounded-lg py-3 items-center mb-4"
      onPress={() => navigation.navigate('OnboardingOne')} // Navigate to Onboarding 
      >
        <StyledText className="text-white font-bold text-lg">Log In</StyledText>
      </StyledTouchableOpacity>

      {/* Divider */}
      <StyledView className="flex-row items-center my-4">
        <StyledView className="flex-1 h-[1px] bg-gray-300" />
        <StyledText className="mx-2 text-gray-500">Or log in with</StyledText>
        <StyledView className="flex-1 h-[1px] bg-gray-300" />
      </StyledView>

      {/* Google Sign-In */}
      <StyledTouchableOpacity className="items-center mb-4">
        <Image
          source={require('../assets/Google-icon.png')}
          style={{ width: 48, height: 48 }}
          resizeMode="contain"
        />
      </StyledTouchableOpacity>

      {/* Don't have an account? Sign Up */}
      <StyledView className="flex-row justify-center">
        <StyledText className="text-gray-600">Don't have an account? </StyledText>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <StyledText className="text-green-600 font-bold">Sign Up</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};

export default LoginScreen;
