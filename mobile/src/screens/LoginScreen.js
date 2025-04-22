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


const StyledText = styled(Text);
const StyledView = styled(View);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = "http://10.0.2.2:5050"; // Replace with your local network IP

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '841356244009-icpfsekev3ptc9r73qmee7tn68orqpii.apps.googleusercontent.com',      
      offlineAccess: true,
    });
  }, []);
  
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

        if (!data.user || !data.user._id) {
            console.error("[LOGIN] Missing user ID:", data.user); // Debugging
            throw new Error("User ID is missing. Please try again.");
        }

        if (data.user.role !== "member") {
            throw new Error("Only members can log in here.");
        }

        // ✅ Store token & user ID in AsyncStorage for wallet & other API requests
        await AsyncStorage.setItem("token", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data.user));

        console.log("[LOGIN] User logged in successfully:", data.user);
        // ✅ Save FCM token
        const fcmToken = await getMessaging(getApp()).getToken();

        if (fcmToken) {
          const res = await fetch(`${API_BASE_URL}/api/users/save-fcm-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user._id, fcmToken }),
          });
        
          if (!res.ok) {
            throw new Error("FCM token failed to save");
          }
        
          console.log("✅ FCM token saved:", fcmToken);
        } else {
          console.log("⚠️ Failed to get FCM token");
        }

        Alert.alert("Success", "Login successful!", [
            {
                text: "OK",
                onPress: () =>
                    navigation.reset({
                        index: 0,
                        routes: [{ name: "Main", params: { screen: "Home" } }], // ✅ Redirect to Home inside MainApp
                    }),
            },
        ]);
    } catch (error) {
        console.error("[LOGIN] Error:", error.message);
        Alert.alert("Error", error.message);
    } finally {
        setLoading(false);
    }
};

const handleGoogleLogin = async () => {
  console.log("🚀 Google login started");

  try {
    // Check if Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("✅ Play services available");

    // Trigger Google Sign-In flow
    const { idToken, user } = await GoogleSignin.signIn();
    console.log("✅ Google sign-in success. ID Token:", idToken);
    console.log("👤 Google user info:", user);

    // Get credential from Google ID token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    console.log("🔑 Google credential created");

    // Sign in with Firebase Authentication
    const userCredential = await auth().signInWithCredential(googleCredential);
    console.log("✅ Firebase sign-in success:", JSON.stringify(userCredential.user, null, 2));

    // Save token and user to AsyncStorage
    const firebaseToken = await userCredential.user.getIdToken();
    console.log("📥 Firebase Auth Token fetched:", firebaseToken);

    await AsyncStorage.setItem("token", firebaseToken);
    await AsyncStorage.setItem("user", JSON.stringify(userCredential.user));
    console.log("💾 Token and user saved to AsyncStorage");

    // Navigate to MainApp
    console.log("🚀 Navigating to MainApp screen");
    navigation.reset({
      index: 0,
      routes: [{ name: "Main", params: { screen: "Home" } }],
    });

  } catch (error) {
    console.error("❌ Google Sign-In Error Details:", error);
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
