import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AnimatedButton from '../../components/Button';

const HomeScreen = () => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [upcomingContributions, setUpcomingContributions] = useState([]);
  const [payoutSchedule, setPayoutSchedule] = useState([]);
  const [groupStats, setGroupStats] = useState(null); // null until fetched

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Replace with real API calls to your backend
        // Example:
        // const contributionsRes = await fetch('https://your-api.com/contributions');
        // const payoutsRes = await fetch('https://your-api.com/payouts');
        // const statsRes = await fetch('https://your-api.com/group-stats');

        // setUpcomingContributions(await contributionsRes.json());
        // setPayoutSchedule(await payoutsRes.json());
        // setGroupStats(await statsRes.json());

        // For now just set loading false if API integration isn't done yet
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

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
      {/* Header with notification bell */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome to WulaPal 👋</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Icon name="notifications-outline" size={26} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Group Status Summary */}
      {groupStats && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Your Groups</Text>
          <Text>Total Joined: {groupStats.totalGroups}</Text>
          <Text>Active: {groupStats.activeGroups}</Text>
          <Text>Completed: {groupStats.completedGroups}</Text>
        </View>
      )}

      {/* Upcoming Contributions */}
      <Text style={styles.sectionTitle}>Upcoming Contributions</Text>
      {upcomingContributions.length > 0 ? (
        <FlatList
          data={upcomingContributions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.groupName}>{item.group}</Text>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No upcoming contributions.</Text>
      )}

      {/* Scheduled Payouts */}
      <Text style={styles.sectionTitle}>Scheduled Payouts</Text>
      {payoutSchedule.length > 0 ? (
        <FlatList
          data={payoutSchedule}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.groupName}>{item.group}</Text>
              <Text style={styles.date}>{item.payoutDate}</Text>
              <Text style={styles.amount}>{item.amount}</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>No scheduled payouts.</Text>
      )}

      {/* Wallet Navigation */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F4F8F7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  listItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  groupName: { fontWeight: 'bold' },
  date: { color: '#888' },
  amount: { fontWeight: 'bold', color: '#2E7D32' },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  emptyText: { color: '#999', fontStyle: 'italic' },
});

export default HomeScreen;
