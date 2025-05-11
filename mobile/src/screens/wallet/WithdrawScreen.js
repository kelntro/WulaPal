import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const WithdrawScreen = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [channel, setChannel] = useState('PH_GCASH');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success'); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));

  const showModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      if (modalType === 'success') {
        navigation.goBack();
      }
    });
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || amount <= 0 || !mobileNumber) {
      showModal('error', 'Please enter a valid amount and mobile number.');
      return;
    }

    setLoading(true);
    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        throw new Error('User ID is missing. Please log in again.');
      }

      const response = await axios.post(`${API_BASE_URL}/api/wallet/withdraw`, {
        amount,
        mobileNumber,
        userId: parsedUser._id,
        channel
      });

      showModal('success', response.data.message || 'Withdrawal completed successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      showModal('error', errorMessage);
    }
    setLoading(false);
  };

  const renderPaymentMethod = (method, icon, label) => (
    <TouchableOpacity
      style={[
        styles.paymentMethod,
        channel === method && styles.selectedPaymentMethod
      ]}
      onPress={() => setChannel(method)}
    >
      <View style={styles.paymentMethodContent}>
        <Icon name={icon} size={24} color={channel === method ? '#fff' : '#3A6953'} />
        <Text style={[
          styles.paymentMethodText,
          channel === method && styles.selectedPaymentMethodText
        ]}>
          {label}
        </Text>
      </View>
      {channel === method && (
        <Icon name="check-circle" size={24} color="#fff" />
      )}
    </TouchableOpacity>
  );

  const renderModal = () => (
    <Modal
      transparent
      visible={modalVisible}
      animationType="fade"
      onRequestClose={hideModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.modalContent,
            { opacity: fadeAnim }
          ]}
        >
          <View style={[
            styles.modalIconContainer,
            { backgroundColor: modalType === 'success' ? 'rgba(58, 105, 83, 0.1)' : 'rgba(211, 47, 47, 0.1)' }
          ]}>
            <Icon 
              name={modalType === 'success' ? 'check-circle' : 'error'} 
              size={40} 
              color={modalType === 'success' ? '#3A6953' : '#D32F2F'} 
            />
          </View>
          
          <Text style={[
            styles.modalTitle,
            { color: modalType === 'success' ? '#3A6953' : '#D32F2F' }
          ]}>
            {modalType === 'success' ? 'Success!' : 'Error'}
          </Text>
          
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          
          <TouchableOpacity
            style={[
              styles.modalButton,
              { backgroundColor: modalType === 'success' ? '#3A6953' : '#D32F2F' }
            ]}
            onPress={hideModal}
          >
            <Text style={styles.modalButtonText}>
              {modalType === 'success' ? 'Done' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Icon name="account-balance-wallet" size={40} color="#3A6953" />
              <Text style={styles.title}>Withdraw Funds</Text>
              <Text style={styles.subtitle}>Transfer to your preferred payment method</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount (PHP)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="phone" size={20} color="#3A6953" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your mobile number"
                    keyboardType="numeric"
                    value={mobileNumber}
                    onChangeText={setMobileNumber}
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Select Withdrawal Method</Text>
              
              <View style={styles.paymentMethodsContainer}>
                {renderPaymentMethod('PH_GCASH', 'account-balance', 'GCash')}
                {renderPaymentMethod('PH_MAYA', 'account-balance', 'Maya')}
                {renderPaymentMethod('PH_BANK', 'account-balance', 'Bank Transfer')}
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Icon name="security" size={24} color="#3A6953" />
                  <Text style={styles.infoText}>Secure Withdrawal</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="access-time" size={24} color="#3A6953" />
                  <Text style={styles.infoText}>Instant Processing</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleWithdraw}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Confirm Withdrawal</Text>
                    <Icon name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F8F7',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3A6953',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A6953',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3A6953',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    color: '#3A6953',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A6953',
    marginBottom: 16,
  },
  paymentMethodsContainer: {
    marginBottom: 24,
  },
  paymentMethod: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPaymentMethod: {
    backgroundColor: '#3A6953',
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#3A6953',
    marginLeft: 12,
    fontWeight: '500',
  },
  selectedPaymentMethodText: {
    color: '#fff',
  },
  infoContainer: {
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A6953',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3A6953',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WithdrawScreen;
