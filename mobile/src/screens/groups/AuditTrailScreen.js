import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const AuditTrailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/group-transactions/${groupId}`);
      const sortedTransactions = response.data.sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      );
      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("❌ Failed to fetch audit trail:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const transactionTypes = [
    { id: 'all', label: 'All' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'receive', label: 'Payouts' },
    { id: 'transfer', label: 'Contributions' },
    { id: 'refund', label: 'Refunds' }
  ];

  const filteredTransactions = transactions.filter(tx => {
    // First check if it matches the selected type
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    
    // Exclude organizer and system transactions
    const isOrganizerOrSystem = tx.metadata?.type === 'organizer_share' || 
                               tx.metadata?.type === 'system_share' ||
                               tx.metadata?.type === 'admin_share';
    
    return matchesType && !isOrganizerOrSystem;
  });

  const renderTypeSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.typeSelector}
    >
      {transactionTypes.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.typeButton,
            selectedType === type.id && styles.selectedTypeButton
          ]}
          onPress={() => setSelectedType(type.id)}
        >
          <Text style={[
            styles.typeButtonText,
            selectedType === type.id && styles.selectedTypeButtonText
          ]}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.user}>{item.user}</Text>
      <Text style={styles.detail}>
        {item.type?.toUpperCase()} • ₱{item.amountPHP}
        {item.amountUSDT ? ` • ≈ ${item.amountUSDT} USDT` : ''}
      </Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.datetime}>{item.date} at {item.time}</Text>
      {item.metadata?.type && (
        <Text style={styles.metadata}>Type: {item.metadata.type}</Text>
      )}

      {item.txHash && (
        <TouchableOpacity
          onPress={() => Linking.openURL(`https://amoy.polygonscan.com/tx/${item.txHash}`)}
        >
          <Text style={styles.link}>🔗 View on PolygonScan</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#3A6953" />
      ) : (
        <>
          {renderTypeSelector()}
          {filteredTransactions.length === 0 ? (
            <Text style={styles.emptyText}>
              {selectedType === 'all' 
                ? "No transactions found for this group."
                : `No ${selectedType} transactions found.`}
            </Text>
          ) : (
            <FlatList
              data={filteredTransactions}
              keyExtractor={(item) => item.referenceId}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={true}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16 
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  typeSelector: {
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    width: 120,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#3A6953',
    borderColor: '#3A6953',
  },
  typeButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },
  selectedTypeButtonText: {
    color: '#fff',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    flex: 1,
  },
  user: { 
    fontSize: 16, 
    fontWeight: 'bold',
    color: '#333'
  },
  detail: { 
    fontSize: 14, 
    marginTop: 4,
    fontWeight: '500',
    color: '#333'
  },
  status: { 
    fontSize: 14, 
    color: '#333', 
    marginTop: 4 
  },
  datetime: { 
    fontSize: 13, 
    color: '#555', 
    marginTop: 2 
  },
  metadata: { 
    fontSize: 13, 
    color: '#666', 
    marginTop: 2 
  },
  link: { 
    marginTop: 6, 
    fontWeight: '500',
    color: '#3A6953'
  },
  emptyText: { 
    marginTop: 20, 
    textAlign: 'center', 
    color: '#888' 
  },
});

export default AuditTrailScreen;
