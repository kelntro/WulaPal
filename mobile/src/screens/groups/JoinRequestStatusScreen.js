import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';

const JoinRequestStatusScreen = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
const [depositInput, setDepositInput] = useState("");
const [selectedGroup, setSelectedGroup] = useState(null);


  useEffect(() => {
    const fetchJoinRequests = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser) return;

        setUserId(parsedUser._id);

        const response = await fetch(
          `${API_BASE_URL}/api/member-notifications/${parsedUser._id}`
        );
        const allNotifications = await response.json();

        const filtered = allNotifications.filter((n) =>
          ['join_request', 'member_invite'].includes(n.type)
        );

        const grouped = {};
        filtered.forEach((n) => {
          if (!grouped[n.groupId]) grouped[n.groupId] = {};
          grouped[n.groupId][n.type] = n;
        });

        const formatted = await Promise.all(
            Object.entries(grouped).map(async ([groupId, types]) => {
              let groupName = "Unnamed Group";
          
              try {
                const groupRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
                const groupData = await groupRes.json();
                groupName = groupData.name || groupName;
              } catch (err) {
                console.warn(`⚠️ Failed to fetch group ${groupId}:`, err.message);
              }
          
              return {
                groupId,
                groupName,
                request: types.join_request,
                invite: types.member_invite,
                status: types.member_invite
                  ? 'Approved'
                  : types.join_request && types.join_request.processed
                  ? 'Declined'
                  : 'Pending',
              };
            })
          );
          

        setRequests(formatted);
      } catch (error) {
        console.error('❌ Error fetching join request status:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinRequests();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Ionicons name="people-circle-outline" size={28} color="#3A6953" style={{ marginBottom: 6 }} />
      <Text style={styles.groupName}>{item.groupName}</Text>
      <Text style={styles.groupId}>Group ID: {item.groupId}</Text>
      <Text style={styles.statusText}>
        Status:{" "}
        <Text style={{ color: getStatusColor(item.status), fontWeight: 'bold' }}>
          {item.status}
        </Text>
      </Text>
      {item.status === 'Approved' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedGroup(item);
            setDepositInput("");
            setShowDepositModal(true);
          }}
          
        >
<Text style={styles.buttonText}>Pay Initial Deposit (Refundable)</Text>
</TouchableOpacity>
      )}
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return '#3A6953';
      case 'Declined':
        return '#B00020';
      default:
        return '#F9A825';
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Join Request Status</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#3A6953" />
        ) : (
          <FlatList
            data={requests}
            keyExtractor={(item) => item.groupId}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={{ textAlign: 'center', marginTop: 40 }}>
                No join requests found.
              </Text>
            }
          />
        )}
      </View>
  
      {showDepositModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Enter Initial Deposit</Text>
            <Text style={styles.modalSub}>Amount will be refunded at group end</Text>
            
            <Text style={styles.modalSub}>
              To prevent fraud, a deposit is required to join this group. Your deposit will be refunded after the group completes.
            </Text>

            <Text style={[styles.modalSub, { color: '#B00020', marginTop: 8 }]}>
              ⚠️ Note:
              {"\n"}• A 2% share will be deducted from each payout.
              {"\n"}• A 5% penalty will be charged if you miss your scheduled contribution.
            </Text>

            <TextInput
              keyboardType="numeric"
              value={depositInput}
              onChangeText={setDepositInput}
              style={styles.input}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const cleaned = depositInput.replace(/[^\d.]/g, "").trim();
                  const amount = parseFloat(cleaned);
                  if (!amount || isNaN(amount) || amount <= 0) {
                    alert("Please enter a valid amount.");
                    return;
                  }
  
                  try {
                    const user = await AsyncStorage.getItem("user");
                    const parsed = user ? JSON.parse(user) : null;
  
                    const res = await fetch(
                      `${API_BASE_URL}/api/groups/${selectedGroup.groupId}/confirm-member`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: parsed._id,
                          depositAmount: amount,
                        }),
                      }
                    );
  
                    const data = await res.json();
  
                    if (res.ok && data.success) {
                      alert("✅ You've successfully joined the group.");
                      setShowDepositModal(false);
                      setRequests((prev) =>
                        prev.map((r) =>
                          r.groupId === selectedGroup.groupId
                            ? { ...r, status: "Joined" }
                            : r
                        )
                      );
                    } else {
                      alert(`❌ ${data.error || "Join failed."}`);
                    }
                  } catch (err) {
                    console.error("❌ Join error:", err);
                    alert("Failed to confirm deposit. Try again.");
                  }
                }}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default JoinRequestStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#3A6953',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'flex-start',
  },  
  groupId: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#3A6953',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  groupName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#3A6953',
    marginBottom: 4,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#3A6953",
  },
  modalSub: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#3A6953",
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelText: {
    marginRight: 15,
    color: "#666",
    fontSize: 16,
  },
  confirmText: {
    color: "#3A6953",
    fontWeight: "bold",
    fontSize: 16,
  },
  
});
