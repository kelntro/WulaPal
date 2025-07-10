import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PinVerificationModal from '../../components/PinVerificationModal';

const TransferScreen = () => {
  const navigation = useNavigation();
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [validatingRecipient, setValidatingRecipient] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [transferDetails, setTransferDetails] = useState(null);

  const validateRecipient = async (id) => {
    if (!id) return false;
    
    setValidatingRecipient(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users/check/${id}`);
      return response.data.exists;
    } catch (error) {
      return false;
    } finally {
      setValidatingRecipient(false);
    }
  };

  const handleTransfer = async () => {
    // Validate amount
    if (!amount || isNaN(amount) || Number(amount) < 10) {
      Alert.alert("Invalid Amount", "Minimum transfer amount is ₱10.00");
      return;
    }

    // Validate recipient ID
    if (!recipientId) {
      Alert.alert("Invalid Input", "Please enter a recipient ID.");
      return;
    }

    setLoading(true);
    try {
      // Check if recipient exists
      const recipientExists = await validateRecipient(recipientId);
      if (!recipientExists) {
        Alert.alert("Invalid Recipient", "Recipient ID not found. Please check and try again.");
        return;
      }

      const user = await AsyncStorage.getItem("user");
      const parsedUser = user ? JSON.parse(user) : null;

      if (!parsedUser || !parsedUser._id) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      // Check if trying to transfer to self
      if (parsedUser._id === recipientId) {
        Alert.alert("Invalid Transfer", "You cannot transfer to yourself.");
        return;
      }

      // Store transfer details and show PIN modal
      setPendingTransfer({
        senderId: parsedUser._id,
        recipientId,
        amount: Number(amount)
      });
      setShowPinModal(true);
    } catch (error) {
      console.error("[TRANSFER] Error:", error);
      Alert.alert("Error", "Failed to process transfer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const executeTransfer = async () => {
    if (!pendingTransfer) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/wallet/transfer`, pendingTransfer);
      
      // Set transfer details for receipt
      setTransferDetails({
        amount: pendingTransfer.amount,
        recipientId: pendingTransfer.recipientId,
        timestamp: new Date().toISOString(),
        referenceId: response.data.referenceId || `transfer-${Date.now()}`
      });

      // Show receipt modal
      setShowReceipt(true);
    } catch (error) {
      console.error("[TRANSFER] Error:", error.response?.data || error.message);
      Alert.alert("Transfer Failed", error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
      setPendingTransfer(null);
    }
  };

  const ReceiptModal = () => (
    <Modal
      visible={showReceipt}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.receiptContainer}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>Transfer Receipt</Text>
            <Text style={styles.receiptSubtitle}>Transaction Successful</Text>
          </View>

          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>₱{transferDetails?.amount.toLocaleString()}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Recipient ID</Text>
              <Text style={styles.receiptValue}>{transferDetails?.recipientId}</Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date & Time</Text>
              <Text style={styles.receiptValue}>
                {transferDetails?.timestamp ? new Date(transferDetails.timestamp).toLocaleString() : ''}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Reference ID</Text>
              <Text style={styles.receiptValue}>{transferDetails?.referenceId}</Text>
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
              <Icon name="swap-horiz" size={40} color="#3A6953" />
              <Text style={styles.title}>Transfer Funds</Text>
              <Text style={styles.subtitle}>Send money to another member</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Recipient ID</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person" size={20} color="#6A8C73" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter recipient's ID"
                    value={recipientId}
                    onChangeText={setRecipientId}
                    placeholderTextColor="#999"
                  />
                  {validatingRecipient && (
                    <ActivityIndicator size="small" color="#6A8C73" />
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Amount (PHP)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencySymbol}>₱</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
                <Text style={styles.minAmountText}>Minimum amount: ₱10.00</Text>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Icon name="security" size={24} color="#6A8C73" />
                  <Text style={styles.infoText}>Secure Transfer</Text>
                </View>
                <View style={styles.infoItem}>
                  <Icon name="access-time" size={24} color="#6A8C73" />
                  <Text style={styles.infoText}>Instant Processing</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleTransfer}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Send Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PinVerificationModal
        visible={showPinModal}
        onClose={() => {
          setShowPinModal(false);
          setPendingTransfer(null);
        }}
        onSuccess={executeTransfer}
        userId={pendingTransfer?.senderId}
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
  minAmountText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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

export default TransferScreen;
