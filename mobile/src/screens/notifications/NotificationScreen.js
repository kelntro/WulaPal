import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Alert, SafeAreaView, Modal, Pressable, ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositInput, setDepositInput] = useState("");
  const [joiningNotification, setJoiningNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  const handleFilterChange = (filter, date = null) => {
    setSelectedFilter(filter);
    setModalVisible(false);
  
    if (filter === "custom" && date) {
      const from = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const to = new Date(date.setHours(23, 59, 59, 999)).toISOString();
      fetchNotifications(filter, from, to);
    } else {
      fetchNotifications(filter);
    }
  };
  

  const fetchNotifications = async (filter = "all", from = null, to = null) => {
    try {
      setLoading(true);
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id) throw new Error("User ID not found");

      let url = `${API_BASE_URL}/api/member-notifications/${parsed._id}`;      if (filter !== "all") url += `?filter=${filter}`;
      if (from && to) url += `&from=${from}&to=${to}`;


      const res = await axios.get(url);
      setNotifications(res.data);
    } catch (error) {
      Alert.alert("Error", "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/member-notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
    }
  };

  const deleteNotification = (id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/api/member-notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
          } catch (err) {
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const handlePress = () => {
      markAsRead(item._id);
    
      if (item.type === "member_invite") {
        Alert.alert(
          "Group Invitation",
          item.message,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Join",
              onPress: () => confirmJoin(item),
            },
          ]
        );
      } else if (item.type === "confirmation_request") {
        Alert.alert(
          "Confirm Contribution",
          "Confirm your contribution for this group?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Confirm",
              onPress: () => confirmContribution(item),
            },
          ]
        );
      } else if (item.type === "contribution_processed") {
        // Show receipt modal for contribution notifications
        setSelectedContribution(item);
        setShowReceiptModal(true);
      }
    };    

    return (
      <TouchableOpacity
        style={[styles.notificationItem, item.read && styles.readNotification]}
        onPress={handlePress}
        onLongPress={() => deleteNotification(item._id)}
      >
        <Text style={styles.notificationText}>
          {item.message}
          {item.cycle !== undefined && item.cycle !== null
            ? ` (Cycle ${item.cycle + 1})`
            : ""}
        </Text>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const confirmContribution = async (notification) => {
    try {
      // Check if user has already contributed
      if (notification.hasContributed) {
        Alert.alert(
          "Already Contributed",
          "You have already contributed to this cycle."
        );
        return;
      }

      // Check if user is the current payout recipient
      if (notification.isCurrentPayoutRecipient) {
        Alert.alert(
          "Cannot Contribute",
          "You are the current payout recipient. You cannot contribute to this cycle."
        );
        return;
      }

      // Check if cycle is complete
      if (notification.isCycleComplete) {
        Alert.alert(
          "Cycle Complete",
          "This cycle is already complete. You cannot contribute."
        );
        return;
      }

      // Show processing state
      setIsProcessing(true);
      setProcessingMessage("Confirming contribution...");

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Call API to confirm contribution using axios
      const response = await axios.post(
        `${API_BASE_URL}/api/confirm-contribution`,
        {
          userId: notification.userId,
          groupId: notification.groupId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id
            ? { ...n, hasContributed: true }
            : n
        )
      );

      // Show success message
      Alert.alert(
        "Success",
        "Your contribution has been confirmed successfully."
      );

    } catch (error) {
      console.error('Error confirming contribution:', error);
      
      // Handle axios error response
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || "Failed to confirm contribution. Please try again.";
      
      Alert.alert(
        "Error",
        errorMessage
      );
    } finally {
      // Hide processing state
      setIsProcessing(false);
      setProcessingMessage("");
    }
  };
  
  const confirmJoin = async (notification) => {
    console.log("📨 [confirmJoin] Received notification:", notification);
  
    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;
  
      if (!parsed?._id) {
        console.warn("⚠️ [confirmJoin] Missing user._id");
        return;
      }
      if (!notification.groupId) {
        console.warn("⚠️ [confirmJoin] Missing notification.groupId");
        return;
      }
  
      console.log("✅ [confirmJoin] Showing custom modal for deposit...");
      setJoiningNotification(notification);
      setDepositInput("");
      setShowDepositModal(true);
    } catch (err) {
      Alert.alert("Error", "Could not process request.");
    }
  };
  
  
  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="filter-outline" size={24} color="#3A6953" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet.</Text>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            {["all", "today", "yesterday", "week", "month"].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.modalOption,
                  selectedFilter === option && styles.selectedOption
                ]}
                onPress={() => handleFilterChange(option)}
              >
                <Text style={[
                  styles.modalText,
                  selectedFilter === option && styles.selectedText
                ]}>
                  {option.toUpperCase()}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.modalOption,
                selectedFilter === "custom" && styles.selectedOption
              ]}
              onPress={() => {
                setModalVisible(false);
                setShowDatePicker(true);
              }}
            >
              <Text style={[
                styles.modalText,
                selectedFilter === "custom" && styles.selectedText
              ]}>SELECT DATE</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={showDepositModal} transparent animationType="slide">
  <View style={{
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)"
  }}>
    <View style={{
      backgroundColor: "#fff",
      padding: 20,
      borderRadius: 10,
      width: "80%"
    }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        Enter Initial Deposit
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 10 }}>
        To prevent fraud, a deposit is required to join this group. Your deposit will be refunded after the group completes.
      </Text>

      <Text style={{ fontSize: 14, color: '#B00020', marginBottom: 10 }}>
        ⚠️ Note:
        {"\n"}• A 2% share will be deducted from each payout.
        {"\n"}• A 5% penalty will be charged if you miss your scheduled contribution.
      </Text>

      <TextInput
        keyboardType="numeric"
        value={depositInput}
        onChangeText={setDepositInput}
        style={{
          borderWidth: 1,
          borderColor: "#3A6953",
          borderRadius: 5,
          padding: 10,
          marginBottom: 15,
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
        <TouchableOpacity onPress={() => {
          console.log("❌ [confirmJoin] User canceled the modal");
          setShowDepositModal(false);
        }}>
          <Text style={{ marginRight: 15, color: "#999" }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            console.log("💰 [confirmJoin] User entered:", depositInput);
            const cleanedAmount = depositInput.replace(/[^\d.]/g, '').trim();
            const depositAmount = parseFloat(cleanedAmount);
            if (isNaN(depositAmount) || depositAmount <= 0) {
              console.warn("⚠️ [confirmJoin] Invalid amount entered:", depositInput);
              Alert.alert("Invalid", "Please enter a valid deposit amount.");
              return;
            }

            try {
              console.log("📤 [confirmJoin] Sending join request...");
              const user = await AsyncStorage.getItem("user");
              const parsed = user ? JSON.parse(user) : null;
            
              const res = await axios.post(
                `${API_BASE_URL}/api/groups/${joiningNotification.groupId}/confirm-member`,
                {
                  userId: parsed._id,
                  depositAmount,
                }
              );
            
              console.log("✅ [confirmJoin] Server response:", res.data);
            
              if (res.data.success) {
                Alert.alert("✅ Joined", "You have successfully joined the group!");
                fetchNotifications(selectedFilter);
                setShowDepositModal(false); // ✅ only close modal on success
              } else {
                Alert.alert("Error", res.data.error || "Failed to join.");
              }
            } catch (err) {
            
              const message =
                err.response?.data?.error ||
                "Failed to join the group. Please try again later.";
            
              Alert.alert("❌ Join Failed", message);
              // Do NOT close modal here, allow user to re-enter amount
            }            
          }}
        >
          <Text style={{ color: "#3A6953", fontWeight: "bold" }}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      {/* Calendar Picker */}
      {showDatePicker && (
        <DateTimePicker
          mode="date"
          value={customDate}
          display="calendar"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setCustomDate(selectedDate);
              handleFilterChange("custom", selectedDate);
            }
          }}
        />
      )}

      {/* Processing Modal */}
      <Modal
        visible={isProcessing}
        transparent
        animationType="fade"
        onRequestClose={() => {}} // Prevent closing
      >
        <View style={styles.processingModal}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color="#3A6953" />
            <Text style={styles.processingText}>{processingMessage}</Text>
          </View>
        </View>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        visible={showReceiptModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptContainer}>
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>Contribution Receipt</Text>
              <Text style={styles.receiptSubtitle}>Transaction Successful</Text>
            </View>

            {selectedContribution && (
              <View style={styles.receiptDetails}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount</Text>
                  <Text style={styles.receiptValue}>
                    {selectedContribution.message.match(/₱(\d+(\.\d{2})?)/)?.[0] || "N/A"}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Group Name</Text>
                  <Text style={styles.receiptValue}>
                    {selectedContribution.message.split('"')[1] || "N/A"}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Date & Time</Text>
                  <Text style={styles.receiptValue}>
                    {new Date(selectedContribution.date).toLocaleString()}
                  </Text>
                </View>

                {selectedContribution.cycle !== undefined && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Cycle</Text>
                    <Text style={styles.receiptValue}>
                      {selectedContribution.cycle + 1}
                    </Text>
                  </View>
                )}

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Text style={[styles.receiptValue, styles.statusText]}>Completed</Text>
                </View>
              </View>
            )}

            <View style={styles.receiptFooter}>
              <View style={styles.securityInfo}>
                <Icon name="security" size={16} color="#666" />
                <Text style={styles.securityText}>Secure Transaction</Text>
              </View>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => setShowReceiptModal(false)}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F8F7", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "900", color: "#3A6953", paddingBottom: 10 },
  loading: { color: "#666", textAlign: "center" },
  empty: { color: "#666", textAlign: "center", marginTop: 50, fontStyle: "italic" },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  readNotification: { opacity: 0.5 },
  notificationText: { flex: 1, fontSize: 16, color: "#666" },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#3A6953", marginLeft: 10 },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  modalOption: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
  },
  selectedOption: {
    backgroundColor: "rgba(58, 105, 83, 0.1)",
  },
  modalText: { 
    fontSize: 16, 
    color: "#3A6953",
    fontWeight: "500",
  },
  selectedText: {
    fontWeight: "bold",
  },
  modalCancel: { 
    marginTop: 15,
    paddingVertical: 8,
  },
  cancelText: { 
    color: "#666",
    fontSize: 16,
  },
  processingModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  processingContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  processingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#3A6953",
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

export default NotificationScreen;
