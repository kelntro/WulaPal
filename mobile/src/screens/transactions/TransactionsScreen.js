import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const transactionsWeek = [
  {
    id: '1',
    name: 'Alejane Pelandas',
    amount: '₱1,350.00',
    status: 'confirmed',
    transactionId: '698043741317',
    date: '17 Sep 2023',
    time: '11:21 AM',
  },
  {
    id: '2',
    name: 'Rey Heloerintino',
    amount: '₱350.00',
    status: 'confirmed',
    transactionId: '643174554317',
    date: '17 Sep 2023',
    time: '11:21 AM',
  },
  {
    id: '3',
    name: 'Miming Pelandas',
    amount: '₱1,350.00',
    status: 'confirmed',
    transactionId: '694317554317',
    date: '17 Sep 2023',
    time: '11:21 AM',
  },
  {
    id: '4',
    name: 'Rey Pelandas',
    amount: '₱1,150.00',
    status: 'confirmed',
    transactionId: '69804371317',
    date: '17 Sep 2023',
    time: '11:21 AM',
  },
];

const transactionsMonth = [...transactionsWeek]; // Mock data for now

const TransactionsScreen = () => {
  const [activeTab, setActiveTab] = useState('week');
  const navigation = useNavigation();

  const transactions = activeTab === 'week' ? transactionsWeek : transactionsMonth;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'week' && styles.activeTab]} 
          onPress={() => setActiveTab('week')}
        >
          <Text style={styles.tabText}>This week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'month' && styles.activeTab]} 
          onPress={() => setActiveTab('month')}
        >
          <Text style={styles.tabText}>This month</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.transactionCard}
            onPress={() => navigation.navigate('TransactionDetails', { transaction: item })}
          >
            <Image source={require('../../assets/transaction-icon.png')} style={styles.icon} />
            <View style={styles.details}>
              <Text style={styles.name}>{item.name} Contributed</Text>
              <Text style={styles.transactionId}>Transaction ID: {item.transactionId}</Text>
              <Text style={styles.date}>{item.date} • {item.time}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amount}>{item.amount}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7',
    padding: 16,
  },
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
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
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
  icon: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  transactionId: {
    fontSize: 12,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  status: {
    fontSize: 12,
    color: '#4CAF50',
  },
});

export default TransactionsScreen;
