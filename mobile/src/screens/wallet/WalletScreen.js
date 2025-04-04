import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedButton from '../../components/Button';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native'; // ✅ Automatically refresh when screen is focused
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:5050/api/wallet'; // ✅ Use backend URL

const WalletScreen = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    try {
        setLoading(true);

        const user = await AsyncStorage.getItem("user");
        const parsedUser = user ? JSON.parse(user) : null;

        if (!parsedUser || !parsedUser._id) {
            console.error("[WALLET] Error: User ID is missing.");
            return;
        }

        console.log(`[WALLET] Fetching balance for userId: ${parsedUser._id}`);

        const response = await axios.get(`${API_BASE_URL}/balance`, {
            params: { userId: parsedUser._id }
        });

        // ✅ Ensure response contains a valid balance
        if (response.data?.balance === undefined || response.data?.balance === null) {
            throw new Error("Invalid response: No balance field found.");
        }

        console.log(`[WALLET] Retrieved balance: ₱${response.data.balance}`);
        setBalance(response.data.balance); // ✅ Update balance

    } catch (error) {
        console.error("[WALLET] Error fetching balance:", error.response?.data || error.message);

        // ✅ If balance is not found, set it to 0 instead of showing an error
        if (error.response?.status === 404) {
            console.warn("[WALLET] No wallet found, setting balance to 0.");
            setBalance(0);
        } else {
            Alert.alert("Error", "Failed to fetch wallet balance. Please try again.");
        }
    } finally {
        setLoading(false);
    }
};

  // ✅ Automatically fetch balance when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.balanceTitle}>Available Balance</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" />
      ) : (
          <Text style={styles.balance}>
            ₱{Number(balance).toFixed(2).toLocaleString()}
          </Text>
      )}

      <View style={styles.buttonContainer}>
        <AnimatedButton
          title="Deposit"
          onPress={() => navigation.navigate('DepositScreen')}
        />
        <AnimatedButton
          title="Transfer"
          onPress={() => navigation.navigate('TransferScreen')}
        />
        <AnimatedButton
          title="Withdraw"
          onPress={() => navigation.navigate('WithdrawScreen')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#F4F8F7'},
  balanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
  },
  balance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
});

export default WalletScreen;
