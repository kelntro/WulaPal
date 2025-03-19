import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { styled } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const API_BASE_URL = "http://10.0.2.2:5050"; // Update with your server IP

const OTPVerificationScreen = ({ navigation, route }) => {
  const { name, email, password } = route.params; // Get name, email, and password from SignUpScreen
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }
  
    setLoading(true);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "member", otp }), // Ensure role is sent
      });
  
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }
  
      Alert.alert("Success", "Your account is registered! Please log in.");
      navigation.replace("LoginScreen");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP.");
      }

      Alert.alert("Success", "New OTP has been sent to your email.");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledView className="flex-1 justify-center bg-white px-6">
      <StyledText className="text-xl font-bold text-center mb-4">
        Enter OTP Code
      </StyledText>
      <StyledText className="text-gray-500 text-center mb-6">
        We sent an OTP to your email. Enter it below:
      </StyledText>

      {/* OTP Input */}
      <StyledTextInput
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
        className="border border-gray-300 rounded-lg px-4 py-3 text-center mb-4 text-lg tracking-widest"
        keyboardType="number-pad"
        maxLength={6}
      />

      {/* Verify OTP Button */}
      <StyledTouchableOpacity
        className="bg-green-700 rounded-lg py-3 items-center mb-4"
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <StyledText className="text-white font-bold text-lg">
          {loading ? "Verifying..." : "Verify OTP"}
        </StyledText>
      </StyledTouchableOpacity>

      {/* Resend OTP */}
      <StyledTouchableOpacity onPress={handleResendOTP}>
        <StyledText className="text-green-600 text-center font-bold">
          Resend OTP
        </StyledText>
      </StyledTouchableOpacity>
    </StyledView>
  );
};

export default OTPVerificationScreen;
