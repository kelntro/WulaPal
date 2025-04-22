'use client';

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

const UserProfileScreen = () => {
  const route = useRoute();
  const {userId} = route.params;
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`http://10.0.2.2:5050/api/users/${userId}`);
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
    <View style={styles.container}>
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.userId}>User ID: {user._id}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MessageUserScreen', {userId})}>
        <Text style={styles.buttonText}>Message</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f7faf9',
  },
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  name: {fontSize: 26, fontWeight: 'bold', color: '#285236', marginBottom: 10},
  email: {fontSize: 16, color: '#666', marginBottom: 10},
  userId: {fontSize: 12, color: '#aaa', marginBottom: 20},
  button: {
    backgroundColor: '#3A6953',
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
    width: '70%',
    alignItems: 'center',
  },
  buttonText: {color: 'white', fontWeight: 'bold', fontSize: 16},
});

export default UserProfileScreen;
