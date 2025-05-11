import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Icon name="account-balance-wallet" size={40} color="#2E7D32" />
              <Text style={styles.title}>Deposit Funds</Text>
              <Text style={styles.subtitle}>Add money to your wallet securely</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount (PHP)</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholderTextColor="#999"
                />
              </View>
              <Text style={styles.helperText}>Enter the amount you wish to deposit</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Icon name="security" size={24} color="#2E7D32" />
                <Text style={styles.infoText}>Secure Payment Processing</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="access-time" size={24} color="#2E7D32" />
                <Text style={styles.infoText}>Instant Credit After Payment</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleDeposit} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Proceed to Payment</Text>
                  <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8F7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
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
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A6953',
    marginBottom: 8,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A6953',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 20,
    paddingVertical: 16,
    color: '#3A6953',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#3A6953',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});

export default DepositScreen;
 