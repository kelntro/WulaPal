import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native'; // ✅ Auto-refresh on screen focus
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from '@env';

const socket = io(API_BASE_URL);

const GroupsScreen = () => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('your');
  const [searchText, setSearchText] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigation = useNavigation();

  const fetchGroups = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        console.error('❌ User data not found.');
        return;
      }
      const user = JSON.parse(userData);
      setCurrentUserId(user._id);

      const response = await fetch(`${API_BASE_URL}/api/groups`);
      const data = await response.json();

      console.log('📥 Groups fetched:', data);

      // ✅ Extract user IDs from member objects and check membership correctly
      const userJoinedGroups = data.filter(group =>
        group.members.some(
          member =>
            (typeof member === 'string'
              ? member
              : member.userId
            )?.toString() === user._id,
        ),
      );

      const availableGroupsList = data.filter(
        group =>
          !group.members.some(
            member =>
              (typeof member === 'string'
                ? member
                : member.userId
              )?.toString() === user._id,
          ) && group.members.length < group.requiredMembers,
      );

      setUserGroups(userJoinedGroups);
      setAvailableGroups(availableGroupsList);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching groups:', error);
      setLoading(false);
    }
  };

  // ✅ Automatically fetch groups when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, []),
  );

  useEffect(() => {
    // ✅ Listen for new groups in real-time
    socket.on('newGroup', newGroup => {
      console.log('🔄 New group received:', newGroup);
      if (newGroup.members.length < newGroup.requiredMembers) {
        setAvailableGroups(prevGroups => [newGroup, ...prevGroups]);
      }
    });

    socket.on('groupUpdated', updatedGroup => {
      console.log('🔄 Group updated:', updatedGroup);

      setAvailableGroups(prevGroups =>
        prevGroups.map(group =>
          group._id === updatedGroup._id ? updatedGroup : group,
        ),
      );

      setUserGroups(prevGroups =>
        prevGroups.map(group =>
          group._id === updatedGroup._id ? updatedGroup : group,
        ),
      );
    });

    return () => {
      socket.off('newGroup');
      socket.off('groupUpdated');
    };
  }, []);

  // Filter groups based on search text and status
  const filteredGroups =
    selectedTab === 'your'
      ? userGroups.filter(group => {
          const matchesSearch = group.name.toLowerCase().includes(searchText.toLowerCase());
          const matchesStatus = statusFilter === 'all' || group.status === statusFilter;
          return matchesSearch && matchesStatus;
        })
      : availableGroups.filter(group =>
          group.name.toLowerCase().includes(searchText.toLowerCase()),
        );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#3A6953' }}>
          Paluwagan
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('JoinRequestStatus')}>
          <Icon name="account-check-outline" size={28} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedTab === 'your' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('your')}
        >
          <MaterialIcons
            name="group"
            size={20}
            color={selectedTab === 'your' ? '#fff' : '#888'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.toggleText,
              selectedTab === 'your' && styles.activeText,
            ]}
          >
            My Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            selectedTab === 'join' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('join')}
        >
          <MaterialIcons
            name="person-search"
            size={20}
            color={selectedTab === 'join' ? '#fff' : '#888'}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[
              styles.toggleText,
              selectedTab === 'join' && styles.activeText,
            ]}
          >
            Join Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar and Filter */}
      <View style={styles.searchFilterContainer}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="🔍 Search groups..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {selectedTab === 'your' && (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <MaterialIcons name="filter-list" size={22} color="#3A6953" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeIcon}
              onPress={() => setShowFilterModal(false)}
            >
              <MaterialIcons name="close" size={24} color="#3A6953" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {['all', 'open', 'active', 'completed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  statusFilter === status && styles.selectedFilter
                ]}
                onPress={() => {
                  setStatusFilter(status);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  statusFilter === status && styles.selectedFilterText
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#285236" />
      ) : (
        <>
          {filteredGroups.length > 0 ? (
            <FlatList
              data={filteredGroups}
              keyExtractor={item => item._id}
              renderItem={({ item }) => (
                <GroupCard group={item} currentUserId={currentUserId} />
              )}
            />

          ) : (
            <Text style={styles.noGroupsText}>
              {selectedTab === 'your'
                ? "You haven't joined any groups yet."
                : 'No available groups to join.'}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

// ✅ Group Card Component
const GroupCard = ({ group, currentUserId }) => {
  const navigation = useNavigation();
// Normalize API_BASE_URL to avoid trailing slashes
const baseUrl = API_BASE_URL.replace(/\/$/, '');

// Build imageUrl
const imageUrl = group.image
  ? (group.image.startsWith('http')
      ? group.image.replace(/^http:\/\/[^\/]+/, baseUrl) // 👈 Replace any base IP:PORT to your env base
      : `${baseUrl}/${group.image.replace(/\\/g, '/')}`)
  : 'https://via.placeholder.com/150';

console.log('🖼️ Group Image Raw:', group.image);
console.log('🌐 Final Image URL:', imageUrl);

  const handlerName = group.handler?.name || 'Unknown';
  const isJoined = group.members?.some(member => {
    const id = typeof member === 'string' ? member : member.userId;
    return id.toString() === currentUserId;
  });  

  return (
    <View style={styles.card}>
      <Image source={{uri: imageUrl}} style={styles.cardImage} 
            onError={(error) => console.error('❌ Failed to load image:', error.nativeEvent)}
            onLoad={() => console.log('✅ Image loaded successfully:', imageUrl)}
            />
      <View style={styles.cardContent}>
        <Text style={styles.groupTitle}>{group.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons
            name="people-outline"
            size={16}
            color="#285236"
            style={styles.infoIcon}
          />

<Text style={styles.infoText}>
  {group.slots - group.members.length} / {group.slots} Slots Available
</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color="#285236"
            style={styles.infoIcon}
          />

          <Text style={styles.infoText}>
            ₱{group.contributionAmount} {group.frequency}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={16}
            color="#285236"
            style={styles.infoIcon}
          />
          <Text style={styles.handlerText}>
            Handler: <Text style={{color: '#3A6953'}}>{handlerName}</Text>
          </Text>
        </View>
        <View style={styles.descriptionWrapper}>
  <Text style={styles.descriptionText} numberOfLines={2} ellipsizeMode="tail">
    {group.description}
  </Text>
</View>


        <View style={styles.avatars}>
          {(group.sampleAvatars || []).slice(0, 5).map((uri, idx) => (
            <Image
              key={idx}
              source={{uri}}
              style={[styles.avatar, {marginLeft: idx === 0 ? 0 : -10}]}
            />
          ))}
        </View>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() =>
            navigation.navigate('GroupDetails', {
              groupId: group._id,
              groupName: group.name,
              handlerName: group.handler?.name || 'Unknown',
              contribution: group.contributionAmount,
              frequency: group.frequency,
              slots: group.slots,
              description: group.description,
              image: group.image,
              members: group.members,
            })
          }
          >
          <Text style={styles.viewButtonText}>
            {isJoined ? 'View' : 'Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7',
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3A6953',
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    minWidth: 120,
  },
  activeTab: {
    backgroundColor: '#3A6953',
  },
  toggleText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 16,
  },
  activeText: {
    color: '#fff',
  },
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    flex: 1,
  },
  noGroupsText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#DBE7DF',
    borderRadius: 20,
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#9BB3A7',
  },
  cardImage: {
    width: 100,
    height: 175,
    borderRadius: 15,
    marginRight: 10,
    alignSelf: 'flex-start',
  },
  cardContent: {
    flex: 1,
    paddingLeft: 10,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
  },
  handlerText: {
    fontSize: 13,
    color: '#333',
    marginTop: 2,
  },
  avatars: {
    flexDirection: 'row',
    marginTop: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#6A8C73',
  },
  viewButton: {
    backgroundColor: '#3A6953',
    paddingHorizontal: 75,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#2E7D32',
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  infoIcon: {
    marginRight: 6,
  },
  descriptionWrapper: {
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    justifyContent: 'center',
    alignItems: 'center',
    height: 45,
    width: 35,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    padding: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A6953',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#F4F8F7',
  },
  selectedFilter: {
    backgroundColor: '#3A6953',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedFilterText: {
    color: '#fff',
  },
});

export default GroupsScreen;
