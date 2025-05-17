import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from '@env';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('month');
  const navigation = useNavigation();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      if (!parsedUser || !parsedUser._id) throw new Error('Missing user ID');

      const res = await axios.get(`${API_BASE_URL}/api/wallet/transactions?userId=${parsedUser._id}`);

      const formatted = res.data.map((tx) => {
        const date = new Date(tx.timestamp || tx.createdAt);
        return {
          id: tx._id,
          name: tx.metadata?.from || tx.metadata?.to || 'You',
          amount: tx.amount.toFixed(2),
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
      console.error('[TRANSACTIONS] Error:', err.message);
      Alert.alert('Error', 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchTransactions(); }, []));

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

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'week') {
      const now = new Date();
      const txDate = new Date(tx.raw.timestamp || tx.raw.createdAt);
      const diffInDays = (now - txDate) / (1000 * 60 * 60 * 24);
      return diffInDays <= 7;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction History</Text>

      {/* Tabs */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, activeTab === 'week' && styles.activeFilter]}
          onPress={() => setActiveTab('week')}>
          <Text style={[styles.filterText, activeTab === 'week' && styles.activeFilterText]}>
            This week
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, activeTab === 'month' && styles.activeFilter]}
          onPress={() => setActiveTab('month')}>
          <Text style={[styles.filterText, activeTab === 'month' && styles.activeFilterText]}>
            This month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sortButton}>
          <Ionicons name="filter" size={22} color="#3A6953" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3A6953" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {filteredTransactions.map((item) => (
            <View key={item.id} style={styles.transactionCard}>
              {/* Left Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="card" size={28} color="#ffffff" />
              </View>

              {/* Details */}
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionName}>{renderTypeText(item.type, item.name)}</Text>
                <Text style={styles.transactionId}>Transaction ID</Text>
                <Text style={styles.transactionIdNumber}>{item.referenceId}</Text>
                <View style={styles.dateTimeRow}>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                  <Text style={styles.transactionTime}>{item.time}</Text>
                </View>
              </View>

              {/* Right Side */}
              <View style={styles.amountStatus}>
                <Text style={styles.amountText}>₱ {item.amount}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 20, paddingTop: 20 },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3A6953',
    textAlign: 'center',
    marginBottom: 20,
  },
  filters: { flexDirection: 'row', marginBottom: 15 },
  filterButton: {
    backgroundColor: '#F0F4F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    left: -5,
  },
  activeFilter: { backgroundColor: '#6A8C73' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#3A6953' },
  activeFilterText: { color: '#ffffff' },
  sortButton: {
    marginLeft: 85,
    backgroundColor: '#ffffff',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
  },
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: '#DBE7DF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#9BB3A7',
  },
  iconContainer: {
    backgroundColor: '#3A6953',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  transactionDetails: { flex: 1 },
  transactionName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  transactionId: { fontSize: 12, color: '#777' },
  transactionIdNumber: { fontSize: 12, color: '#333333', fontWeight: '600', marginBottom: 5 },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  transactionDate: { fontSize: 12, color: '#777' },
  transactionTime: { fontSize: 12, color: '#777' },
  amountStatus: { alignItems: 'flex-end' },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#A8E6CF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A6953',
  },
});

export default TransactionsScreen;
