import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { styled } from 'nativewind';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from '../assets/logo-mobile.png';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { API_BASE_URL } from '@env';

const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '841356244009-icpfsekev3ptc9r73qmee7tn68orqpii.apps.googleusercontent.com',      
      offlineAccess: true,
    });
  }, []);
  
  const handleLogin = async () => {
    setLoading(true);
    console.log("🔐 Starting email/password login...");
  
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      setLoading(false);
      return;
    }
  
    console.log("📤 Sending login request with:", { email });
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: "member" }),
      });
  
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid server response. Please check backend.");
      }
  
      const data = await response.json();
      console.log("📥 Login response:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Login failed.");
      }
  
      if (!data.user || !data.user._id) {
        console.error("⚠️ Missing user ID in response:", data.user);
        throw new Error("User ID is missing. Please try again.");
      }
  
      if (data.user.role !== "member") {
        throw new Error("Only members can log in here.");
      }
  
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      console.log("💾 Token and user saved to AsyncStorage");
  
      const fcmToken = await getMessaging(getApp()).getToken();
      console.log("📲 FCM Token:", fcmToken);
  
      if (fcmToken) {
        const res = await fetch(`${API_BASE_URL}/api/users/save-fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: data.user._id, fcmToken }),
        });
  
        const fcmResult = await res.json();
        console.log("📥 FCM save response:", fcmResult);
  
        if (!res.ok) throw new Error("FCM token failed to save");
  
        console.log("✅ FCM token saved successfully");
      } else {
        console.warn("⚠️ No FCM token received");
      }
  
      Alert.alert("Success", "Login successful!", [
        {
          text: "OK",
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Main", params: { screen: "Home" } }],
            }),
        },
      ]);
    } catch (error) {
      console.error("❌ Login Error:", error.message);
      Alert.alert("Login Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  

const handleGoogleLogin = async () => {
  console.log("🚀 Google login started");

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("✅ Play services available");

    const userInfo = await GoogleSignin.signIn();
    console.log("✅ Google Sign-In Success:", JSON.stringify(userInfo, null, 2));

    const { idToken, user } = userInfo.data; // ✅ Make sure it's `.data`

    if (!idToken) {
      console.warn("⚠️ No idToken received, but user info available.");

      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
        console.log("💾 Saved Google user info (without Firebase).");
      } else {
        console.warn("❌ No user info found too.");
      }

      return;
    }

    console.log("🔑 idToken received:", idToken);

    // ✅ Proceed with Firebase authentication
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log("✅ Firebase Auth Success:", JSON.stringify(userCredential.user, null, 2));

    const firebaseToken = await userCredential.user.getIdToken();
    await AsyncStorage.setItem("token", firebaseToken);
    await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));
    console.log("💾 Firebase token and user saved to AsyncStorage");

    // ✅ NOW POST to your backend to register/login member
    const response = await fetch(`${API_BASE_URL}/api/auth/google-login-member`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user.name || user.displayName || "Unnamed User", // ✅ fallback safe
        email: user.email,
        profileImage: user.photo || null, // ✅ fallback safe
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Backend error:", result.error);
      Alert.alert("Backend Error", result.error || "Failed to register/login.");
      return;
    }

    console.log("✅ Backend member login/register success:", result.user);

    // ✅ Update local storage from backend confirmed user
    await AsyncStorage.setItem("user", JSON.stringify(result.user));
    console.log("💾 Updated user saved from backend.");

    navigation.reset({
      index: 0,
      routes: [{ name: "Main", params: { screen: "Home" }}],
    });

  } catch (error) {
    console.error("❌ Google Sign-In Error Details:", error);
    console.log("📛 Error Code:", error.code);
    console.log("📛 Error Message:", error.message);

    Alert.alert("Google Sign-In Error", error.message || "Unknown error during Google login.");
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
      <StyledTouchableOpacity
        className="items-center mb-4"
        onPress={handleGoogleLogin} // ✅ Added onPress
        activeOpacity={0.8} // ✅ Optional: for better UI touch feedback
      >
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
