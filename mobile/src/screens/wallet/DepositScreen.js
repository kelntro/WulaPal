import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.0.2.2:5050/api/wallet';


const DepositScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
        Alert.alert("Invalid Amount", "Please enter a valid deposit amount in PHP.");
        return;
    }

    setLoading(true);
    console.log("[DEPOSIT] Sending deposit request with amount:", amount);

    try {
        const user = await AsyncStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;

        if (!parsedUser || !parsedUser._id) {
            throw new Error("User ID is missing. Please log in again.");
        }

        const response = await axios.post(`${API_BASE_URL}/deposit`, {
            amount,
            userId: parsedUser._id // ✅ Ensure `userId` is included
        });

        console.log("[DEPOSIT] API Response:", response.data);

        const { checkout_url } = response.data;

        if (checkout_url) {
            Alert.alert("Payment Link", "Redirecting to payment page...");
            Linking.openURL(checkout_url);
        } else {
            throw new Error("No checkout URL received.");
        }
    } catch (error) {
        Alert.alert("Error", error.message);
        console.error("[DEPOSIT] Error:", error.response?.data || error.message);
    } finally {
        setLoading(false);
    }
};
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Deposit Funds</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount in PHP"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TouchableOpacity style={styles.button} onPress={handleDeposit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Proceed to Payment</Text>}
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

export default DepositScreen;
 