"use client";

import React, { useState } from "react";
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`http://10.0.2.2:5050/api/users/search?q=${searchQuery.trim()}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("❌ Error searching:", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by name, email or ID..."
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
            onPress={() => navigation.navigate("UserProfileScreen", { userId: item._id })}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
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
  name: { fontSize: 18, fontWeight: "bold", color: "#285236" },
  email: { fontSize: 14, color: "#666" },
  empty: { textAlign: "center", marginTop: 20, color: "#888" },
});

export default SearchScreen;
