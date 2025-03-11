import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";

const SERVER_IP = "192.168.56.1";
const SERVER_URL = `http://${SERVER_IP}:5050`;
const socket = io(SERVER_URL);

const GroupsScreen = () => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("your");
  const [searchText, setSearchText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) {
          console.error("❌ User data not found.");
          return;
        }
        const user = JSON.parse(userData);
        setCurrentUserId(user._id);

        const response = await fetch(`${SERVER_URL}/api/groups`);
        const data = await response.json();

        console.log("📥 Groups fetched:", data);

        const userJoinedGroups = data.filter((group) => group.members.includes(user._id));
        const availableGroupsList = data.filter(
          (group) => !group.members.includes(user._id) && group.members.length < group.requiredMembers
        );

        setUserGroups(userJoinedGroups);
        setAvailableGroups(availableGroupsList);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching groups:", error);
        setLoading(false);
      }
    };

    fetchGroups();

    // ✅ Listen for new groups in real-time
    socket.on("newGroup", (newGroup) => {
      console.log("🔄 New group received:", newGroup);
      if (newGroup.members.length < newGroup.requiredMembers) {
        setAvailableGroups((prevGroups) => [newGroup, ...prevGroups]);
      }
    });

    socket.on("groupUpdated", (updatedGroup) => {
      console.log("🔄 Group updated:", updatedGroup);

      setAvailableGroups((prevGroups) =>
        prevGroups.map((group) => (group._id === updatedGroup._id ? updatedGroup : group))
      );

      setUserGroups((prevGroups) =>
        prevGroups.map((group) => (group._id === updatedGroup._id ? updatedGroup : group))
      );
    });

    return () => {
      socket.off("newGroup");
      socket.off("groupUpdated");
    };
  }, []);

  // Filter groups based on search text
  const filteredGroups = selectedTab === "your"
    ? userGroups.filter((group) => group.name.toLowerCase().includes(searchText.toLowerCase()))
    : availableGroups.filter((group) => group.name.toLowerCase().includes(searchText.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* Toggle Between "Your Groups" and "Join Groups" */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedTab === "your" && styles.activeTab]}
          onPress={() => setSelectedTab("your")}
        >
          <Text style={[styles.toggleText, selectedTab === "your" && styles.activeText]}>
            👥 Your
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedTab === "join" && styles.activeTab]}
          onPress={() => setSelectedTab("join")}
        >
          <Text style={[styles.toggleText, selectedTab === "join" && styles.activeText]}>
            🤝 Join
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search groups..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#285236" />
      ) : (
        <>
          {filteredGroups.length > 0 ? (
            <FlatList
              data={filteredGroups}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <GroupCard group={item} />}
            />
          ) : (
            <Text style={styles.noGroupsText}>
              {selectedTab === "your" ? "You haven't joined any groups yet." : "No available groups to join."}
            </Text>
          )}
        </>
      )}
    </View>
  );
};

// ✅ Group Card Component
const GroupCard = ({ group }) => {
  const navigation = useNavigation();
  const imageUrl = group.image && group.image.startsWith("http") ? group.image : "https://via.placeholder.com/150";

  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.details}>{group.members.length}/{group.requiredMembers} Slots</Text>
        <Text style={styles.details}>₱{group.contributionAmount} {group.frequency}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("GroupDetails", { group })}
        >
          <Text style={styles.buttonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F8F7",
    padding: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    padding: 5,
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: "#285236",
  },
  toggleText: {
    fontSize: 16,
    color: "#285236",
    fontWeight: "bold",
  },
  activeText: {
    color: "white",
  },
  searchInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  noGroupsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginVertical: 10,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#2E7D32",
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  button: {
    marginTop: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

export default GroupsScreen;
