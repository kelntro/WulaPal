import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const TransactionDetailsScreen = ({route}) => {
  const {transaction} = route.params;

  const getTypeLabel = type => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdrawal';
      case 'transfer':
        return 'Transfer Sent';
      case 'receive':
        return 'Transfer Received';
      default:
        return 'Transaction';
    }
  };

  const formatAmount = amount => {
    const num = Number(amount.replace(/[^\d.-]/g, ''));
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const statusColor =
    transaction.status === 'confirmed' ? '#4CAF50' : '#FF9800';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Details</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Type</Text>
          <Text style={styles.value}>{getTypeLabel(transaction.type)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={[styles.value, styles.amount]}>
            {formatAmount(transaction.amount)}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, {color: statusColor}]}>
            {transaction.status.toUpperCase()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Reference No</Text>
          <Text style={styles.value}>{transaction.referenceId}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{transaction.date}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{transaction.time}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F4F8F7', padding: 20},
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export default TransactionDetailsScreen;
