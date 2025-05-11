import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TransferScreen = () => {
  const navigation = useNavigation();
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!recipientId || !amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid recipient ID and amount.");
      return;
    }

    setLoading(true);
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

      const response = await axios.post(`${API_BASE_URL}/api/wallet/transfer`, payload);

      Alert.alert("Success", "Transfer completed successfully.");
      navigation.goBack();
    } catch (error) {
      console.error("[TRANSFER] Error:", error.response?.data || error.message);
      Alert.alert("Transfer Failed", error.response?.data?.message || "An error occurred.");
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
              <Icon name="swap-horiz" size={40} color="#2E7D32" />
              <Text style={styles.title}>Transfer Funds</Text>
              <Text style={styles.subtitle}>Send money to another member</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Recipient ID</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person" size={20} color="#2E7D32" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient's ID"
                    value={recipientId}
                    onChangeText={setRecipientId}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount (PHP)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Icon name="security" size={24} color="#2E7D32" />
                  <Text style={styles.infoText}>Secure Transfer</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="access-time" size={24} color="#2E7D32" />
                  <Text style={styles.infoText}>Instant Processing</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleTransfer}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Send Money</Text>
                <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
              </TouchableOpacity>
            </View>
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
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A6953',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A6953',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#3A6953',
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3A6953',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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

export default TransferScreen;
