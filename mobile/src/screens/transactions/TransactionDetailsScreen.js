import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TransactionDetailsScreen = ({ route }) => {
  const { transaction } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Transaction Details</Text>
      <Text style={styles.detail}>Name: {transaction.name}</Text>
      <Text style={styles.detail}>Amount: {transaction.amount}</Text>
      <Text style={styles.detail}>Status: {transaction.status}</Text>
      <Text style={styles.detail}>Transaction ID: {transaction.transactionId}</Text>
      <Text style={styles.detail}>Date: {transaction.date}</Text>
      <Text style={styles.detail}>Time: {transaction.time}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFF',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    color: '#333',
    marginVertical: 5,
  },
});

export default TransactionDetailsScreen;
