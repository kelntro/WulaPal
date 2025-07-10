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
import PinVerificationModal from '../../components/PinVerificationModal';

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
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [withdrawalDetails, setWithdrawalDetails] = useState(null);

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

  const validateMobileNumber = (number) => {
    // Remove any non-digit characters (spaces, dashes, etc.)
    const cleanNumber = number.replace(/\D/g, '');
    
    // Check if it's a valid mobile number (10-11 digits)
    return /^\d{10,11}$/.test(cleanNumber);
  };

  const formatMobileNumber = (number) => {
    // Remove any non-digit characters
    const cleanNumber = number.replace(/\D/g, '');
    return cleanNumber;
  };

  const handleWithdraw = async () => {
    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) < 100) {
      showModal('error', 'Minimum withdrawal amount is ₱100.00');
      return;
    }

    // Validate mobile number
    if (!mobileNumber) {
      showModal('error', 'Please enter your mobile number.');
      return;
    }

    // Clean the mobile number before validation
    const cleanMobileNumber = mobileNumber.replace(/\D/g, '');
    if (!validateMobileNumber(cleanMobileNumber)) {
      showModal('error', 'Please enter a valid mobile number (10-11 digits)');
      return;
    }

    try {
      const user = await AsyncStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        throw new Error('User ID is missing. Please log in again.');
      }

      // Store withdrawal details and show PIN modal
      setPendingWithdrawal({
        amount: Number(amount),
        mobileNumber: cleanMobileNumber, // Use the cleaned number
        userId: parsedUser._id,
        channel
      });
      setShowPinModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      showModal('error', errorMessage);
    }
  };

  const executeWithdrawal = async () => {
    if (!pendingWithdrawal) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/withdraw`, pendingWithdrawal);
      
      // Set withdrawal details for receipt
      setWithdrawalDetails({
        amount: pendingWithdrawal.amount,
        mobileNumber: `+63${pendingWithdrawal.mobileNumber}`,
        timestamp: new Date().toISOString(),
        referenceId: response.data.referenceId || `withdraw-${Date.now()}`,
        channel: pendingWithdrawal.channel
      });

      // Show receipt modal
      setShowReceipt(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      showModal('error', errorMessage);
    }
    setLoading(false);
    setPendingWithdrawal(null);
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

  const ReceiptModal = () => (
    <Modal
      visible={showReceipt}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>Withdrawal Receipt</Text>
            <Text style={styles.receiptSubtitle}>Transaction Successful</Text>
          </View>

          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>₱{withdrawalDetails?.amount.toLocaleString()}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Mobile Number</Text>
              <Text style={styles.receiptValue}>{withdrawalDetails?.mobileNumber}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date & Time</Text>
              <Text style={styles.receiptValue}>
                {withdrawalDetails?.timestamp ? new Date(withdrawalDetails.timestamp).toLocaleString() : ''}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Reference ID</Text>
              <Text style={styles.receiptValue}>{withdrawalDetails?.referenceId}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Channel</Text>
              <Text style={styles.receiptValue}>
                {withdrawalDetails?.channel === 'PH_GCASH' ? 'GCash' :
                 withdrawalDetails?.channel === 'PH_MAYA' ? 'Maya' : 'Bank Transfer'}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Status</Text>
              <Text style={[styles.receiptValue, styles.statusText]}>Completed</Text>
            </View>
          </View>

          <View style={styles.receiptFooter}>
            <View style={styles.securityInfo}>
              <Icon name="security" size={16} color="#666" />
              <Text style={styles.securityText}>Secure Transaction</Text>
            </View>

            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                setShowReceipt(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
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
                <Text style={styles.minAmountText}>Minimum amount: ₱100.00</Text>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="phone" size={20} color="#6A8C73" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="09XX XXX XXXX"
                    keyboardType="numeric"
                    value={mobileNumber}
                    onChangeText={(text) => setMobileNumber(formatMobileNumber(text))}
                    placeholderTextColor="#999"
                    maxLength={12} // 09XX XXX XXXX format
                  />
                </View>
                <Text style={styles.helperText}>Format: 09XX XXX XXXX</Text>
              </View>

              <Text style={styles.sectionTitle}>Select Withdrawal Method</Text>
              
              <View style={styles.paymentMethodsContainer}>
                {renderPaymentMethod('PH_GCASH', 'account-balance', 'GCash')}
                {renderPaymentMethod('PH_MAYA', 'account-balance', 'Maya')}
                {renderPaymentMethod('PH_BANK', 'account-balance', 'Bank Transfer')}
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Icon name="security" size={24} color="#6A8C73" />
                  <Text style={styles.infoText}>Secure Withdrawal</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="access-time" size={24} color="#6A8C73" />
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
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderModal()}

      <PinVerificationModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingWithdrawal(null);
        }}
        onSuccess={executeWithdrawal}
        userId={pendingWithdrawal?.userId}
      />

      <ReceiptModal />
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
    marginTop: 50,
  },
  container: {
    flex: 1,
    paddingHorizontal: 26,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
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
    borderColor: '#6A8C73',
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
    borderColor: '#6A8C73',
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
  minAmountText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  receiptContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A6953',
    marginBottom: 8,
  },
  receiptSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  receiptDetails: {
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  receiptLabel: {
    fontSize: 16,
    color: '#666',
  },
  receiptValue: {
    fontSize: 16,
    color: '#3A6953',
    fontWeight: '600',
  },
  statusText: {
    color: '#4CAF50',
  },
  receiptFooter: {
    alignItems: 'center',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: '#3A6953',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WithdrawScreen;
