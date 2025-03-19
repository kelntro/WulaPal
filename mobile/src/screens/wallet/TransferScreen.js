import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const TransferScreen = () => {
  const navigation = useNavigation();

  const handleAutoContribution = () => {
    alert('Contribution deducted from balance.');
    navigation.goBack();
  };

  const handlePayout = () => {
    alert('Payout sent to member.');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer Funds</Text>
      <TouchableOpacity style={styles.button} onPress={handleAutoContribution}>
        <Text style={styles.buttonText}>Pay Contribution</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handlePayout}>
        <Text style={styles.buttonText}>Distribute Payout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#F4F8F7' },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: '#2E7D32', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default TransferScreen;
