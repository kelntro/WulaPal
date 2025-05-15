import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, Modal, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import logo from '../assets/logo-mobile.png';
import { API_BASE_URL } from '@env';

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
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const requestOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
  
    if (!name || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields.");
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
  
    if (!agree) {
      Alert.alert("Agreement Required", "You must agree to the Terms and Conditions.");
      return;
    }
  
    setLoading(true);
    setEmailError('');
    console.log("📤 Requesting OTP for:", { name, email, password });
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: "member" }),
      });
  
      const data = await response.json();
      console.log("📥 OTP Response:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to request OTP.");
      }
  
      Alert.alert("Success", "OTP sent! Check your email.");
      navigation.navigate("OTPVerificationScreen", { name, email, password });
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
      <StyledView className="flex-row border border-gray-300 rounded-lg px-4 py-3 items-center mb-4">
        <StyledTextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          className="flex-1"
        />
      </StyledView>

      {/* Email Input */}
      <StyledText className="text-gray-700 mb-1">Email Address</StyledText>
      <StyledView className="flex-row border border-gray-300 rounded-lg px-4 py-3 items-center mb-1">
        <StyledTextInput
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
          }}
          placeholder="example@gmail.com"
          className="flex-1"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </StyledView>
      {emailError ? (
        <StyledText className="text-red-500 text-sm mb-4">{emailError}</StyledText>
      ) : null}

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
          I agree with the{' '}
          <StyledText 
            className="text-green-600 font-bold"
            onPress={() => setTermsModalVisible(true)}
          >
            Terms and Conditions
          </StyledText>
        </StyledText>
      </StyledView>

      {/* Terms and Conditions Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={termsModalVisible}
        onRequestClose={() => setTermsModalVisible(false)}
      >
        <StyledView className="flex-1 bg-white">
          <StyledView className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <StyledText className="text-xl font-bold text-green-700">Terms and Conditions</StyledText>
            <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
              <Icon name="close" size={24} color="gray" />
            </TouchableOpacity>
          </StyledView>
          
          <ScrollView className="p-4">
            <StyledText className="text-gray-500 mb-4">Effective Date: May 30, 2025</StyledText>

            <StyledText className="text-base font-bold text-gray-800 mb-2">1. Acceptance of Terms</StyledText>
            <StyledText className="text-gray-600 mb-4">
              By accessing or using WulaPal, you confirm that you are at least 18 years old or have obtained parental/guardian consent and agree to be bound by these terms and applicable laws.
            </StyledText>

            <StyledText className="text-base font-bold text-gray-800 mb-2">2. Use of the Platform</StyledText>
            <StyledText className="text-gray-600 mb-2">2.1 License Grant:</StyledText>
            <StyledText className="text-gray-600 mb-4">
              WulaPal grants you a limited, non-exclusive, non-transferable, revocable license to use the platform for personal, non-commercial purposes.
            </StyledText>

            <StyledText className="text-base font-bold text-gray-800 mb-2">3. Account Registration and Security</StyledText>
            <StyledText className="text-gray-600 mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and must notify us immediately of any unauthorized use.
            </StyledText>

            <StyledText className="text-base font-bold text-gray-800 mb-2">4. Privacy and Data Collection</StyledText>
            <StyledText className="text-gray-600 mb-4">
              WulaPal values your privacy. Please review our Privacy Policy for details on how we collect, use, and protect your personal information.
            </StyledText>

            <StyledText className="text-base font-bold text-gray-800 mb-2">5. Contact Information</StyledText>
            <StyledText className="text-gray-600 mb-4">
              Email: rams_company@gmail.com{'\n'}
              Phone: +63 9544852365{'\n'}
              Office Address: 57 Building 2, Generoso St., Obrero, Buhangin (Pob.), Davao City, Davao del Sur, 8000
            </StyledText>
          </ScrollView>
        </StyledView>
      </Modal>

      {/* Request OTP Button */}
      <StyledTouchableOpacity
        className="bg-green-700 rounded-lg py-3 items-center mb-4"
        onPress={requestOTP}
        disabled={loading}
      >
        <StyledText className="text-white font-bold text-lg">
          {loading ? "Requesting OTP..." : "Request OTP"}
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
