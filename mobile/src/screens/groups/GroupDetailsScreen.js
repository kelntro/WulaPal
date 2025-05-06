import React, { useState } from 'react'; 
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {API_BASE_URL} from '@env';

const GroupDetailsScreen = ({route}) => {
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
  
  const initiateJoin = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      setModalMessage('❌ Please log in first.');
      setModalVisible(true);
      return;
    }
  
    const user = JSON.parse(userData);
    const userId = user._id;
  
    const groupResponse = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
    const groupData = await groupResponse.json();
  
    const isMember = groupData.members.some(
      (m) => (typeof m === 'string' ? m : m.userId)?.toString() === userId
    );
  
    if (isMember) {
      setModalMessage('❌ You already joined this group.');
      setModalVisible(true);
      return;
    }
  
    // Show deposit modal
    setDepositModalVisible(true);
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

  
  const joinGroup = async (groupId) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        setModalMessage('❌ Please log in first.');
        setModalVisible(true);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id;
      if (!userId) return alert('❌ Invalid user.');

      const groupResponse = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
      const groupData = await groupResponse.json();

      const isMember = groupData.members.some(
        (m) => (typeof m === 'string' ? m : m.userId)?.toString() === userId
      );

      if (isMember) {
        setModalMessage('❌ You already joined this group.');
        setModalVisible(true);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/join-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, groupId }),
      });

      const data = await response.json();
      if (!data.success) {
        setModalMessage(`❌ ${data.error}`);
        setModalVisible(true);
      } else {
        alert('✅ Successfully joined!');
      }
    } catch (error) {
      console.error('❌ Join Error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{uri: image || 'https://via.placeholder.com/150'}}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{groupName || 'Unnamed Group'}</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="people-outline"
            size={18}
            color="#285236"
            style={styles.icon}
          />
          <Text style={styles.infoText}>{slots || 'N/A'} Slots</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color="#285236"
            style={styles.icon}
          />
          <Text style={styles.infoText}>
            ₱{contribution || 'N/A'} ({frequency})
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={18}
            color="#285236"
            style={styles.icon}
          />
          <Text style={styles.infoText}>Handler: {handlerName}</Text>
        </View>

        <Text style={styles.description}>
          {description || 'No description provided.'}
        </Text>

        <TouchableOpacity style={styles.joinButton} onPress={initiateJoin}>
        <Text style={styles.joinButtonText}>Join Group</Text>
      </TouchableOpacity>
      </View>

      <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible}
  onRequestClose={() => setModalVisible(false)}>
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    }}>
    <View
      style={{
        width: 300,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
      }}>
      <Text style={{marginBottom: 10}}>{modalMessage}</Text>
      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Text style={{color: '#3A6953', fontWeight: 'bold'}}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
<Modal
  visible={depositModalVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setDepositModalVisible(false)}
>
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: 300 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
        💰 Initial Deposit Required
      </Text>
      
      <Text style={{ fontSize: 14, marginBottom: 10 }}>
        To prevent fraud, a deposit is required to join this group. Your deposit will be refunded after the group completes.
      </Text>

      <Text style={{ fontSize: 14, color: '#B00020', marginBottom: 10 }}>
        ⚠️ Note: A 2% share will be deducted from each payout — 1% goes to the organizer and 1% to the system.
      </Text>

      <TextInput
        placeholder="Enter deposit amount"
        value={depositAmount}
        onChangeText={setDepositAmount}
        keyboardType="numeric"
        style={{ borderColor: '#CCC', borderWidth: 1, borderRadius: 8, padding: 8, marginBottom: 12 }}
      />

      <TouchableOpacity onPress={confirmJoinWithDeposit} style={{ backgroundColor: '#3A6953', padding: 10, borderRadius: 8, marginBottom: 8 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>Confirm Join</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setDepositModalVisible(false)}>
        <Text style={{ color: '#285236', textAlign: 'center' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7',
  },
  image: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  icon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginTop: 12,
    lineHeight: 20,
  },
  joinButton: {
    marginTop: 20,
    backgroundColor: '#3A6953',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default GroupDetailsScreen;
