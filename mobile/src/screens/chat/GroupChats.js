import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const GroupChats = () => {
  const [allChats, setAllChats] = useState([]);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserAndChats = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (!storedUser) return;

        const userObj = JSON.parse(storedUser);
        setUser(userObj);

        // Fetch group chats
        const groupsRes = await fetch(`${API_BASE_URL}/api/groups`);
        const groups = await groupsRes.json();
        const filteredGroups = groups.filter(group =>
          group.members.some(m => m.userId === userObj._id)
        );

        // Fetch direct messages
        const messagesRes = await fetch(`${API_BASE_URL}/api/messages/conversation/${userObj._id}`);
        const messages = await messagesRes.json();
        
        // Get unique chat partners
        const chatPartners = new Set();
        messages.forEach(msg => {
          if (msg.from === userObj._id) {
            chatPartners.add(msg.to);
          } else {
            chatPartners.add(msg.from);
          }
        });

        // Fetch user details for each chat partner
        const partnerDetails = await Promise.all(
          Array.from(chatPartners).map(async partnerId => {
            const res = await fetch(`${API_BASE_URL}/api/users/${partnerId}`);
            return res.json();
          })
        );

        // Combine and format all chats
        const formattedChats = [
          ...filteredGroups.map(group => ({
            ...group,
            type: 'group',
            lastActivity: group.updatedAt || group.createdAt
          })),
          ...partnerDetails.map(partner => ({
            ...partner,
            type: 'direct',
            lastActivity: messages
              .filter(msg => msg.from === partner._id || msg.to === partner._id)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]?.timestamp || new Date(0)
          }))
        ];

        // Sort by last activity
        const sortedChats = formattedChats.sort((a, b) => 
          new Date(b.lastActivity) - new Date(a.lastActivity)
        );

        setAllChats(sortedChats);
      } catch (err) {
        console.error('❌ Failed to load chats:', err);
      }
    };

    loadUserAndChats();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        if (item.type === 'group') {
          navigation.navigate('MemberGroupChat', { groupId: item._id });
        } else {
          navigation.navigate('MessageUserScreen', { userId: item._id });
        }
      }}
    >
      <View style={styles.iconContainer}>
        <Icon 
          name={item.type === 'group' ? "chatbubble-ellipses-outline" : "person-outline"} 
          size={24} 
          color="#3A6953" 
        />
      </View>
      <View>
        <Text style={styles.groupName}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#666' }}>Loading your chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Messages</Text>
      <FlatList
        data={allChats}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No chats yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F8F7' },
  title: { fontSize: 22, fontWeight: '900', color: '#3A6953', marginBottom: 20 },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: { marginRight: 15 },
  groupName: { fontSize: 16, fontWeight: 'bold', color: '#3A6953' },
  groupDesc: { color: '#666', fontSize: 12 },
  empty: { color: '#aaa', fontStyle: 'italic', textAlign: 'center', marginTop: 50 },
});

export default GroupChats;
