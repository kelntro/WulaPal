import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}>
          <Text style={styles.tabText}>👤 Info</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}>
          <Text style={styles.tabText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? <ProfileInfo /> : <ProfileSettings navigation={navigation} />}
    </View>
  );
};

// Profile Information Section (No Vertical Centering)
const ProfileInfo = () => {
  const [userId, setUserId] = useState('');
  useEffect(() => {
    const fetchUserId = async () => {
      const user = await AsyncStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser._id); // Use .userId if that's your field instead
      }
    };
    fetchUserId();
  }, []);

  return (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.avatarContainer}>
        <Image source={require('../assets/Profile.jpg')} style={styles.avatar} />
      </View>

      <Text style={styles.sectionTitle}>Account Information</Text>
      <View style={styles.inputBox}>
        <Text style={styles.label}>Account Number</Text>
        <TextInput value={userId} editable={false} style={styles.input} />
      </View>
      <Text style={styles.sectionTitle}>Personal Information</Text>
      <View style={styles.inputBox}><Text style={styles.label}>Full Name</Text><TextInput value="Michael Santos" editable={false} style={styles.input} /></View>
      <View style={styles.inputBox}><Text style={styles.label}>Date of Birth</Text><TextInput value="May 25, 2000" editable={false} style={styles.input} /></View>
      <View style={styles.inputBox}><Text style={styles.label}>Country</Text><TextInput value="Philippines" editable={false} style={styles.input} /></View>
      <View style={styles.inputBox}><Text style={styles.label}>Username</Text><TextInput value="MicSantos" editable={false} style={styles.input} /></View>
      <View style={styles.inputBox}><Text style={styles.label}>Mobile Number</Text><TextInput value="+63 915 222 1568" editable={false} style={styles.input} /></View>
      <View style={styles.inputBox}><Text style={styles.label}>Email</Text><TextInput value="Mainideas@gmail.com" editable={false} style={styles.input} /></View>
      <View style={styles.inputBox}><Text style={styles.label}>Home Address</Text><TextInput value="34 Veloso St. Obrero, Buhangin, Davao del Sur" editable={false} style={styles.input} /></View>
    </ScrollView>
  );
};

// Profile Settings Section with Functional Logout
const ProfileSettings = ({ navigation }) => {
  const handleLogout = async () => {
    try {
      // Get current FCM token
      const fcmToken = await getMessaging(getApp()).getToken();
  
      // 🚫 Remove token from backend
      await fetch("http://10.0.2.2:5050/api/users/remove-fcm-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcmToken }),
      });
  
      // 🧹 Optionally delete token on device
      await getMessaging(getApp()).deleteToken();
  
      // 🧼 Clear session
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
  
      Alert.alert("Logged Out", "You have been successfully logged out.", [
        { text: "OK", onPress: () => navigation.reset({ index: 0, routes: [{ name: "Login" }] }) },
      ]);
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Try again.");
    }
  };

  return (
    <ScrollView style={styles.settingsContainer}>
      <Text style={styles.sectionTitle}>Security</Text>
      {['Change Pin Code', 'Change Password', 'Link to Bank', 'Terms and Conditions', 'Privacy Policy'].map((item, index) => (
        <TouchableOpacity key={index} style={styles.settingButton}>
          <Text style={styles.settingText}>{item}</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8F7', padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 10 },
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#D3E6D4', marginHorizontal: 5 },
  activeTab: { backgroundColor: '#4CAF50' },
  tabText: { color: '#FFF', fontWeight: 'bold' },

  // Profile Info Styles
  profileContainer: { paddingVertical: 10 }, // ✅ Removed Vertical Centering
  avatarContainer: { alignItems: 'center', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', marginTop: 10, marginBottom: 5 },
  inputBox: { backgroundColor: '#FFF', padding: 10, borderRadius: 5, marginBottom: 5 },
  label: { fontSize: 14, color: '#666' },
  input: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  // Settings Styles
  settingsContainer: { paddingVertical: 10 }, // ✅ Removed Vertical Centering
  settingButton: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 12, borderRadius: 5, marginBottom: 5 },
  settingText: { fontSize: 16, color: '#333' },
  arrow: { fontSize: 18, color: '#666' },
  logoutButton: { backgroundColor: '#2E7D32', paddingVertical: 10, alignItems: 'center', borderRadius: 5, marginTop: 10 },
  logoutText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default ProfileScreen;
