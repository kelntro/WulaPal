import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../assets/logo-mobile.png';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://192.168.56.1:5050"; // Replace with your local network IP

  const handleLogin = async () => {
    setLoading(true);
  
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      setLoading(false);
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "member" }), // Ensure only members log in
      });
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response. Please check backend.");
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }
  
      if (data.user.role !== "member") {
        throw new Error("Only members can log in here.");
      }
  
      // Store token & user data in AsyncStorage for persistence
      await AsyncStorage.setItem("token", data.token);
      if (!data.user || !data.user._id) {
        console.error("Received user data:", data.user); // Log for debugging
        throw new Error("Invalid user data received. Please try again.");
    }
    
    
    await AsyncStorage.setItem("user", JSON.stringify(data.user));
      
      Alert.alert("Success", "Login successful!", [
        { text: "OK", onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: "MainApp", params: { screen: "Home" } }], // ✅ Redirect to Home inside MainApp
          })
        },
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
          Welcome Back, Ka-Wula!
        </StyledText>
        <StyledText className="text-gray-500 text-sm">
          Please, enter your email and log in with password!
        </StyledText>
      </StyledView>

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

      {/* Log In Button */}
      <StyledTouchableOpacity
        className="bg-green-700 rounded-lg py-3 items-center mb-4"
        onPress={handleLogin}
        disabled={loading}
      >
        <StyledText className="text-white font-bold text-lg">
          {loading ? "Logging in..." : "Log In"}
        </StyledText>
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
        <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
          <StyledText className="text-green-600 font-bold">Sign Up</StyledText>
        </TouchableOpacity>
      </StyledView>
    </StyledView>
  );
};

export default LoginScreen;
