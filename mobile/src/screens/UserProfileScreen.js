'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '@env';

const UserProfileScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('❌ Error fetching user:', err.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={
          user.profileImage
            ? { uri: user.profileImage }
            : require('../assets/Profile.jpg')
        }
        style={styles.profileImage}
      />

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.role}>Role: {user.role}</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>User ID</Text>
        <Text style={styles.infoValue}>{user._id}</Text>

        <Text style={styles.infoLabel}>Plan</Text>
        <Text style={styles.infoValue}>{user.plan}</Text>

        {user.mobile && (
          <>
            <Text style={styles.infoLabel}>Mobile</Text>
            <Text style={styles.infoValue}>{user.mobile}</Text>
          </>
        )}

        {user.country && (
          <>
            <Text style={styles.infoLabel}>Country</Text>
            <Text style={styles.infoValue}>{user.country}</Text>
          </>
        )}

        {user.address && (
          <>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{user.address}</Text>
          </>
        )}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate('MessageUserScreen', { userId })
        }>
        <Text style={styles.buttonText}>Message User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7faf9',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#3A6953',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#285236',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: '#3A6953',
    marginBottom: 20,
    fontWeight: '600',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 30,
  },
  infoLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 12,
    marginBottom: 2,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#3A6953',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 40,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserProfileScreen;
