import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import logo from '../assets/logo-mobile.png';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const API_BASE_URL = "http://192.168.1.5:5050"; // Replace with your local network IP

const handleSignup = async () => {
  if (!name || !email || !password || !confirmPassword) {
    Alert.alert("Error", "All fields are required.");
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match.");
    return;
  }

  if (!agree) {
    Alert.alert("Error", "You must agree to the Terms and Conditions.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "member" }), // Ensure only members register
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed.");
    }

    Alert.alert("Success", "Member account created successfully!", [
      { text: "OK", onPress: () => navigation.navigate("LoginScreen") },
    ]);
  } catch (error) {
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <StyledView className="flex-1 bg-white px-6 justify-center">
      {/* Logo */}
      <StyledView className="items-center mb-6">
        <Image source={logo} style={{ width: 130, height: 96 }} />
        <StyledText className="text-xl font-bold text-center mt-2">
          CREATE AN ACCOUNT
        </StyledText>
      </StyledView>

      {/* Name Input */}
      <StyledText className="text-gray-700 mb-1">Full Name</StyledText>
      <StyledTextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
      />

      {/* Email Input */}
      <StyledText className="text-gray-700 mb-1">Email Address</StyledText>
      <StyledTextInput
        value={email}
        onChangeText={setEmail}
        placeholder="example@gmail.com"
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <StyledText className="text-gray-700 mb-1">Password</StyledText>
      <StyledView className="flex-row border border-gray-300 rounded-lg px-4 py-3 items-center mb-4">
        <StyledTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          className="flex-1"
          secureTextEntry={!passwordVisible}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon name={passwordVisible ? "eye-off" : "eye"} size={20} color="gray" />
        </TouchableOpacity>
      </StyledView>

      {/* Confirm Password Input */}
      <StyledText className="text-gray-700 mb-1">Confirm Password</StyledText>
      <StyledView className="flex-row border border-gray-300 rounded-lg px-4 py-3 items-center mb-4">
        <StyledTextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          className="flex-1"
          secureTextEntry={!confirmPasswordVisible}
          autoCapitalize="none"
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
      <StyledTouchableOpacity
        className="bg-green-700 rounded-lg py-3 items-center mb-4"
        onPress={handleSignup}
        disabled={loading}
      >
        <StyledText className="text-white font-bold text-lg">
          {loading ? "Signing Up..." : "Sign Up"}
        </StyledText>
      </StyledTouchableOpacity>

      {/* Already have an account? Login */}
      <StyledView className="flex-row justify-center">
        <StyledText className="text-gray-600">Already have an account? </StyledText>
        <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
          <StyledText className="text-green-600 font-bold">Login</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};

export default SignUpScreen;
