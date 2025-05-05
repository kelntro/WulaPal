import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
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
import {Dimensions} from 'react-native';
import {API_BASE_URL} from '@env';

const screenHeight = Dimensions.get('window').height;

const HomeScreen = () => {
  const navigation = useNavigation();
  const now = new Date();

  const [loading, setLoading] = useState(true);
  const [upcomingContributions, setUpcomingContributions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [user, setUser] = useState(null);


  const fetchDashboardData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      if (!parsedUser || !parsedUser._id) {
        console.warn('User ID not found in AsyncStorage');
        return;
      }

      setUser(parsedUser);
      const firstName = parsedUser.name?.split(' ')[0] || 'User';
      setUserName(firstName);

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
      );const groupsRes = await axios.get(`${API_BASE_URL}/api/groups/member/${parsedUser._id}`);
      const groupList = groupsRes.data || [];
      console.log('📦 Raw groups:', groupList);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const contributions = groupList
        .filter(group => group.status === 'active' && group.lastContributionDate && group.frequency)
        .map((group, index) => {
          const lastDate = new Date(group.lastContributionDate);
          let nextDate = new Date(lastDate);
      
          switch (group.frequency) {
            case 'Weekly':
              nextDate.setDate(lastDate.getDate() + 7);
              break;
            case 'Bi-Weekly':
              nextDate.setDate(lastDate.getDate() + 14);
              break;
            case 'Monthly':
              nextDate.setMonth(lastDate.getMonth() + 1);
              break;
            default:
              break;
          }
      
          const isUpcoming = nextDate >= today;
      
          console.log('🔍 Group:', group.name, 'Last:', lastDate, 'Next:', nextDate, 'Show:', isUpcoming);
      
          return isUpcoming
            ? {
                id: group._id || index.toString(),
                group: group.name,
                time: nextDate.toLocaleString(),
                frequency: group.frequency,
                amount: group.contributionAmount
                  ? `₱${Number(group.contributionAmount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`
                  : '₱0.00',
              }
            : null;
        })
        .filter(item => item !== null);
      
      setUpcomingContributions(contributions);      

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
      {/* Header Icons */}
      <View style={styles.header}>
        <View style={styles.iconRow}>
        <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')}>
          <Icon name="search" size={26} color="#3A6953" />
        </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('GroupChats')}>
            <Icon name="chatbubbles" size={26} color="#3A6953" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}>
            <Icon name="notifications" size={26} color="#3A6953" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>Hi, {userName}!</Text>
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
            <Text style={styles.monthText}>
              Month of {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()} ›
            </Text>
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

      {/* Modal for incomplete profile */}
      <Modal visible={showIncompleteModal} transparent animationType="fade" onRequestClose={() => {}} hardwareAccelerated>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 10,
                color: '#3A6953',
              }}>
              Complete Your Profile
            </Text>
            <Text style={{fontSize: 14, color: '#555', textAlign: 'center'}}>
              To use WulaPal features, please complete your profile information.
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowIncompleteModal(false);
                navigation.navigate('ProfileScreen', {userId: user?._id});
              }}
              style={{
                marginTop: 20,
                backgroundColor: '#3A6953',
                padding: 12,
                borderRadius: 10,
                width: '80%',
              }}>
              <Text
                style={{
                  color: 'white',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}>
                Go to Profile
              </Text>
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
    paddingTop: 20,
    paddingHorizontal: 15,
    paddingBottom: 0,
    alignItems: 'flex-end',
  },
  iconRow: {
    flexDirection: 'row',
    gap: 15,
  },
  greetingContainer: {
    marginTop: 20,
    marginHorizontal: 15,
    marginBottom: 5,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '900',
    color: '#3A6953',
  },
  subtitle: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 15,
  },
  balanceSection: {
    marginHorizontal: 15,
    marginBottom: 25,
  },
  balance: {
    fontSize: 48,
    fontWeight: '800',
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
  scrollBody: {
    flex: 1,
  },
  contributionsContainer: {
    marginTop: 10,
    backgroundColor: '#DBE7DF',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    paddingHorizontal: 15,
    paddingBottom: 40,
    position: 'relative',
    minHeight: screenHeight * 0.6,
  },
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
    marginTop: 0,
    marginBottom: 20,
  },
  
  contributionsTitleText: {
    fontSize: 18,
    fontWeight: '600', // Replace with fontFamily if using Poppins
    color: '#ffffff',
    backgroundColor: '#3A6953',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 999, // Pill shape
    overflow: 'hidden',
    textAlign: 'center',
  },
  
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A6953',
    marginTop: 10,
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
