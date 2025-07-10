"use client";

import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { API_BASE_URL } from "@env";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/users/search?q=${searchQuery.trim()}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("❌ Error searching:", err.message);
    }
  };

  const getImageUrl = (profileImage) => {
    return profileImage?.startsWith("http")
      ? profileImage
      : `${API_BASE_URL.replace(/\/$/, "")}/${profileImage?.replace(/\\/g, "/")}`;
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by name, email or ID..."
        placeholderTextColor="#999999"  // ← sets placeholder to black
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        style={styles.input}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.resultItem}
            onPress={() =>
              navigation.navigate("UserProfileScreen", { userId: item._id })
            }
          >
            <View style={styles.row}>
              <Image
                source={{
                  uri:
                    getImageUrl(item.profileImage) ||
                    "https://via.placeholder.com/50",
                }}
                style={styles.profileImage}
                onError={(e) =>
                  console.log("❌ Error loading image:", e.nativeEvent)
                }
              />
              <View style={styles.details}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
                <Text style={styles.userId}>ID: {item._id.slice(-6)}</Text>

                <View style={styles.ratingRow}>
                  <Text style={styles.stars}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Text key={index}>
                        {item.rating && item.rating >= index + 1 ? "★" : "☆"}
                      </Text>
                    ))}
                  </Text>
                  <Text style={styles.ratingText}>
                    {item.ratingPercentage || 0}%
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No results found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7faf9", padding: 20 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  resultItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 60,
    backgroundColor: "#ddd",
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#285236",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  userId: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  stars: {
    color: "#facc15", // Tailwind yellow-400
    fontSize: 16,
  },
  ratingText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
  },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
});

export default SearchScreen;
