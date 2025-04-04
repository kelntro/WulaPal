import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = user ? JSON.parse(user) : null;
      if (!parsed?._id) throw new Error("User ID not found");

      const res = await axios.get(`http://10.0.2.2:5050/api/member-notifications/${parsed._id}`);
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
      await axios.patch(`http://10.0.2.2:5050/api/member-notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("❌ Failed to mark as read:", err.message);
    }
  };

  const deleteNotification = (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`http://10.0.2.2:5050/api/member-notifications/${id}`);
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
  
      if (item.type === "confirmation_request") {
        Alert.alert(
          "Confirm Contribution",
          "Do you want to confirm your contribution for this group?",
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
  
      const res = await axios.post("http://10.0.2.2:5050/api/confirm-contribution", {
        userId: parsed._id,
        groupId: notification.groupId
      });
  
      if (res.data.success) {
        Alert.alert("✅ Confirmed", "Your contribution has been confirmed.");
        fetchNotifications(); // Refresh notifications
      }
    } catch (err) {
      console.error("❌ Contribution confirmation failed:", err.message);
      Alert.alert("Error", "Failed to confirm contribution.");
    }
  };
  

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8F7', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
  loading: { color: '#666', textAlign: 'center' },
  empty: { color: '#999', textAlign: 'center', marginTop: 50, fontStyle: 'italic' },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  readNotification: { opacity: 0.5 },
  notificationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
    marginLeft: 10,
  },
});

export default NotificationScreen;
