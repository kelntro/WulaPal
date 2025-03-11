import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'; // ✅ Added TouchableOpacity

const SERVER_URL = "http://192.168.56.1:5050"; // Ensure this is correctly defined

const joinGroup = async (groupId) => {
  try {
      const userData = await AsyncStorage.getItem("user");

      if (!userData) {
          alert("❌ User not logged in! Please log in again.");
          return;
      }

      const user = JSON.parse(userData);
      if (!user._id) {
          alert("❌ Invalid user data! Please log in again.");
          return;
      }

      const userId = user._id;

      const response = await fetch(`${SERVER_URL}/api/join-group`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, groupId }),
      });

      const data = await response.json();
      if (data.success) {
          alert("✅ Successfully joined the group!");
      } else {
          alert(`❌ ${data.error}`);
      }
  } catch (error) {
      console.error("❌ Error joining group:", error);
  }
};


const GroupDetailsScreen = ({ route }) => {
  const { group } = route.params;

  return (
      <View style={styles.container}>
          <Image source={{ uri: group.image || "https://via.placeholder.com/150" }} style={styles.image} />
          <Text style={styles.name}>{group.name || "Unknown Group"}</Text>
          <Text style={styles.details}>{group.slots ? `${group.slots} Slots` : "Slots: N/A"}</Text>
          <Text style={styles.details}>Contribution: {group.contributionAmount || "N/A"}</Text>
          <Text style={styles.details}>Handler: {group.handler || "Unknown"}</Text>
          <Text style={styles.description}>{group.description || "No description provided."}</Text>
          
          <TouchableOpacity
              style={styles.joinButton}
              onPress={() => joinGroup(group._id)}
          >
              <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
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
  description: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    textAlign: 'center',
  },
  joinButton: {
    marginTop: 20,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  joinButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default GroupDetailsScreen;
