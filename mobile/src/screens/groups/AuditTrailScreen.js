import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '@env';

const AuditTrailScreen = ({ route }) => {
  const { groupId } = route.params;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/group-transactions/${groupId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error("❌ Failed to fetch audit trail:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.user}>{item.user}</Text>
      <Text style={styles.detail}>
        {item.type?.toUpperCase()} • ₱{item.amountPHP}
        {item.amountUSDT ? ` • ≈ ${item.amountUSDT} USDT` : ''}
      </Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.datetime}>{item.date} at {item.time}</Text>

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
        <ActivityIndicator size="large" color="#1e90ff" />
      ) : transactions.length === 0 ? (
        <Text style={styles.emptyText}>No transactions found for this group.</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.referenceId}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9'
  },
  user: { fontSize: 16, fontWeight: 'bold' },
  detail: { fontSize: 14, marginTop: 4 },
  status: { fontSize: 14, color: '#333', marginTop: 4 },
  datetime: { fontSize: 13, color: '#555', marginTop: 2 },
  link: { marginTop: 6, color: '#1e90ff', fontWeight: '500' },
  emptyText: { marginTop: 20, textAlign: 'center', color: '#888' },
});

export default AuditTrailScreen;
