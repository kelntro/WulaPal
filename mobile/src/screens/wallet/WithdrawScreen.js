import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:5050/api/wallet';

const WithdrawScreen = () => {
  const [amount, setAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [channel, setChannel] = useState('PH_GCASH'); // Default to GCash
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || amount <= 0 || !mobileNumber) {
      Alert.alert('Invalid Input', 'Please enter a valid amount and mobile number.');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        throw new Error('User ID is missing. Please log in again.');
      }

      const response = await axios.post(`${API_BASE_URL}/withdraw`, {
        amount,
        mobileNumber,
        userId: parsedUser._id,
        channel // ✅ Pass selected payout channel
      });

      Alert.alert('Withdrawal Successful', response.data.message);
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', error.response.data.message || 'Withdrawal failed.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
      console.error('Withdraw error:', error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Withdraw Funds</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount in PHP"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Mobile Number"
        keyboardType="numeric"
        value={mobileNumber}
        onChangeText={setMobileNumber}
      />

      <Text style={styles.label}>Select Withdrawal Method</Text>
      <TouchableOpacity
        style={[styles.button, channel === "PH_GCASH" && styles.selectedButton]}
        onPress={() => setChannel("PH_GCASH")}>
        <Text style={styles.buttonText}>GCash</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, channel === "PH_MAYA" && styles.selectedButton]}
        onPress={() => setChannel("PH_MAYA")}>
        <Text style={styles.buttonText}>Maya</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, channel === "PH_BANK" && styles.selectedButton]}
        onPress={() => setChannel("PH_BANK")}>
        <Text style={styles.buttonText}>Bank Transfer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleWithdraw}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Confirm Withdraw</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F4F8F7',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  selectedButton: {
    backgroundColor: '#1B5E20',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WithdrawScreen;
