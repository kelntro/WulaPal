import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:5050/api/wallet';

const TransferScreen = () => {
  const navigation = useNavigation();
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');

  const handleTransfer = async () => {
    if (!recipientId || !amount || isNaN(amount)) {
      Alert.alert("Error", "Please enter a valid recipient and amount.");
      return;
    }

    try {
      const user = await AsyncStorage.getItem("user");
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const payload = {
        senderId: parsedUser._id,
        recipientId,
        amount: Number(amount)
      };

      const response = await axios.post(`${API_BASE_URL}/transfer`, payload);

      Alert.alert("Success", "Transfer completed.");
      navigation.goBack();
    } catch (error) {
      console.error("[TRANSFER] Error:", error.response?.data || error.message);
      Alert.alert("Transfer Failed", error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer to Another Member</Text>

      <TextInput
        style={styles.input}
        placeholder="Recipient User ID"
        value={recipientId}
        onChangeText={setRecipientId}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (₱)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleTransfer}>
        <Text style={styles.buttonText}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F4F8F7' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
  },
  button: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default TransferScreen;
