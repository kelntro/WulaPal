import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, Modal, ActivityIndicator } from "react-native";
import { styled } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { API_BASE_URL } from '@env';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);
const StyledTouchableOpacity = styled(TouchableOpacity);

const OTPVerificationScreen = ({ navigation, route }) => {
  const { name, email, password, mode = 'signup', userData } = route.params;
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const isProfileComplete = (user) => {
    return (
      user.name &&
      user.dateofBirth &&
      user.gender &&
      user.mobile &&
      user.country &&
      user.occupation &&
      user.sourceOfFunds
    );
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }
  
    setLoading(true);
    console.log(`📩 Verifying OTP for ${mode} with:`, { email, otp });
  
    try {
      let response;
      let data;

      if (mode === 'signup') {
        // Handle signup verification
        response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role: "member", otp }),
        });
        data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "OTP verification failed.");
        }
        
        Alert.alert("Success", "Your account is registered! Please log in.");
        navigation.replace("Login");
      } else {
        // Handle login verification
        response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "OTP verification failed.");
        }

        // Save auth data
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        // Save FCM token
        const fcmToken = await getMessaging(getApp()).getToken();
        if (fcmToken) {
          await fetch(`${API_BASE_URL}/api/users/save-fcm-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user._id, fcmToken }),
          });
        }

        // Update last active
        await fetch(`${API_BASE_URL}/api/users/last-active/${data.user._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" }
        });

        // Fetch complete user data
        const userResponse = await fetch(`${API_BASE_URL}/api/users/${data.user._id}`);
        const userData = await userResponse.json();

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        // Update stored user data with complete information
        await AsyncStorage.setItem("user", JSON.stringify(userData));

        // Always navigate to Main first
        navigation.reset({
          index: 0,
          routes: [{ name: "Main", params: { screen: "Home" } }],
        });

        // If profile is incomplete, show the modal
        if (!isProfileComplete(userData)) {
          setShowProfileModal(true);
        }
      }
    } catch (error) {
      console.error(`❌ OTP Verification Error (${mode}):`, error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOTP = async () => {
    setSendingOTP(true);
    console.log("🔁 Resending OTP to:", email);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
  
      const data = await response.json();
      console.log("📥 Resend OTP response:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP.");
      }
  
      Alert.alert("Success", "New OTP has been sent to your email.");
    } catch (error) {
      console.error("❌ Resend OTP Error:", error.message);
      Alert.alert("Error", error.message);
    } finally {
      setSendingOTP(false);
    }
  };  

  const handleCompleteProfile = () => {
    setShowProfileModal(false);
    navigation.navigate("Profile");
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

      {/* Sending OTP Loading Modal */}
      <Modal
        visible={sendingOTP}
        transparent={true}
        animationType="fade"
      >
        <StyledView className="flex-1 justify-center items-center bg-black/50">
          <StyledView className="bg-white rounded-lg p-6 m-4 w-[90%] max-w-[300px] items-center">
            <ActivityIndicator size="large" color="#15803d" />
            <StyledText className="text-gray-700 text-center mt-4 font-medium">
              Sending OTP...
            </StyledText>
          </StyledView>
        </StyledView>
      </Modal>

      {/* Profile Completion Modal */}
      <Modal
        visible={showProfileModal}
        transparent={true}
        animationType="fade"
      >
        <StyledView className="flex-1 justify-center items-center bg-black/50">
          <StyledView className="bg-white rounded-lg p-6 m-4 w-[90%] max-w-[400px]">
            <StyledText className="text-xl font-bold text-center mb-4">
              Complete Your Profile
            </StyledText>
            <StyledText className="text-gray-600 text-center mb-6">
              Please complete your profile details before joining the group. This helps us provide you with a better experience.
            </StyledText>
            <StyledTouchableOpacity
              className="bg-green-700 rounded-lg py-3 items-center"
              onPress={handleCompleteProfile}
            >
              <StyledText className="text-white font-bold text-lg">
                Complete Profile
              </StyledText>
            </StyledTouchableOpacity>
          </StyledView>
        </StyledView>
      </Modal>
    </StyledView>
  );
};

export default OTPVerificationScreen;
