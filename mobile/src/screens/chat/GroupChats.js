import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GroupChats = () => {
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadUserAndGroups = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (!storedUser) return;

        const userObj = JSON.parse(storedUser);
        setUser(userObj);

        const res = await fetch(`http://10.0.2.2:5050/api/groups`);
        const groups = await res.json();

        const filtered = groups.filter(group =>
          group.members.some(m => m.userId === userObj._id)
        );

        setJoinedGroups(filtered.reverse());
      } catch (err) {
        console.error('❌ Failed to load joined groups:', err);
      }
    };

    loadUserAndGroups();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('MemberGroupChat', { groupId: item._id })}
    >
      <View style={styles.iconContainer}>
        <Icon name="chatbubble-ellipses-outline" size={24} color="#2E7D32" />
      </View>
      <View>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDesc}>{item.description || "No description"}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#666' }}>Loading your groups...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Chats</Text>
      <FlatList
        data={joinedGroups}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>You haven’t joined any groups yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F8F7' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32', marginBottom: 20 },
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
