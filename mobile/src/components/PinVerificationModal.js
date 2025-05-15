import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '@env';

const PinVerificationModal = ({ visible, onClose, onSuccess, userId }) => {
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

      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
      setPin('');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Icon name="lock" size={40} color="#3A6953" />
            <Text style={styles.title}>Enter PIN</Text>
            <Text style={styles.subtitle}>Please enter your PIN to continue</Text>
          </View>

          <TextInput
            style={styles.input}
            keyboardType="numeric"
            secureTextEntry
            maxLength={6}
            value={pin}
            onChangeText={setPin}
            placeholder="Enter your 6-digit PIN"
            placeholderTextColor="#999"
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.verifyButton]}
              onPress={handleVerifyPin}
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'Verifying...' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A6953',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#3A6953',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
    color: '#3A6953',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  verifyButton: {
    backgroundColor: '#3A6953',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PinVerificationModal; 