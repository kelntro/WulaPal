import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import logo from '../assets/logo-mobile.png';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const SignUpScreen = ({ navigation }) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [agree, setAgree] = useState(false);

  return (
    <StyledView className="flex-1 bg-white px-6 justify-center">
      {/* Logo */}
      <StyledView className="items-center mb-6">
      <Image source={logo} style={{ width: 130, height: 96 }} />
        <StyledText className="text-xl font-bold text-center mt-2">
          CREATE AN ACCOUNT
        </StyledText>
        <StyledText className="text-gray-500 text-sm">
          Welcome to WulaPal
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

      {/* Confirm Password Input */}
      <StyledText className="text-gray-700 mb-1">Confirm Password</StyledText>
      <StyledView className="flex-row border border-gray-300 rounded-lg px-4 py-3 items-center mb-4">
        <StyledTextInput
          placeholder="Confirm your password"
          className="flex-1"
          secureTextEntry={!confirmPasswordVisible}
        />
        <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
          <Icon name={confirmPasswordVisible ? "eye-off" : "eye"} size={20} color="gray" />
        </TouchableOpacity>
      </StyledView>

      {/* Terms & Conditions */}
      <StyledView className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => setAgree(!agree)} className="w-5 h-5 border border-gray-400 rounded mr-2">
          {agree && <Icon name="check" size={18} color="black" />}
        </TouchableOpacity>
        <StyledText className="text-gray-600">
          I agree with the <StyledText className="text-green-600 font-bold">Terms and Conditions</StyledText>
        </StyledText>
      </StyledView>

      {/* Sign Up Button */}
      <StyledTouchableOpacity className="bg-green-700 rounded-lg py-3 items-center mb-4">
        <StyledText className="text-white font-bold text-lg">Sign Up</StyledText>
      </StyledTouchableOpacity>

      {/* Divider */}
      <StyledView className="flex-row items-center my-4">
        <StyledView className="flex-1 h-[1px] bg-gray-300" />
        <StyledText className="mx-2 text-gray-500">Or sign up with</StyledText>
        <StyledView className="flex-1 h-[1px] bg-gray-300" />
      </StyledView>

      {/* Google Sign-In */}
      <StyledTouchableOpacity className="items-center mb-4">
      <Image
        source={require('../assets/Google-icon.png')}
        style={{width: 48, height: 48}}
        resizeMode="contain"
      />
      </StyledTouchableOpacity>

      {/* Already have an account? Login */}
      <StyledView className="flex-row justify-center">
        <StyledText className="text-gray-600">Already have an account? </StyledText>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <StyledText className="text-green-600 font-bold">Login</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};

export default SignUpScreen;
