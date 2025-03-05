import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AnimatedButton from '../../components/Button'; // Custom animated button
import { useNavigation } from '@react-navigation/native';

const WalletScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.balanceTitle}>Available Balance</Text>
      <Text style={styles.balance}>₱15,615.00</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <AnimatedButton title="Deposit" onPress={() => {}} />
        <AnimatedButton title="Transfer" onPress={() => {}} />
        <AnimatedButton title="Withdraw" onPress={() => {}} />
      </View>

      {/* Income & Contribution Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={styles.statValue}>₱5,000</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Contribution</Text>
          <Text style={styles.statValue}>₱1,000</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F8F7' },
  balanceTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center' },
  balance: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32', textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statBox: { backgroundColor: '#fff', padding: 15, borderRadius: 10, width: '48%', alignItems: 'center' },
  statLabel: { fontSize: 16, color: '#555' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
});

export default WalletScreen;
