import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import Icon from 'react-native-vector-icons/Ionicons';

const JoinRequestsScreen = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const user = await AsyncStorage.getItem('user');
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id) return;

      const response = await axios.get(`${API_BASE_URL}/api/groups/join-requests/${parsed._id}`);
      const filteredRequests = response.data.filter(request => {
        if (activeTab === 'pending') return request.status === 'pending';
        if (activeTab === 'approved') return request.status === 'approved';
        if (activeTab === 'declined') return request.status === 'declined';
        return false;
      });
      setRequests(filteredRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to load join requests');
    } finally {
      setLoading(false);
    }
  };

  const handlePayDeposit = async () => {
    if (!selectedRequest || !depositAmount) {
      Alert.alert('Error', 'Please enter a valid deposit amount');
      return;
    }

    try {
      setSubmitting(true);
      const user = await AsyncStorage.getItem('user');
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id) return;

      const response = await axios.post(
        `${API_BASE_URL}/api/groups/${selectedRequest.groupId}/pay-deposit`,
        {
          userId: parsed._id,
          depositAmount: parseFloat(depositAmount)
        }
      );

      if (response.data.success) {
        Alert.alert('Success', 'Deposit paid successfully! You are now a member of the group.');
        setShowDepositModal(false);
        setSelectedRequest(null);
        setDepositAmount('');
        fetchRequests();
      }
    } catch (error) {
      console.error('Error paying deposit:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to pay deposit');
    } finally {
      setSubmitting(false);
    }
  };

  const renderRequestItem = ({ item }) => (
    <TouchableOpacity
      style={styles.requestItem}
      onPress={() => {
        if (item.status === 'approved') {
          setSelectedRequest(item);
          setShowDepositModal(true);
        }
      }}
    >
      <View style={styles.requestHeader}>
        <Text style={styles.groupName}>{item.groupName}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'approved' ? '#4CAF50' : 
                          item.status === 'declined' ? '#F44336' : '#FFC107' }
        ]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.requestDate}>
        Requested on: {new Date(item.requestDate).toLocaleDateString()}
      </Text>
      
      {item.status === 'approved' && (
        <Text style={styles.depositInfo}>
          Required Deposit: ₱{item.depositAmount}
        </Text>
      )}
      
      {item.status === 'declined' && (
        <Text style={styles.declineReason}>
          Reason: {item.declineReason || 'No reason provided'}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Requests</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'declined' && styles.activeTab]}
          onPress={() => setActiveTab('declined')}
        >
          <Text style={[styles.tabText, activeTab === 'declined' && styles.activeTabText]}>
            Declined
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={48} color="#999" />
          <Text style={styles.emptyText}>No {activeTab} requests found</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal
        visible={showDepositModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pay Initial Deposit</Text>
            <Text style={styles.modalSubtitle}>
              Required deposit: ₱{selectedRequest?.depositAmount}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder="Enter deposit amount"
              keyboardType="numeric"
              value={depositAmount}
              onChangeText={setDepositAmount}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDepositModal(false);
                  setSelectedRequest(null);
                  setDepositAmount('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handlePayDeposit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Pay Deposit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    color: '#666',
    fontSize: 14,
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: '#999',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  requestItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestDate: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  depositInfo: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 8,
  },
  declineReason: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default JoinRequestsScreen; 