import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_BASE_URL } from '@env';

const GroupDetailsScreen = ({ route }) => {
  const {
    groupId,
    groupName,
    handlerName,
    contribution,
    frequency,
    slots,
    description,
    image,
  } = route.params;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [groupData, setGroupData] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    const checkMembership = async () => {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user._id;

      try {
        const res = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
        const data = await res.json();
        setGroupData(data);
  
        // 🔁 More robust membership check
        const isUserMember = data.members.some((m) => {
          if (typeof m === 'string') return m === userId;
          if (typeof m === 'object') {
            return (
              m._id === userId ||
              m.id === userId ||
              m.userId === userId ||
              (m.user && m.user._id === userId)
            );
          }
          return false;
        });

        setIsMember(isUserMember);
      } catch (err) {
        console.error('❌ Error checking membership:', err);
      }
    };

    checkMembership();
  }, []);

  const normalizedImage = image?.startsWith('http')
    ? image.replace(/^http:\/\/[^\/]+/, API_BASE_URL.replace(/\/$/, ''))
    : `${API_BASE_URL.replace(/\/$/, '')}/${image?.replace(/\\/g, '/')}`;

  const initiateJoin = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      setModalMessage('❌ Please log in first.');
      setModalVisible(true);
      return;
    }

    const user = JSON.parse(userData);
    const userId = user._id;

    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/request-join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    setModalMessage(data.success ? '✅ Request sent to organizer.' : `❌ ${data.error}`);
    setModalVisible(true);
  };

  const confirmJoinWithDeposit = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      const userId = user._id;

      const response = await fetch(`${API_BASE_URL}/api/join-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, groupId, depositAmount: Number(depositAmount) }),
      });

      const data = await response.json();

      if (!data.success) {
        setModalMessage(`❌ ${data.error}`);
        setModalVisible(true);
      } else {
        setModalMessage(`✅ Successfully joined the group!`);
        setModalVisible(true);
        setDepositModalVisible(false);
      }
    } catch (error) {
      console.error('❌ Join Error:', error);
      setModalMessage('❌ Something went wrong.');
      setModalVisible(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: normalizedImage || 'https://via.placeholder.com/150' }}
        style={styles.image}
        onError={(e) => console.log('❌ Image failed to load:', e.nativeEvent)}
        onLoad={() => console.log('✅ Image loaded:', normalizedImage)}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{groupName || 'Unnamed Group'}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="people-outline" size={18} color="#285236" style={styles.icon} />
          <Text style={styles.infoText}>{slots || 'N/A'} Slots</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#285236" style={styles.icon} />
          <Text style={styles.infoText}>₱{contribution || 'N/A'} ({frequency})</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color="#285236" style={styles.icon} />
          <Text style={styles.infoText}>
            Status: <Text style={{color: groupData?.status === 'open' ? '#4CAF50' : groupData?.status === 'active' ? '#2196F3' : '#9E9E9E'}}>
              {groupData?.status?.charAt(0).toUpperCase() + groupData?.status?.slice(1) || 'N/A'}
            </Text>
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#285236" style={styles.icon} />
          <Text style={styles.infoText}>Handler: {handlerName}</Text>
        </View>

        <Text style={styles.description}>{description || 'No description provided.'}</Text>

        {/* ✅ Group Members */}
        {groupData?.members?.length > 0 && (
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 10, color: '#3A6953' }}>
              <Icon name="account-group-outline" size={22} color="#285236" style={styles.icon} /> Group Members:
            </Text>
            {groupData.members.map((member, index) => {
              const name =
                typeof member === 'object'
                  ? member.name || member.fullName || `Member ${index + 1}`
                  : `Member ${index + 1}`;
              return (
                <Text key={index} style={{ fontSize: 15, color: '#333', marginBottom: 4 }}>
                  {index + 1}. {name}
                </Text>
              );
            })}
          </View>
        )}
        {/* ✅ Buttons */}
        {!isMember && (
          <TouchableOpacity style={styles.joinButton} onPress={initiateJoin}>
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        )}

        {isMember && (
          <>
            {groupData?.status === 'completed' ? (
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: '#6A8C73' }]}
                disabled={true}
              >
                <Text style={styles.joinButtonText}>Group Completed</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.joinButton, { backgroundColor: isPaying ? '#AAA' : '#285236' }]}
                disabled={isPaying}
                onPress={async () => {
                  try {
                    setIsPaying(true);
                    const userData = await AsyncStorage.getItem('user');
                    const user = JSON.parse(userData);
                    const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/contribute-now`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ userId: user._id }),
                    });
                    const data = await response.json();

                    const nextCycleDate = data.nextCycleDate && new Date(data.nextCycleDate).toLocaleDateString();
                    if (data.success) {
                      setModalMessage(`✅ ${data.message}\n\nNext contribution cycle starts on ${nextCycleDate}`);
                    } else {
                      setModalMessage(`${data.message || data.error}\n\n${nextCycleDate ? `Next cycle: ${nextCycleDate}` : ''}`);
                    }

                    setModalVisible(true);
                  } catch (err) {
                    console.error("❌ Advance contribution failed:", err);
                    setModalMessage("❌ Something went wrong while processing payment.");
                    setModalVisible(true);
                  } finally {
                    setIsPaying(false);
                  }
                }}
              >
                <Text style={styles.joinButtonText}>Pay ₱{contribution} Now</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.joinButton, { backgroundColor: '#6A8C73', marginTop: 12 }]}
              onPress={() => navigation.navigate('AuditTrailScreen', { groupId })}
            >
              <Text style={styles.joinButtonText}> View Audit Trail</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ✅ Modals */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={{ marginBottom: 10 }}>{modalMessage}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#3A6953', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={depositModalVisible} transparent animationType="slide" onRequestClose={() => setDepositModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>💰 Initial Deposit Required</Text>
            <Text style={styles.modalText}>To prevent fraud, a deposit is required. It will be refunded after the group completes.</Text>
            <Text style={styles.modalNote}>
              ⚠️ Note:
              {'\n'}• 2% will be deducted per payout.
              {'\n'}• 5% penalty for missed contributions.
            </Text>
            <TextInput
              placeholder="Enter deposit amount"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <TouchableOpacity onPress={confirmJoinWithDeposit} style={styles.modalConfirm}>
              <Text style={{ color: 'white', textAlign: 'center' }}>Confirm Join</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
              <Text style={{ color: '#285236', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {isPaying && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#285236" />
          <Text style={{ marginTop: 10, color: '#285236', fontWeight: 'bold' }}>Processing your payment...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8F7', padding: 16 },
  image: { width: '100%', height: 220, resizeMode: 'cover', borderRadius: 20, borderWidth: 2, borderColor: '#9BB3A7' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: '#3A6953', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  icon: { marginRight: 8 },
  infoText: { fontSize: 15, color: '#333' },
  description: { fontSize: 14, color: '#555', marginTop: 12, lineHeight: 20 },
  joinButton: { marginTop: 30, backgroundColor: '#3A6953', paddingVertical: 12, borderRadius: 30, alignItems: 'center' },
  joinButtonText: { color: '#FFF', fontWeight: '600', fontSize: 16 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
  },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalBox: { width: 300, backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 10 },
  modalNote: { fontSize: 14, color: '#B00020', marginBottom: 10 },
  input: { borderColor: '#CCC', borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 12 },
  modalConfirm: { backgroundColor: '#3A6953', padding: 10, borderRadius: 8, marginBottom: 8 },
});

export default GroupDetailsScreen;
