import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const yourGroups = [
  {
    id: '1',
    name: 'Bangke Save Paluwagan',
    slots: 12,
    amount: '₱2,000 Monthly',
    handler: 'Diva David',
    image: 'https://example.com/image1.jpg',
    members: 8,
  },
];

const joinGroups = [
  {
    id: '2',
    name: 'Travel Save Paluwagan',
    slots: 12,
    amount: '₱10,000 Monthly',
    handler: 'Harvey Dan',
    image: 'https://example.com/image2.jpg',
    members: 5,
  },
  {
    id: '3',
    name: 'Turken Save Paluwagan',
    slots: 12,
    amount: '₱5,000 Monthly',
    handler: 'Randy Cruz',
    image: 'https://example.com/image3.jpg',
    members: 10,
  },
];

const GroupsScreen = () => {
  const [activeTab, setActiveTab] = useState('your');
  const navigation = useNavigation();

  const data = activeTab === 'your' ? yourGroups : joinGroups;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Paluwagan</Text>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'your' && styles.activeTab]} 
          onPress={() => setActiveTab('your')}
        >
          <Text style={styles.tabText}>Your Groups</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'join' && styles.activeTab]} 
          onPress={() => setActiveTab('join')}
        >
          <Text style={styles.tabText}>Join Groups</Text>
        </TouchableOpacity>
      </View>

      {/* List of Groups */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.details}>{item.slots} Slots</Text>
              <Text style={styles.details}>{item.amount}</Text>
              <Text style={styles.details}>Handler: {item.handler}</Text>
              <TouchableOpacity 
                style={styles.button} 
                onPress={() => navigation.navigate('GroupDetails', { group: item })}
              >
                <Text style={styles.buttonText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F7',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#D3E6D4',
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
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
});

export default GroupsScreen;
