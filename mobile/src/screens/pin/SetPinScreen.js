import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';

const SetPinScreen = ({ route }) => {
  const { userId } = route.params;
  const navigation = useNavigation();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSavePin = async () => {
    if (pin.length !== 6 || confirmPin.length !== 6) {
      Alert.alert('Invalid', 'PIN must be exactly 6 digits.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('Mismatch', 'PINs do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/set-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pinCode: pin }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save PIN');

      Alert.alert('Success', 'Your PIN has been set.', [
        {
          text: 'Continue',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'ProfileScreen' }],
            }),
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding' })}
    >
      <Text style={styles.title}>Set Your 6-Digit PIN</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter PIN"
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={pin}
        onChangeText={setPin}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm PIN"
        secureTextEntry
        keyboardType="numeric"
        maxLength={6}
        value={confirmPin}
        onChangeText={setConfirmPin}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSavePin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Saving...' : 'Save PIN'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default SetPinScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 30,
    color: '#3A6953',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    width: '80%',
    borderBottomWidth: 2,
    borderBottomColor: '#3A6953',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 25,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#3A6953',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
