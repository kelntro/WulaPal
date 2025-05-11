import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
  Alert, SafeAreaView, Modal, Pressable
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
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id || !notification.groupId) return;

      // First check if user has already contributed
      const checkRes = await axios.get(`${API_BASE_URL}/api/groups/${notification.groupId}/check-contribution`, {
        params: { userId: parsed._id }
      });

      if (checkRes.data.hasContributed) {
        const nextCycleDate = new Date(checkRes.data.nextCycleDate);
        Alert.alert(
          "⛔ Already Contributed",
          `You've already contributed for cycle ${checkRes.data.currentCycle + 1}. Next cycle starts on ${nextCycleDate.toLocaleDateString()}`
        );
        return;
      }

      // Check if user is the current payout recipient
      if (checkRes.data.isCurrentRecipient) {
        Alert.alert(
          "⛔ Cannot Contribute",
          `You are the payout recipient for cycle ${checkRes.data.currentCycle + 1}. You don't need to contribute this cycle.`
        );
        return;
      }

      // Check if cycle is already complete
      if (checkRes.data.cycleComplete) {
        Alert.alert(
          "⛔ Cycle Complete",
          `This cycle already has enough contributions. Next cycle starts on ${new Date(checkRes.data.nextCycleDate).toLocaleDateString()}`
        );
        return;
      }

      // If not contributed yet, proceed with confirmation
      const res = await axios.post(`${API_BASE_URL}/api/confirm-contribution`, {
        userId: parsed._id,
        groupId: notification.groupId
      });

      if (res.data.success) {
        Alert.alert("✅ Confirmed", "Your contribution has been confirmed.");
        fetchNotifications(selectedFilter);
      }
    } catch (err) {
      const message =
        err?.response?.data?.error === "Already contributed this cycle."
          ? "⛔ You've already contributed for the current cycle."
          : err?.response?.data?.error || "Failed to confirm contribution.";
  
      Alert.alert("❌ Contribution Failed", message);
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
        {"\n"}• A 2% share will be deducted from each payout (1% for the organizer, 1% for the system).
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F8F7", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", color: "#3A6953" },
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
});

export default NotificationScreen;
