import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform ,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getMessaging} from '@react-native-firebase/messaging';
import {getApp} from '@react-native-firebase/app';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {API_BASE_URL} from '@env';

const ProfileScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            activeTab === 'info' && styles.toggleActive,
          ]}
          onPress={() => setActiveTab('info')}>
          <Text
            style={[
              styles.toggleText,
              activeTab === 'info' && styles.toggleTextActive,
            ]}>
            Info
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            activeTab === 'settings' && styles.toggleActive,
          ]}
          onPress={() => setActiveTab('settings')}>
          <Text
            style={[
              styles.toggleText,
              activeTab === 'settings' && styles.toggleTextActive,
            ]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' ? (
        <ProfileInfo />
      ) : (
        <ProfileSettings navigation={navigation} />
      )}
    </View>
  );
};

const ProfileInfo = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        const parsed = stored ? JSON.parse(stored) : null;
        if (!parsed || !parsed._id) return;

        const res = await fetch(`${API_BASE_URL}/api/users/${parsed._id}`);
        const data = await res.json();
        setUser(data);
        setForm({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          dateofBirth: data.dateofBirth ? data.dateofBirth.slice(0, 10) : '',
          address: data.address || '',
          country: data.country || '',
        });
      } catch (err) {
        Alert.alert('Error', 'Failed to load user info.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({userId: user._id, ...form}),
      });

      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || 'Update failed');

      setUser(updated);
      setEditMode(false);
      await AsyncStorage.setItem('user', JSON.stringify(updated));
      Alert.alert('Success', 'Profile updated.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading || !user) {
    return <ActivityIndicator size="large" color="#2E7D32" style={{flex: 1}} />;
  }

  return (
    <ScrollView
      style={styles.scrollBody}
      contentContainerStyle={{paddingBottom: 30}}>
      <View style={styles.section}>
        <View style={styles.profilePicture}>
          <Image
            source={require('../assets/Profile.jpg')}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editPic}
            onPress={() => setEditMode(!editMode)}>
            <MaterialCommunityIcons
              name={editMode ? 'check-circle-outline' : 'circle-edit-outline'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoField}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoValue}>{user._id}</Text>
            </View>
            <Feather name="copy" size={20} color="#3A6953" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        {[
  {label: 'Full Name', key: 'name'},
  {label: 'Date of Birth', key: 'dateofBirth', isDate: true},
  {label: 'Country', key: 'country'},
  {label: 'Mobile Number', key: 'mobile'},
  {label: 'Email Address', key: 'email'},
  {label: 'Home Address', key: 'address'},
].map((item, index) => (
  <View key={index} style={styles.infoRow}>
    <View style={styles.infoField}>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{item.label}</Text>
        {editMode ? (
          item.isDate ? (
            <>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={{ paddingVertical: 4 }}
              >
                <Text style={styles.infoValue}>
                  {form.dateofBirth || 'Select Date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.dateofBirth ? new Date(form.dateofBirth) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setForm(prev => ({
                        ...prev,
                        dateofBirth: selectedDate.toISOString().split('T')[0],
                      }));
                    }
                  }}
                />
              )}
            </>
          ) : (
            <TextInput
              value={form[item.key]}
              onChangeText={text =>
                setForm(prev => ({...prev, [item.key]: text}))
              }
              style={{fontSize: 15, color: '#333', fontWeight: '600'}}
            />
          )
        ) : (
          <Text style={styles.infoValue}>{form[item.key]}</Text>
        )}
      </View>
      {editMode && (
        <MaterialCommunityIcons
          name="circle-edit-outline"
          size={20}
          color="#3A6953"
        />
      )}
    </View>
  </View>
))}

        {editMode && (
          <TouchableOpacity onPress={handleSave} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const ProfileSettings = ({navigation}) => {
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleLogout = async () => {
    console.log("🚪 Logging out...");
    setLoadingLogout(true);
  
    try {
      const fcmToken = await getMessaging(getApp()).getToken();
      const user = await AsyncStorage.getItem("user");
      const userObj = user ? JSON.parse(user) : null;
  
      console.log("📤 FCM Token to delete:", fcmToken);
      console.log("📤 User from AsyncStorage:", userObj);
  
      // Only call remove-fcm-token if we have values
      if (fcmToken && userObj?._id) {
        const res = await fetch(`${API_BASE_URL}/api/users/remove-fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: userObj._id, fcmToken }),
        });
  
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to remove FCM token.");
        }
  
        console.log("✅ FCM token removed from backend.");
      } else {
        console.warn("⚠️ Skipped FCM removal — missing token or userId.");
      }
  
      // ✅ Clear session storage
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      console.log("✅ AsyncStorage cleared");
  
      // ✅ Firebase logout (if any)
      try {
        await auth().signOut();
        console.log("✅ Firebase sign-out complete");
      } catch (error) {
        if (error.code === "auth/no-current-user") {
          console.warn("⚠️ Already signed out from Firebase");
        } else {
          console.error("❌ Firebase SignOut Error:", error);
        }
      }
  
      // ✅ Google Signout
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        console.log("✅ Google sign-out and revoke access complete");
      } catch (error) {
        console.error("❌ Google SignOut Error:", error);
      }
    } catch (error) {
      console.error("❌ Logout error:", error.message);
      Alert.alert("Logout Failed", error.message);
    } finally {
      setLoadingLogout(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  };  
  
  
  

  return (
    <ScrollView
      style={styles.scrollBody}
      contentContainerStyle={{paddingBottom: 30}}>
      <View style={styles.sectionSettings}>
        <Text style={styles.sectionTitle}>Security</Text>
        {[
          'Change Pin Code',
          'Change Password',
          'Link to Bank',
          'Terms and Condition',
          'Privacy Policy',
        ].map((item, index) => (
          <View key={index} style={styles.settingRow}>
            <Text style={styles.settingLabel}>{item}</Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#3A6953"
            />
          </View>
        ))}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loadingLogout}>
          {loadingLogout ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.logoutText}>Log out</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
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
  toggleActive: {backgroundColor: '#6A8C73'},
  toggleText: {fontSize: 14, fontWeight: '600', color: '#3A6953'},
  toggleTextActive: {color: '#ffffff'},
  scrollBody: {flex: 1},
  section: {paddingHorizontal: 20, marginTop: 0, backgroundColor: '#DBE7DF'},
  sectionSettings: {paddingHorizontal: 20, backgroundColor: '#DBE7DF'},
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
    right: Dimensions.get('window').width / 2 - 60,
    backgroundColor: '#3A6953',
    borderRadius: 20,
    padding: 6,
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
  infoContent: {flexDirection: 'column'},
  infoLabel: {fontSize: 12, color: '#777'},
  infoValue: {fontSize: 15, fontWeight: '600', color: '#333'},
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
