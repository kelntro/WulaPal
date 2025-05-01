import React, { useState } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
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

        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => joinGroup(groupId)}>
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
</Modal>;
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
