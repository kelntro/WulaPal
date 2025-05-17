import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const PinCodeScreen = ({ navigation, route }) => {
  const { userId, onSuccess } = route.params;
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDigitPress = (digit) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleVerifyPin = async () => {
    if (pin.length !== 6) return;

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

      if (typeof onSuccess === 'function') {
        onSuccess();
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainApp' }] });
      }
    } catch (err) {
      Alert.alert('Error', err.message);
      setTimeout(() => setPin(''), 500); // Reset after short delay
    } finally {
      setLoading(false);
    }
  };

  const renderCircles = () => {
    return (
      <View style={styles.circles}>
        {Array.from({ length: 6 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.circle,
              i < pin.length ? styles.filledCircle : styles.emptyCircle,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderKeypad = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

    return (
      <View style={styles.keypad}>
        {digits.map((digit) => (
          <TouchableOpacity
            key={digit}
            style={styles.digitButton}
            onPress={() => handleDigitPress(digit)}
          >
            <Text style={styles.digitText}>{digit}</Text>
          </TouchableOpacity>
        ))}

        {/* Spacer */}
        <View style={styles.digitButton} />

        {/* 0 */}
        <TouchableOpacity
          style={styles.digitButton}
          onPress={() => handleDigitPress('0')}
        >
          <Text style={styles.digitText}>0</Text>
        </TouchableOpacity>

        {/* Backspace */}
        <TouchableOpacity style={styles.digitButton} onPress={handleBackspace}>
          <Text style={[styles.digitText, { fontSize: 20 }]}>⌫</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please enter your</Text>
      <Text style={styles.subtitle}>Pin Code</Text>
      <Text style={styles.setLabel}>Set Pin Code (6-digit)</Text>

      {renderCircles()}
      {renderKeypad()}

      <TouchableOpacity
        style={[
          styles.loginButton,
          pin.length === 6 ? styles.loginEnabled : styles.loginDisabled,
        ]}
        onPress={handleVerifyPin}
        disabled={loading || pin.length < 6}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginText}>Log In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PinCodeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf9',
    alignItems: 'center',
    paddingTop: 70,
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 18,
    color: '#3A6953',
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
    marginBottom: 20,
  },
  setLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  circles: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e0e0e0',
  },
  filledCircle: {
    backgroundColor: '#3A6953',
  },
  emptyCircle: {
    backgroundColor: '#e0e0e0',
  },
  keypad: {
    width: '90%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 15,
    columnGap: 15,
    marginBottom: 50,
  },
  digitButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: '#3A6953',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitText: {
    fontSize: 22,
    color: '#3A6953',
    fontWeight: 'bold',
  },
  loginButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginEnabled: {
    backgroundColor: '#3A6953',
  },
  loginDisabled: {
    backgroundColor: '#A3B8AB',
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
