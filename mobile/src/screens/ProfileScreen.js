import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import { Dimensions } from 'react-native';
import { API_BASE_URL } from '@env';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      {/* Toggle Tabs */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'info' && styles.toggleActive]}
          onPress={() => setActiveTab('info')}>
          <Text style={[styles.toggleText, activeTab === 'info' && styles.toggleTextActive]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'settings' && styles.toggleActive]}
          onPress={() => setActiveTab('settings')}>
          <Text style={[styles.toggleText, activeTab === 'settings' && styles.toggleTextActive]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? <ProfileInfo /> : <ProfileSettings navigation={navigation} />}
    </View>
  );
};

const ProfileInfo = () => {
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const loadUserId = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        setUserId(parsedUser._id);
      }
    };
    loadUserId();
  }, []);

  return (
    <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.section}>
        <View style={styles.profilePicture}>
          <Image
            source={require('../assets/Profile.jpg')} // ✅ replace with your actual image path
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editPic}>
            <MaterialCommunityIcons name="circle-edit-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoField}>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Number</Text>
                <Text style={styles.infoValue}>{userId}</Text>
              </View>
              <Feather name="copy" size={20} color="#3A6953" />
            </View>
          </View>
        </View>

        <View style={styles.infoPerBlock}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {[
            { label: 'Full Name', value: 'Michael Santos' },
            { label: 'Date of Birth', value: 'May 25, 2000' },
            { label: 'Country of Birth', value: 'Philippines' },
            { label: 'Username', value: 'MicSantos' },
            { label: 'Mobile Number', value: '+63 915 222 1568', editable: true },
            { label: 'Email Address', value: 'Mainideas@gmail.com', editable: true },
            { label: 'Home Address', value: '34 Veloso St. Obrero, Buhangin, Davao del Sur', editable: true },
          ].map((item, index) => (
            <View key={index} style={styles.infoRow}>
              <View style={styles.infoField}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{item.label}</Text>
                  <Text style={styles.infoValue}>{item.value}</Text>
                </View>
                {item.editable && (
                  <MaterialCommunityIcons name="circle-edit-outline" size={20} color="#3A6953" />
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const ProfileSettings = ({ navigation }) => {
  const [loadingLogout, setLoadingLogout] = useState(false);
  
  const handleLogout = async () => {
    console.log("🚪 Logging out...");
    setLoadingLogout(true); // ✅ Start Loading
    try {
      const fcmToken = await getMessaging(getApp()).getToken();
      if (fcmToken) {
        await fetch(`${API_BASE_URL}/api/users/remove-fcm-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fcmToken }),
        });
        console.log("✅ FCM token deleted");
      }

      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log("✅ AsyncStorage cleared");

      try {
        await auth().signOut();
        console.log("✅ Firebase sign-out complete");
      } catch (error) {
        if (error.code === 'auth/no-current-user') {
          console.warn("⚠️ No current user in Firebase Auth (already signed out)");
        } else {
          console.error("❌ Firebase SignOut Error:", error);
        }
      }

      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        console.log("✅ Google sign-out and revoke access complete");
      } catch (error) {
        console.error("❌ Google SignOut Error:", error);
      }

    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      setLoadingLogout(false); // ✅ Stop loading after everything
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 30 }}>
      <View style={styles.sectionSettings}>
        <View style={styles.infoSetBlock}>
          <Text style={styles.sectionTitle}>Security</Text>
          {['Change Pin Code', 'Change Password', 'Link to Bank', 'Terms and Condition', 'Privacy Policy'].map((item, index) => (
            <View key={index} style={styles.settingRow}>
              <Text style={styles.settingLabel}>{item}</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#3A6953" />
            </View>
          ))}

<TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loadingLogout}>
            {loadingLogout ? (
              <ActivityIndicator size="small" color="#fff" /> // ✅ Show spinner if logging out
            ) : (
              <Text style={styles.logoutText}>Log out</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3A6953',
    textAlign: 'center',
    marginTop: 60,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F3',
    borderRadius: 30,
    padding: 4,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 45,
    borderRadius: 30,
  },
  toggleActive: {
    backgroundColor: '#6A8C73',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A6953',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  scrollBody: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 0,
    backgroundColor: '#DBE7DF',
  },
  sectionSettings: {
    paddingHorizontal: 20,
    backgroundColor: '#DBE7DF',
  },
  profilePicture: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editPic: {
    position: 'absolute',
    bottom: 0,
    right: Dimensions?.get('window')?.width / 2 - 60,
    backgroundColor: '#3A6953',
    borderRadius: 20,
    padding: 6,
  },
  infoBlock: {
    marginBottom: 15,
  },
  infoSetBlock: {
    marginBottom: 200,
    marginTop: 20,
  },
  infoPerBlock: {
    marginBottom: 70,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3A6953',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9BB3A7',
  },
  infoField: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  infoContent: {
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: 12,
    color: '#777',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4F3',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9BB3A7',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#3A6953',
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
