import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit'; // ✅ Chart library
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { API_BASE_URL } from '@env';

const WalletScreen = () => {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [income, setIncome] = useState(0);
  const [contribution, setContribution] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(Array(12).fill(0)); // Real monthly data

  const fetchWalletData = async () => {
    try {
      setLoading(true);

      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        console.error('[WALLET] Error: User ID is missing.');
        return;
      }

      const balanceRes = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
        params: { userId: parsedUser._id },
      });

      setBalance(balanceRes.data.balance || 0);

      const txnRes = await axios.get(`${API_BASE_URL}/api/wallet/transactions`, {
        params: { userId: parsedUser._id },
      });

      const txns = txnRes.data || [];

      let totalIncome = 0;
      let totalContribution = 0;
      let monthly = Array(12).fill(0); // Reset monthly array

      txns.forEach((txn) => {
        const date = new Date(txn.timestamp || txn.createdAt);
        const month = date.getMonth(); // 0 = January, 11 = December

        if (txn.type === 'deposit' || txn.type === 'receive') {
          totalIncome += txn.amount || 0;
          monthly[month] += txn.amount || 0; // Add to monthly total
        } else if (txn.type === 'transfer') {
          totalContribution += txn.amount || 0;
        }
      });

      setIncome(totalIncome);
      setContribution(totalContribution);
      setMonthlyIncome(monthly);
      setTransactions(txns.slice(0, 5)); // Recent 3 txns

    } catch (error) {
      console.error('[WALLET] Error fetching wallet data:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to fetch wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Notification */}
      <View style={styles.notificationWrapper}>
        <TouchableOpacity style={styles.notificationIcon} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications" size={25} color="#3A6953" />
        </TouchableOpacity>
      </View>

      {/* Balance */}
      <View style={styles.balanceWrapper}>
        <Text style={styles.label}>Available Balance</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3A6953" style={{ marginTop: 10 }} />
        ) : (
          <Text style={styles.amount}>
            ₱{(typeof balance === 'number' ? balance : 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        )}
      </View>

      {/* Buttons */}
      <View style={styles.actionWrapper}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('DepositScreen')}>
          <Text style={styles.actionText}>Deposit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('TransferScreen')}>
          <Text style={styles.actionText}>Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('WithdrawScreen')}>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollBody} contentContainerStyle={{ paddingBottom: 70 }} showsVerticalScrollIndicator={false}>
        <View style={styles.statisticContainer}>
          <Text style={styles.statisticTitle}>Statistic Overview</Text>
          <Text style={styles.dateRange}>Real-time updated</Text>

          <View style={styles.summaryBoxes}>
            <View style={styles.summaryBox}>
              <Feather name="trending-down" size={20} color="#3A6953" />
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValue}>₱{income.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Feather name="trending-up" size={20} color="#3A6953" />
              <Text style={styles.summaryLabel}>Transfer</Text>
              <Text style={styles.summaryValue}>₱{contribution.toLocaleString()}</Text>
            </View>
          </View>

          {/* 📊 Monthly Income Chart */}
          <View style={styles.chartWrapper}>
            <Text style={styles.chartTitle}>Monthly Income</Text>
            <LineChart
              data={{
                labels: ['Jn', 'Fb', 'Mr', 'Ar', 'My', 'Jn', 'Jl', 'Ag', 'Sp', 'Ot', 'Nv', 'Dc'],
                datasets: [{ data: monthlyIncome }]
              }}
              width={Dimensions.get('window').width - 90}
              height={200}
              chartConfig={{
                backgroundGradientFrom: '#6A8C73',
                backgroundGradientTo: '#6A8C73',
                color: () => `#99C6A9`,
                labelColor: () => '#ffffff',
                strokeWidth: 2,
              }}
              bezier
              style={{ borderRadius: 20 }}
            />
          </View>

          {/* 🕒 Recent Contributions */}
          <Text style={styles.recentTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>No transactions found.</Text>
          ) : (
            transactions.map((item, idx) => (
              <View key={idx} style={styles.contributionItem}>
                <View>
                  <Text style={styles.contributionText}>
                    {item.type === 'deposit' && 'Deposited'}
                    {item.type === 'receive' && 'Received'}
                    {item.type === 'transfer' && 'Transfer'}
                    {item.type === 'refund' && 'Refund'}
                    {item.type === 'payout' && 'Payout'}
                    {item.type === 'payout_share' && 'Payout Share'}
                  </Text>
                  <Text style={styles.contributionDate}>
                    {new Date(item.timestamp || item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.contributionAmount}>
                  {(item.type === 'deposit' || item.type === 'receive' || item.type === 'refund' || item.type === 'payout' || item.type === 'payout_share') ? '+' : '-'} ₱{(item.amount || 0).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingHorizontal: 0,
  },
  notificationWrapper: {
    alignItems: 'flex-end',
  },
  notificationIcon: {
    paddingRight: 15,
  },
  balanceWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  label: {
    fontSize: 15,
    color: '#999999',
  },
  amount: {
    fontSize: 45,
    color: '#3A6953',
    fontWeight: '800',
    marginTop: -5,
  },
  actionWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 15,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A6953',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E5F0E9',
    marginHorizontal: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#3A6953',
    fontWeight: 'bold',
  },
  scrollBody: {
    marginTop: 20,
    flex: 1,
  },
  statisticContainer: {
    marginTop: 25,
    backgroundColor: '#DBE7DF',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  statisticTitle: {
    fontSize: 18,
    textAlign: 'center',
    backgroundColor: '#3A6953',
    color: 'white',
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 10,
    marginTop: -10,
  },
  dateRange: {
    fontSize: 14,
    color: '#3A6953',
    textAlign: 'center',
    marginBottom: 20,
  },
  summaryBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryBox: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#3A6953',
    padding: 15,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 20,
    color: '#3A6953',
    marginTop: 4,
    fontWeight: 'bold',
  },
  chartWrapper: {
    backgroundColor: '#6A8C73',
    padding: 15,
    borderRadius: 20,
  },
  chartTitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 20,
    color: '#3A6953',
    marginVertical: 10,
    fontWeight: 'bold',
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9BB3A7',
    alignItems: 'center',
  },
  contributionText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  contributionDate: {
    fontSize: 12,
    color: '#999999',
  },
  contributionAmount: {
    fontSize: 14,
    color: '#3A6953',
    fontWeight: 'bold',
  },
});

export default WalletScreen;
