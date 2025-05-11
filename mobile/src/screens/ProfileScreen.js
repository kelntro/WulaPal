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
  PermissionsAndroid,
  Clipboard,
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
import Modal from 'react-native-modal';
import {API_BASE_URL} from '@env';
import {useFocusEffect} from '@react-navigation/native';
import {BackHandler} from 'react-native';

const ProfileScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [form, setForm] = useState({});

  const canAccessSettings = () => {
    const requiredFields = [
      'name',
      'email',
      'mobile',
      'dateofBirth',
      'country',
      'gender',
      'occupation',
      'sourceOfFunds',
      'idType',
      'idImage',
      'emergencyContactName',
      'emergencyContactMobile',
      'address.street',
      'address.barangay',
      'address.city',
      'address.province',
      'address.zipCode',
    ];

    const getNested = (obj, path) =>
      path.split('.').reduce((acc, key) => acc?.[key], obj);

    return requiredFields.every(field => {
      const value = getNested(form, field);
      return value && value.trim?.() !== '';
    });
  };

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
          onPress={() => {
            if (!canAccessSettings()) {
              Alert.alert(
                'Complete Your Profile',
                'You must complete all required info before accessing settings.',
              );
              return;
            }
            setActiveTab('settings');
          }}>
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
        <ProfileInfo setForm={setForm} form={form} navigation={navigation} />
      ) : (
        <ProfileSettings navigation={navigation} />
      )}
    </View>
  );
};

const ProfileInfo = ({form, setForm, navigation}) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (editMode) {
          Alert.alert(
            'Complete Required Info',
            'You must complete your profile before exiting.',
          );
          return true; // Prevent back action
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove(); // ✅ modern cleanup
    }, [editMode]),
  );

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log("📦 Getting stored user from AsyncStorage...");
        const stored = await AsyncStorage.getItem('user');
        const parsed = stored ? JSON.parse(stored) : null;
        console.log("🔐 Parsed stored user:", parsed);
    
        if (!parsed || !parsed._id) {
          console.warn("⚠️ Missing or invalid user data in AsyncStorage.");
          return;
        }
    
        const url = `${API_BASE_URL}/api/users/${parsed._id}`;
        console.log("🌐 Fetching user from:", url);
    
        const res = await fetch(url);
        console.log("📡 Response status:", res.status);
    
        const data = await res.json();
        console.log("📥 Response data:", data);
    
        if (!res.ok) {
          console.error("❌ Server responded with error:", data?.message || data?.error);
          throw new Error(data?.message || data?.error || 'Unknown server error');
        }
    
        await AsyncStorage.setItem('user', JSON.stringify(data));
        console.log("💾 Updated AsyncStorage with fresh user data");
    
        setUser(data);
    
        setForm({
          name: data.name || '',
          email: data.email || '',
          mobile: data.mobile || '',
          dateofBirth: data.dateofBirth ? data.dateofBirth.slice(0, 10) : '',
          address:
            typeof data.address === 'string'
              ? JSON.parse(data.address)
              : data.address || {
                  street: '',
                  barangay: '',
                  city: '',
                  province: '',
                  zipCode: '',
                },
          country: data.country || '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          sourceOfFunds: data.sourceOfFunds || '',
          idType: data.idType || '',
          idImage: data.idImage || '',
          emergencyContactName:
            typeof data.emergencyContact === 'string'
              ? JSON.parse(data.emergencyContact).name || ''
              : data.emergencyContact?.name || '',
          emergencyContactMobile:
            typeof data.emergencyContact === 'string'
              ? JSON.parse(data.emergencyContact).mobile || ''
              : data.emergencyContact?.mobile || '',
        });
    
        console.log("✅ Form initialized successfully.");
      } catch (err) {
        console.error("❌ loadUser error:", err.message);
        Alert.alert('Error', `Failed to load user info: ${err.message}`);
      } finally {
        console.log("🔚 Finished loadUser()");
        setLoading(false);
      }
    };
    

    loadUser();
  }, []);

  const handleCapturePhoto = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Camera permission is required.');
          return;
        }
      }
    
      const result = await launchCamera({
        mediaType: 'photo',
        cameraType: 'front',
        saveToPhotos: true,
        includeBase64: false,
        quality: 0.8,
        maxWidth: 1000,
        maxHeight: 1000,
      });
    
      if (result.didCancel) {
        console.log('📸 User cancelled camera');
        return;
      }
    
      if (!result.assets || !result.assets[0] || !result.assets[0].uri) {
        Alert.alert('Error', 'Failed to capture image. Please try again.');
        return;
      }
    
      const image = result.assets[0];
      const fileName = image.fileName || `profile_${Date.now()}.${image.uri.split('.').pop()}`;
      const type = image.type || 'image/jpeg';
    
      const safeImage = {
        uri: image.uri,
        fileName,
        type,
      };
    
      setProfileImage(safeImage);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        'Error',
        'Failed to capture photo. Please make sure you have granted camera permissions and try again.'
      );
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
      'idType',
      'emergencyContactName',
      'emergencyContactMobile',
      'address.street',
      'address.barangay',
      'address.city',
      'address.province',
      'address.zipCode',
    ];

    // Check if profile image is captured
    if (!profileImage) {
      Alert.alert(
        'Profile Picture Required',
        'Please capture a profile picture before saving.',
        [
          {
            text: 'Capture Now',
            onPress: handleCapturePhoto
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

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

      formData.append('idType', form.idType);
      if (form.idImage?.uri) {
        formData.append('idImageFile', {
          uri: form.idImage.uri,
          type: form.idImage.type,
          name: form.idImage.name || 'id.jpg',
        });
        
      }
      
      const response = await fetch(`${API_BASE_URL}/api/users/update`, {
        method: 'PATCH',
        headers: {'Content-Type': 'multipart/form-data'},
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      const updated = contentType && contentType.includes('application/json')
        ? await response.json()
        : await response.text(); // fallback to text if not JSON
      
      if (!response.ok) throw new Error(updated?.error || updated || 'Update failed');
      
      if (!response.ok) throw new Error(updated.error || 'Update failed');
      console.log('📤 Upload response:', updated);

      setUser(updated);
      setEditMode(false);

      Alert.alert('Success', 'Profile updated.', [
        {
          text: 'OK',
          onPress: () => {
            setEditMode(false);
            if (!updated.pinCode || updated.pinCode === '') {
              navigation.reset({
                index: 0,
                routes: [{name: 'SetPinScreen', params: {userId: updated._id}}],
              });
            } else {
              console.log('✅ PIN already set, staying on profile');
            }
          },
        },
      ]);
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
                ? (() => {
                    console.log(
                      '📷 Using camera-captured image:',
                      profileImage.uri,
                    );
                    return {uri: profileImage.uri};
                  })()
                : user?.profileImage &&
                  user.profileImage !== 'null' &&
                  user.profileImage !== ''
                ? (() => {
                    const isExternal = user.profileImage.startsWith('http');
                    const remoteUrl = isExternal
                      ? user.profileImage
                      : `${API_BASE_URL}${user.profileImage}`;
                    console.log('🌐 Using remote image URL:', remoteUrl);
                    return {uri: remoteUrl};
                  })()
                : (() => {
                    console.log('🖼️ Using default profile image');
                    return require('../assets/Profile.jpg');
                  })()
            }
            style={styles.profileImage}
            onLoad={() => console.log('✅ Image loaded successfully')}
            onError={e =>
              console.log('❌ Failed to load image:', e.nativeEvent.error)
            }
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.editPic}
            onPress={editMode ? handleCapturePhoto : () => setEditMode(true)}>
            <MaterialCommunityIcons
              name={editMode ? 'camera' : 'circle-edit-outline'}
              size={20}
              color="#fff"
            />
          </TouchableOpacity>

          {editMode && (
            <TouchableOpacity
              style={[styles.editPic, {right: 30}]}
              onPress={handleSave}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color="#fff"
              />
            </TouchableOpacity>
          )}
          
          {editMode && !profileImage && (
            <View style={styles.requiredIndicator}>
              <Text style={styles.requiredText}>Required</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoRow}>
          <View style={styles.infoField}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoValue}>{user._id}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => {
                Clipboard.setString(user._id);
                Alert.alert('Success', 'Account number copied to clipboard');
              }}>
              <Feather name="copy" size={20} color="#3A6953" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        {[
          {label: 'Full Name', key: 'name'},
          {label: 'Date of Birth', key: 'dateofBirth', isDate: true},
          {label: 'Gender', key: 'gender'},
          {label: 'Mobile Number', key: 'mobile', isNumeric: true},
          {label: 'Email Address', key: 'email', disabled: true},
          {label: 'Country', key: 'country'},
          {label: 'Occupation', key: 'occupation'},
          {label: 'Source of Funds', key: 'sourceOfFunds'},
          {label: 'Emergency Contact Name', key: 'emergencyContactName'},
          {label: 'Emergency Contact Mobile', key: 'emergencyContactMobile', isNumeric: true},
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
                    <View style={{flexDirection: 'column', width: '100%'}}>
                      {editMode ? (
                        <>
                          <Text style={[styles.infoValue, {marginBottom: 8}]}>
                            {form.gender || 'Select Gender'}
                          </Text>
                          <View
                            style={{
                              borderWidth: 1,
                              borderColor: '#ccc',
                              borderRadius: 5,
                              backgroundColor: '#fff',
                              height: 40,
                              justifyContent: 'center',
                            }}>
                            <Picker
                              selectedValue={form.gender}
                              onValueChange={value =>
                                setForm(prev => ({...prev, gender: value}))
                              }
                              style={{height: 40, width: '100%'}}>
                              <Picker.Item label="Select Gender" value="" />
                              <Picker.Item label="Male" value="Male" />
                              <Picker.Item label="Female" value="Female" />
                              <Picker.Item label="Other" value="Other" />
                            </Picker>
                          </View>
                        </>
                      ) : (
                        <Text style={styles.infoValue}>{form.gender || '—'}</Text>
                      )}
                    </View>
                  ) : (
                    <TextInput
                      value={form[item.key]}
                      onChangeText={text =>
                        setForm(prev => ({...prev, [item.key]: text}))
                      }
                      style={styles.input}
                      editable={!item.disabled}
                      keyboardType={item.isNumeric ? "numeric" : "default"}
                      maxLength={item.isNumeric ? 11 : undefined}
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
        <View style={styles.infoRow}>
          <View style={styles.infoField}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>ID Type</Text>
              {editMode ? (
                <View style={{flexDirection: 'column', width: '100%'}}>
                  <Text style={[styles.infoValue, {marginBottom: 8}]}>
                    {form.idType || 'Select ID Type'}
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: '#ccc',
                      borderRadius: 5,
                      backgroundColor: '#fff',
                      height: 40,
                      justifyContent: 'center',
                    }}>
                    <Picker
                      selectedValue={form.idType}
                      onValueChange={value =>
                        setForm(prev => ({...prev, idType: value}))
                      }
                      style={{height: 40, width: '100%'}}>
                      <Picker.Item label="Select ID Type" value="" />
                      {[
                        'Philippine National ID (PhilSys)',
                        'Passport',
                        'Driver\'s License',
                        'SSS ID',
                        'GSIS eCard',
                        'UMID',
                        'Voter\'s ID',
                        'PRC ID',
                        'Postal ID',
                        'PhilHealth ID',
                        'TIN ID',
                        'Barangay Certificate with Photo',
                      ].map(type => (
                        <Picker.Item key={type} label={type} value={type} />
                      ))}
                    </Picker>
                  </View>
                </View>
              ) : (
                <Text style={styles.infoValue}>{form.idType || '—'}</Text>
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

        <View style={styles.infoRow}>
          <View style={styles.infoField}>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Upload ID Image</Text>
              {editMode ? (
                <>
                  <TouchableOpacity
                    onPress={async () => {
                      const {launchImageLibrary} = await import('react-native-image-picker');

                      const result = await launchImageLibrary({
                        mediaType: 'photo',
                        includeBase64: false,
                      });

                      if (result.didCancel || !result.assets?.[0]?.uri) {
                        Alert.alert('Upload Cancelled');
                        return;
                      }

                      const image = result.assets[0];
                      setForm(prev => ({
                        ...prev,
                        idImage: {
                          uri: image.uri,
                          name: image.fileName || 'id.jpg',
                          type: image.type || 'image/jpeg',
                        },
                      }));
                    }}

                    style={{
                      backgroundColor: '#3A6953',
                      padding: 8,
                      borderRadius: 5,
                      marginTop: 5,
                    }}>
                    <Text style={{color: '#fff'}}>Capture ID</Text>
                  </TouchableOpacity>

                  {form.idImage?.uri && (
                    <Image
                      source={{uri: form.idImage.uri}}
                      style={{
                        width: 100,
                        height: 100,
                        marginTop: 10,
                        borderRadius: 8,
                        borderColor: '#ccc',
                        borderWidth: 1,
                      }}
                      resizeMode="cover"
                    />
                  )}
                </>
              ) : form.idImage ? (
                <Image
                  source={{
                    uri:
                    typeof form.idImage === 'string'
                      ? form.idImage.startsWith('http')
                        ? form.idImage
                        : `${API_BASE_URL}${form.idImage}`
                      : form.idImage?.uri || '',
                  }}
                  style={{
                    width: 100,
                    height: 100,
                    marginTop: 5,
                    borderRadius: 8,
                    borderColor: '#ccc',
                    borderWidth: 1,
                  }}
                />
              ) : (
                <Text style={styles.infoValue}>—</Text>
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
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changingPin, setChangingPin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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

      await fetch(`${API_BASE_URL}/api/users/last-active/${userObj._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timestamp: new Date().toISOString() })  // pass custom time
      });
      
      
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
        GoogleSignin.configure({
          webClientId:
            '841356244009-icpfsekev3ptc9r73qmee7tn68orqpii.apps.googleusercontent.com',
          offlineAccess: true,
          prompt: 'select_account',
        });

        const tokens = await GoogleSignin.getTokens();
        if (tokens.accessToken) {
          await GoogleSignin.clearCachedAccessToken(tokens.accessToken);
        }

        await GoogleSignin.signOut();

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
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Change Pin Code</Text>
          <TouchableOpacity onPress={() => setShowPinModal(true)}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#3A6953"
            />
          </TouchableOpacity>
          <Modal
            isVisible={showPinModal}
            onBackdropPress={() => setShowPinModal(false)}>
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  color: '#3A6953',
                }}>
                Set 6-digit PIN Code
              </Text>

              <TextInput
                placeholder="Enter PIN"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={pinCode}
                onChangeText={setPinCode}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              />

              <TextInput
                placeholder="Confirm PIN"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                value={confirmPin}
                onChangeText={setConfirmPin}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 20,
                }}
              />

              <TouchableOpacity
                disabled={changingPin}
                onPress={async () => {
                  if (pinCode.length !== 6 || confirmPin.length !== 6) {
                    Alert.alert('Invalid', 'PIN must be exactly 6 digits.');
                    return;
                  }

                  if (pinCode !== confirmPin) {
                    Alert.alert('Mismatch', 'PIN codes do not match.');
                    return;
                  }

                  try {
                    setChangingPin(true);
                    const storedUser = await AsyncStorage.getItem('user');
                    const parsedUser = JSON.parse(storedUser);

                    const res = await fetch(
                      `${API_BASE_URL}/api/auth/set-pin`,
                      {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({userId: parsedUser._id, pinCode}),
                      },
                    );

                    const result = await res.json();
                    if (!res.ok)
                      throw new Error(result.error || 'Failed to set PIN');

                    Alert.alert('Success', 'PIN updated successfully', [
                      {
                        text: 'OK',
                        onPress: () => {
                          setShowPinModal(false);
                          navigation.reset({
                            index: 0,
                            routes: [{name: 'Main'}], // Make sure 'Main' is correctly registered in your navigator
                          });
                        },
                      },
                    ]);
                    
                  } catch (err) {
                    Alert.alert('Error', err.message);
                  } finally {
                    setChangingPin(false);
                    setPinCode('');
                    setConfirmPin('');
                  }
                }}
                style={{
                  backgroundColor: '#3A6953',
                  padding: 12,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  {changingPin ? 'Saving...' : 'Save PIN'}
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Change Password</Text>
          <TouchableOpacity onPress={() => setShowPasswordModal(true)}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#3A6953"
            />
          </TouchableOpacity>
          <Modal
            isVisible={showPasswordModal}
            onBackdropPress={() => setShowPasswordModal(false)}>
            <View
              style={{backgroundColor: 'white', borderRadius: 10, padding: 20}}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  color: '#3A6953',
                }}>
                Change Password
              </Text>

              <TextInput
                placeholder="Current Password"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              />

              <TextInput
                placeholder="New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}
              />

              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={{
                  borderWidth: 1,
                  borderColor: '#ccc',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 20,
                }}
              />

              <TouchableOpacity
                disabled={changingPassword}
                onPress={async () => {
                  if (newPassword !== confirmPassword) {
                    Alert.alert('Mismatch', 'Passwords do not match');
                    return;
                  }
                  try {
                    setChangingPassword(true);
                    const user = await AsyncStorage.getItem('user');
                    const parsed = JSON.parse(user);

                    const res = await fetch(
                      `${API_BASE_URL}/api/auth/change-password`,
                      {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                          userId: parsed._id,
                          currentPassword,
                          newPassword,
                        }),
                      },
                    );

                    const data = await res.json();
                    if (!res.ok)
                      throw new Error(
                        data.error || 'Failed to change password',
                      );

                    Alert.alert('Success', 'Password changed successfully');
                    setShowPasswordModal(false);
                  } catch (err) {
                    Alert.alert('Error', err.message);
                  } finally {
                    setChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }
                }}
                style={{
                  backgroundColor: '#3A6953',
                  padding: 12,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  {changingPassword ? 'Saving...' : 'Save Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Terms and Conditions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#3A6953"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#3A6953"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>About WulaPal</Text>
          <TouchableOpacity onPress={() => navigation.navigate('About')}>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#3A6953"
            />
          </TouchableOpacity>
        </View>

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
  requiredIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requiredText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
