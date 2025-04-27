import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
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
      console.error("❌ Failed to fetch notifications:", error.message);
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
      console.error("❌ Failed to mark as read:", err.message);
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
            console.error("❌ Failed to delete notification:", err.message);
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
        <Text style={styles.notificationText}>{item.message}</Text>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const confirmContribution = async (notification) => {
    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id || !notification.groupId) return;

      const res = await axios.post("${API_BASE_URL}/api/confirm-contribution", {
        userId: parsed._id,
        groupId: notification.groupId
      });

      if (res.data.success) {
        Alert.alert("✅ Confirmed", "Your contribution has been confirmed.");
        fetchNotifications(selectedFilter);
      }
    } catch (err) {
      console.error("❌ Confirmation failed:", err.message);
      Alert.alert("Error", "Failed to confirm contribution.");
    }
  };

  const confirmJoin = async (notification) => {
    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id || !notification.groupId) return;
  
      const res = await axios.post(`${API_BASE_URL}/api/groups/${notification.groupId}/confirm-member`, {
        userId: parsed._id,
      });
  
      if (res.data.success) {
        Alert.alert("✅ Joined", "You have successfully joined the group!");
        fetchNotifications(selectedFilter);
      }
    } catch (err) {
      console.error("❌ Joining group failed:", err.message);
      Alert.alert("Error", "Failed to join the group.");
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
          <Icon name="filter-outline" size={24} color="#2E7D32" />
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
                style={styles.modalOption}
                onPress={() => handleFilterChange(option)}
              >
                <Text style={styles.modalText}>{option.toUpperCase()}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.modalOption}
              onPress={() => {
                setModalVisible(false);
                setShowDatePicker(true);
              }}
            >
              <Text style={styles.modalText}>SELECT DATE</Text>
            </Pressable>
            <Pressable style={styles.modalCancel} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "#999" }}>Close</Text>
            </Pressable>
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
  title: { fontSize: 22, fontWeight: "bold", color: "#2E7D32" },
  loading: { color: "#666", textAlign: "center" },
  empty: { color: "#999", textAlign: "center", marginTop: 50, fontStyle: "italic" },
  notificationItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  readNotification: { opacity: 0.5 },
  notificationText: { flex: 1, fontSize: 16, color: "#333" },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2E7D32", marginLeft: 10 },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 40,
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalOption: {
    paddingVertical: 10,
    width: "100%",
    alignItems: "center",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  modalText: { fontSize: 16, color: "#2E7D32" },
  modalCancel: { marginTop: 10 },
});

export default NotificationScreen;
