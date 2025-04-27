import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

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
  
      // 1️⃣ Fetch user's current balance first
      const balanceBefore = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
        params: { userId: parsedUser._id },
      });
  
      const previousBalance = balanceBefore.data.balance || 0;
  
      console.log("[DEPOSIT] Previous balance:", previousBalance);
  
      // 2️⃣ Create Deposit Invoice
      const response = await axios.post(`${API_BASE_URL}/api/wallet/deposit`, {
        amount,
        userId: parsedUser._id
      });
  
      const { checkout_url } = response.data;
  
      if (!checkout_url) {
        throw new Error("No checkout URL received.");
      }
  
      // 3️⃣ Open the checkout page
      Alert.alert("Payment Link", "Redirecting to payment page...");
      await Linking.openURL(checkout_url);
  
      // 4️⃣ Start polling every 5 seconds to check if deposit is credited
      const intervalId = setInterval(async () => {
        console.log("🔄 Polling wallet balance...");
  
        try {
          const balanceRes = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
            params: { userId: parsedUser._id },
          });
  
          const currentBalance = balanceRes.data.balance;
  
          console.log(`[DEPOSIT] Current balance: ₱${currentBalance}`);
  
          if (currentBalance > previousBalance) {
            console.log("✅ Payment detected! Wallet credited!");
  
            clearInterval(intervalId); // ✅ Stop polling
  
            // 5️⃣ Navigate to success page
            navigation.reset({
              index: 0,
              routes: [{ name: "DepositSuccessScreen" }], // ✅ Customize your success page name
            });
          }
        } catch (pollError) {
          console.error("🔴 Error polling balance:", pollError.message);
        }
  
      }, 5000); // Every 5 seconds
  
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
 