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
  Platform,
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
import {Picker} from '@react-native-picker/picker';
import {launchCamera} from 'react-native-image-picker';
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
  const [profileImage, setProfileImage] = useState(null);

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
          address: typeof data.address === 'string' ? JSON.parse(data.address) : data.address || {
            street: '', barangay: '', city: '', province: '', zipCode: ''
          },
          country: data.country || '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          sourceOfFunds: data.sourceOfFunds || '',
          nationalIdNumber: data.nationalIdNumber || '',
          emergencyContactName: typeof data.emergencyContact === 'string'
            ? JSON.parse(data.emergencyContact).name || ''
            : data.emergencyContact?.name || '',
          emergencyContactMobile: typeof data.emergencyContact === 'string'
            ? JSON.parse(data.emergencyContact).mobile || ''
            : data.emergencyContact?.mobile || '',
        });        
      } catch (err) {
        Alert.alert('Error', 'Failed to load user info.');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleCapturePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'front',
    });
    if (!result.didCancel && result.assets?.length > 0) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleSave = async () => {
    // Simple validation
    const requiredFields = [
      'name',
      'email',
      'mobile',
      'dateofBirth',
      'country',
      'gender',
      'occupation',
      'sourceOfFunds',
      'nationalIdNumber',
      'emergencyContactName',
      'emergencyContactMobile',
      'address.street',
      'address.barangay',
      'address.city',
      'address.province',
      'address.zipCode',
    ];

    const getNestedValue = (obj, path) => {
      return path.split('.').reduce((acc, key) => acc?.[key], obj);
    };

    for (const field of requiredFields) {
      const value = getNestedValue(form, field);
      if (!value || value.trim?.() === '') {
        Alert.alert(
          'Missing Info',
          `Please fill out the ${field.replace(/([A-Z])/g, ' $1')} field.`,
        );
        return;
      }
    }    

    // National ID format validation
    const nationalIdRegex = /^[0-9]{12}$/;
    if (!nationalIdRegex.test(form.nationalIdNumber)) {
      Alert.alert(
        'Invalid National ID',
        'National ID number must be exactly 12 digits.',
      );
      return;
    }

    try {
      const payload = {
        userId: user._id,
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        dateofBirth: form.dateofBirth,
        address: form.address,
        country: form.country,
        gender: form.gender,
        occupation: form.occupation,
        sourceOfFunds: form.sourceOfFunds,
        nationalIdNumber: form.nationalIdNumber,
        emergencyContact: {
          name: form.emergencyContactName,
          mobile: form.emergencyContactMobile,
        },
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value)); // for address/emergencyContact
        } else {
          formData.append(key, value);
        }
      });
      formData.append('userId', payload.userId);

      if (profileImage) {
        formData.append('profileImage', {
          uri: profileImage.uri,
          type: profileImage.type,
          name: profileImage.fileName || 'profile.jpg',
        });
      }

      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PATCH',
        headers: {'Content-Type': 'multipart/form-data'},
        body: formData,
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
      contentContainerStyle={{paddingBottom: 120}}>
      <View style={styles.section}>
        <View style={styles.profilePicture}>
        <Image
  source={
    profileImage?.uri
      ? { uri: profileImage.uri }
      : user?.profileImage
      ? { uri: `${API_BASE_URL}${user.profileImage}` }
      : require('../assets/Profile.jpg')
  }
  style={styles.profileImage}
  onError={() => console.log('⚠️ Failed to load profile image')}
  resizeMode="cover"
/>


<TouchableOpacity
  style={styles.editPic}
  onPress={editMode ? handleCapturePhoto : () => setEditMode(true)}
>
  <MaterialCommunityIcons
    name={editMode ? 'camera' : 'circle-edit-outline'}
    size={20}
    color="#fff"
  />
</TouchableOpacity>


{editMode && (
  <TouchableOpacity
    style={[styles.editPic, { right: 30 }]} // offset to avoid overlap
    onPress={handleSave}
  >
    <MaterialCommunityIcons
      name="check-circle-outline"
      size={20}
      color="#fff"
    />
  </TouchableOpacity>
)}

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
          {label: 'Gender', key: 'gender'},
          {label: 'Mobile Number', key: 'mobile'},
          {label: 'Email Address', key: 'email'},
          {label: 'Country', key: 'country'},
          {label: 'Occupation', key: 'occupation'},
          {label: 'Source of Funds', key: 'sourceOfFunds'},
          {label: 'National ID Number', key: 'nationalIdNumber'},
          {label: 'Emergency Contact Name', key: 'emergencyContactName'},
          {label: 'Emergency Contact Mobile', key: 'emergencyContactMobile'},
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
                        style={{paddingVertical: 4}}>
                        <Text style={styles.infoValue}>
                          {form.dateofBirth || 'Select Date'}
                        </Text>
                      </TouchableOpacity>
                      {showDatePicker && (
                        <DateTimePicker
                          value={
                            form.dateofBirth
                              ? new Date(form.dateofBirth)
                              : new Date()
                          }
                          mode="date"
                          display="default"
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (selectedDate) {
                              setForm(prev => ({
                                ...prev,
                                dateofBirth: selectedDate
                                  .toISOString()
                                  .split('T')[0],
                              }));
                            }
                          }}
                        />
                      )}
                    </>
                  ) : item.key === 'gender' ? (
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#ccc',
                        borderRadius: 5,
                        backgroundColor: '#fff',
                      }}>
                      <Picker
                        selectedValue={form.gender}
                        onValueChange={value =>
                          setForm(prev => ({...prev, gender: value}))
                        }>
                        <Picker.Item label="Select Gender" value="" />
                        <Picker.Item label="Male" value="Male" />
                        <Picker.Item label="Female" value="Female" />
                        <Picker.Item label="Other" value="Other" />
                      </Picker>
                    </View>
                  ) : (
                    <TextInput
                      value={form[item.key]}
                      onChangeText={text =>
                        setForm(prev => ({...prev, [item.key]: text}))
                      }
                      style={styles.input}
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

        {/* 📍 Address Fields */}
        <View style={styles.infoRow}>
          <View style={styles.infoField}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Home Address</Text>
              {editMode ? (
                <>
                  <TextInput
                    placeholder="Street"
                    value={form.address?.street}
                    onChangeText={text =>
                      setForm(prev => ({
                        ...prev,
                        address: {...prev.address, street: text},
                      }))
                    }
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Barangay"
                    value={form.address?.barangay}
                    onChangeText={text =>
                      setForm(prev => ({
                        ...prev,
                        address: {...prev.address, barangay: text},
                      }))
                    }
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="City/Municipality"
                    value={form.address?.city}
                    onChangeText={text =>
                      setForm(prev => ({
                        ...prev,
                        address: {...prev.address, city: text},
                      }))
                    }
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Province"
                    value={form.address?.province}
                    onChangeText={text =>
                      setForm(prev => ({
                        ...prev,
                        address: {...prev.address, province: text},
                      }))
                    }
                    style={styles.input}
                  />
                  <TextInput
                    placeholder="Zip Code"
                    keyboardType="numeric"
                    value={form.address?.zipCode}
                    onChangeText={text =>
                      setForm(prev => ({
                        ...prev,
                        address: {...prev.address, zipCode: text},
                      }))
                    }
                    style={styles.input}
                  />
                </>
              ) : (
                <Text style={styles.infoValue}>
                  {[
                    form.address?.street,
                    form.address?.barangay,
                    form.address?.city,
                    form.address?.province,
                    form.address?.zipCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
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
    console.log('🚪 Logging out...');
    setLoadingLogout(true);

    try {
      const fcmToken = await getMessaging(getApp()).getToken();
      const user = await AsyncStorage.getItem('user');
      const userObj = user ? JSON.parse(user) : null;

      console.log('📤 FCM Token to delete:', fcmToken);
      console.log('📤 User from AsyncStorage:', userObj);

      if (fcmToken && userObj?._id) {
        try {
          const res = await fetch(
            `${API_BASE_URL}/api/users/remove-fcm-token`,
            {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({userId: userObj._id, fcmToken}),
            },
          );

          if (res.ok) {
            console.log('✅ FCM token removed from backend.');
          } else {
            const data = await res.json();
            console.warn('⚠️ Could not remove FCM token:', data?.error);
          }
        } catch (innerErr) {
          console.warn(
            '⚠️ Skipped FCM removal (likely user was deleted):',
            innerErr.message,
          );
        }
      }

      // ✅ Clear local session
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('✅ AsyncStorage cleared');

      // ✅ Sign out from Firebase Auth
      try {
        await auth().signOut();
        console.log('✅ Firebase sign-out complete');
      } catch (error) {
        if (error.code === 'auth/no-current-user') {
          console.warn('⚠️ Already signed out from Firebase');
        } else {
          console.error('❌ Firebase SignOut Error:', error);
        }
      }

      // ✅ Google Signout and Reset Prompt
      try {
        await GoogleSignin.signOut();
        await GoogleSignin.clearCachedAccessToken(null);
        console.log('✅ Google sign-out and prompt reset complete');
      } catch (error) {
        console.error('❌ Google SignOut Error:', error);
      }
    } catch (error) {
      console.error('❌ Logout error:', error.message);
      Alert.alert('Logout Failed', error.message);
    } finally {
      setLoadingLogout(false);
      navigation.reset({
        index: 0,
        routes: [{name: 'Login'}],
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
