import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://your-backend-ip:5000/api/wallet'; // Replace with your backend URL

const WithdrawScreen = () => {
  const [amount, setAmount] = useState('');
  const [gcashNumber, setGcashNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || amount <= 0 || !gcashNumber) {
      Alert.alert('Invalid Input', 'Please enter a valid amount and GCash number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/withdraw`, {
        amount,
        gcashNumber
      });

      Alert.alert('Withdrawal Successful', response.data.message);
    } catch (error) {
      Alert.alert('Error', 'Withdrawal failed.');
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
        placeholder="Enter GCash Number"
        keyboardType="numeric"
        value={gcashNumber}
        onChangeText={setGcashNumber}
      />
      <TouchableOpacity style={styles.button} onPress={handleWithdraw} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Withdraw</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F4F8F7' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, fontSize: 16, marginBottom: 20 },
  button: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default WithdrawScreen;
