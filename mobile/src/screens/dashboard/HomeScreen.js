import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Dimensions } from 'react-native';
import { API_BASE_URL } from '@env';

const screenHeight = Dimensions.get('window').height;
const HomeScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [upcomingContributions, setUpcomingContributions] = useState([]);
  const [balance, setBalance] = useState(0); 
  const [userName, setUserName] = useState('');

  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [user, setUser] = useState(null); // Add this

  const fetchDashboardData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (!parsedUser || !parsedUser._id) {
        console.warn('User ID not found in AsyncStorage');
        return;
      }
      
      setUser(parsedUser); // ✅ move this up
      setUserName(parsedUser.name || 'User');

          // 🔍 Check profile completeness
    const requiredFields = ['dateofBirth', 'country', 'mobile', 'address'];
    const isIncomplete = requiredFields.some(field => !parsedUser[field]);
    if (isIncomplete) {
      setShowIncompleteModal(true);
    }

      const contributionsRes = await axios.get(
        `${API_BASE_URL}/api/member-notifications/${parsedUser._id}`,
        {
          params: {
            type: 'contribution_reminder',
          },
        },
      );

      const contributions = contributionsRes.data.map((item, index) => ({
        id: item._id || index.toString(),
        group: item.groupName || 'Unnamed Group',
        time: new Date(item.date).toLocaleString(),
        frequency: 'Monthly',
        amount: item.amount ? `₱${item.amount.toLocaleString()}` : '₱1,000',
      }));

      setUpcomingContributions(contributions);

      // Fetch Balance 🔥
      const balanceRes = await axios.get(`${API_BASE_URL}/api/wallet/balance`, {
        params: {userId: parsedUser._id},
      });

      if (balanceRes.data && typeof balanceRes.data.balance === 'number') {
        setBalance(balanceRes.data.balance);
      } else {
        console.warn('No balance field in response.');
        setBalance(0);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <Text style={styles.greeting}>Hi, {userName}!</Text>
      <View style={{flexDirection: 'row', gap: 15}}>
          <TouchableOpacity onPress={() => navigation.navigate('GroupChats')}>
            <Icon name="chatbubbles-outline" size={26} color="#3A6953" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications-outline" size={26} color="#3A6953" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search users by name, email, or ID..."
          style={styles.searchInput}
          onFocus={() => navigation.navigate('SearchScreen')}
        />
      </View>

      {/* Balance */}
      <View style={styles.balanceSection}>
        <Text style={styles.subtitle}>Here’s Your Balance</Text>
        <Text style={styles.balance}>
          ₱{balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
        </Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* Contributions */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={{paddingBottom: 70}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contributionsContainer}>
          <View style={styles.whiteArcFix} />
          <View style={styles.contributionsHeader}>
            <Text style={styles.contributionsTitleText}>
              Upcoming Contributions
            </Text>
            <TouchableOpacity>
              <Text style={styles.monthText}>Month Of April ›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contributionList}>
            {upcomingContributions.length === 0 ? (
              <Text style={{textAlign: 'center', color: '#888'}}>
                No upcoming contributions.
              </Text>
            ) : (
              upcomingContributions.map((item, index) => (
                <View key={index} style={styles.contributionItem}>
                  <View style={styles.contributionIcon}>
                    <Icon name="people" size={24} color="#3A6953" />
                  </View>
                  <View style={styles.contributionInfo}>
                    <Text style={styles.groupName}>{item.group}</Text>
                    <Text style={styles.groupTime}>{item.time}</Text>
                  </View>
                  <View style={styles.contributionDetails}>
                    <Text style={styles.frequencyText}>{item.frequency}</Text>
                    <Text style={styles.amountText}>{item.amount}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <Modal visible={showIncompleteModal} transparent animationType="fade">
  <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
    <View style={{ width: '80%', backgroundColor: 'white', borderRadius: 20, padding: 24, alignItems: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#3A6953' }}>Complete Your Profile</Text>
      <Text style={{ fontSize: 14, color: '#555', textAlign: 'center' }}>
        To use WulaPal features, please complete your profile information.
      </Text>

      <TouchableOpacity
        onPress={() => {
          setShowIncompleteModal(false);
          navigation.navigate('ProfileScreen', { userId: user?._id }); // ✅ make sure this screen is wired
        }}
        style={{ marginTop: 20, backgroundColor: '#3A6953', padding: 12, borderRadius: 10, width: '80%' }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#ffffff'},
  header: {
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {fontSize: 28, fontWeight: 'bold', color: '#3A6953'},
  subtitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 5,
  },
  balanceSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  balance: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#3A6953',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#D4E8DB',
    borderRadius: 50,
    overflow: 'hidden',
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: '#8BC29E',
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
  },
  searchContainer: {
    marginHorizontal: 15,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 14,
  },
  scrollBody: {
    flex: 1,
  },
  contributionsContainer: {
    marginTop: 15,
    backgroundColor: '#DBE7DF',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    paddingHorizontal: 15,
    paddingBottom: 40,
    position: 'relative',
    minHeight: screenHeight * 0.6,  },
    justifyContent: 'flex-start',
  whiteArcFix: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 2,
  },
  contributionsHeader: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 25,
  },
  contributionsTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#3A6953',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 15,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A6953',
  },
  contributionList: {
    marginTop: 2,
    paddingBottom: 120,
  },
  contributionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },
  contributionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4E8DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contributionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  groupTime: {
    fontSize: 13,
    color: '#666666',
  },
  contributionDetails: {
    alignItems: 'flex-end',
  },
  frequencyText: {
    fontSize: 14,
    color: '#666666',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A6953',
  },
});

export default HomeScreen;
