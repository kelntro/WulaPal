import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const DepositSuccessScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>🎉 Deposit Successful!</Text>
      <Text style={styles.message}>Your wallet has been credited.</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          }
          >
        <Text style={styles.buttonText}>Go to Wallet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F8F7',
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  message: {fontSize: 16, color: '#555', marginBottom: 30},
  button: {backgroundColor: '#3A6953', padding: 15, borderRadius: 8},
  buttonText: {color: '#fff', fontWeight: 'bold'},
});

export default DepositSuccessScreen;
