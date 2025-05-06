import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PinCodeScreen = ({ navigation, route }) => {
  const { userId, onSuccess } = route.params;
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyPin = async () => {
    if (pin.length !== 6) {
      Alert.alert('Invalid', 'PIN must be 6 digits');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pinCode: pin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      // ✅ Call the success callback passed from App.js
      if (typeof onSuccess === 'function') {
        onSuccess(); // This sets showPinScreen = false and isAuthenticated = true
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter PIN</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter your 6-digit PIN"
      />
      <TouchableOpacity
        onPress={handleVerifyPin}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verifying...' : 'Unlock'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PinCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: { fontSize: 22, marginBottom: 20, color: '#3A6953' },
  input: {
    width: '80%',
    borderBottomWidth: 2,
    borderBottomColor: '#3A6953',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#3A6953',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
