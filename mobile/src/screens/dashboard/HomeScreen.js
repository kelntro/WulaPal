import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AnimatedButton from '../../components/Button'; // Custom animated button
import { useNavigation } from '@react-navigation/native';

const upcomingContributions = [
  { id: '1', group: 'Group A', date: 'April 10', amount: '₱1,000' },
  { id: '2', group: 'Group B', date: 'April 12', amount: '₱1,000' },
  { id: '3', group: 'Group C', date: 'April 16', amount: '₱1,000' },
  { id: '4', group: 'Group D', date: 'April 20', amount: '₱1,000' },
  { id: '5', group: 'Group E', date: 'April 25', amount: '₱1,000' },
];

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* User Greeting and Balance */}
      <Text style={styles.greeting}>Hi, Micheal!</Text>
      <Text style={styles.balance}>₱15,615.00</Text>

      {/* Upcoming Contributions */}
      <Text style={styles.sectionTitle}>Upcoming Contributions</Text>
      <FlatList
        data={upcomingContributions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.groupName}>{item.group}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
        )}
      />

      {/* Animated Button */}
      <AnimatedButton onPress={() => navigation.navigate('Wallet')} title="Go to Wallet" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F8F7' },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  balance: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupName: { fontWeight: 'bold' },
  date: { color: '#888' },
  amount: { fontWeight: 'bold', color: '#2E7D32' },
});

export default HomeScreen;
