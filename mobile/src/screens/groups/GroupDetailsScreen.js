import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const GroupDetailsScreen = ({ route }) => {
  const { group } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: group.image }} style={styles.image} />
      <Text style={styles.name}>{group.name}</Text>
      <Text style={styles.details}>{group.slots} Slots</Text>
      <Text style={styles.details}>{group.amount}</Text>
      <Text style={styles.details}>Handler: {group.handler}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  details: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
});

export default GroupDetailsScreen;
