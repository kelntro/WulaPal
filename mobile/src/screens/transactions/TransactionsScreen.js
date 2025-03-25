import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('week');
  const navigation = useNavigation();

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        throw new Error('User ID is missing from AsyncStorage');
      }

      const res = await axios.get(
        `http://10.0.2.2:5050/api/wallet/transactions?userId=${parsedUser._id}`,
      );

      const formatted = res.data.map((tx, index) => {
        const date = new Date(tx.timestamp);
        return {
          id: tx._id,
          name: tx.metadata?.from || tx.metadata?.to || 'You',
          amount: `₱${tx.amount.toFixed(2)}`,
          status: tx.status,
          referenceId: tx.referenceId,
          type: tx.type,
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
          raw: tx,
        };
      });

      setTransactions(formatted);
    } catch (err) {
      console.error('[TRANSACTIONS] Error fetching:', err.message);
      Alert.alert('Error', 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, []),
  );

  const renderTypeText = (type, name) => {
    switch (type) {
      case 'deposit':
        return `${name} Deposited`;
      case 'withdraw':
        return `${name} Withdrew`;
      case 'transfer':
        return `Sent to ${name}`;
      case 'receive':
        return `Received from ${name}`;
      default:
        return 'Transaction';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'week') {
      const now = new Date();
      const txDate = new Date(tx.raw.timestamp);
      const diffInDays = (now - txDate) / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'week' && styles.activeTab]}
          onPress={() => setActiveTab('week')}>
          <Text style={styles.tabText}>This week</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'month' && styles.activeTab]}
          onPress={() => setActiveTab('month')}>
          <Text style={styles.tabText}>This month</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.transactionCard}
              onPress={() =>
                navigation.navigate('TransactionDetails', {transaction: item})
              }>
              <Image
                source={require('../../assets/transaction-icon.png')}
                style={styles.icon}
              />
              <View style={styles.details}>
                <Text style={styles.name}>
                  {renderTypeText(item.type, item.name)}
                </Text>
                <Text style={styles.transactionId}>
                  Reference No: {item.referenceId}
                </Text>
                <Text style={styles.date}>
                  {item.date} • {item.time}
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={styles.amount}>{item.amount}</Text>
                <Text style={styles.status}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F8F7', padding: 16},
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#D3E6D4',
    marginHorizontal: 5,
  },
  activeTab: {backgroundColor: '#4CAF50'},
  tabText: {color: '#FFF', fontWeight: 'bold'},
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {width: 40, height: 40, marginRight: 10},
  details: {flex: 1},
  name: {fontSize: 16, fontWeight: 'bold', color: '#2E7D32'},
  transactionId: {fontSize: 12, color: '#666'},
  date: {fontSize: 12, color: '#999'},
  amountContainer: {alignItems: 'flex-end'},
  amount: {fontSize: 16, fontWeight: 'bold', color: '#2E7D32'},
  status: {fontSize: 12, color: '#4CAF50'},
});

export default TransactionsScreen;
