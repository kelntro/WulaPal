import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const MessageUserScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null); // ✅ new state

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      const parsed = userData ? JSON.parse(userData) : null;
      setCurrentUserId(parsed?._id); // ✅ set once
    };

    loadUser();
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/conversation/${userId}`
      );
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('❌ Error fetching conversation:', err.message);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || !currentUserId) return;

    try {
      const res = await fetch('${API_BASE_URL}/api/messages/send', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUserId: userId,
          fromUserId: currentUserId,
          content: message,
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const newMessage = {
        content: message,
        from: currentUserId,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (err) {
      console.error("❌ Error sending message:", err.message);
      alert("Failed to send message.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const isMe = item.from === currentUserId; // ✅ compare here
          return (
            <View
              style={[
                styles.messageBubble,
                isMe ? styles.outgoing : styles.incoming,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7faf9' },
  messageBubble: {
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '70%',
  },
  incoming: { backgroundColor: '#ddd', alignSelf: 'flex-start' },
  outgoing: { backgroundColor: '#3A6953', alignSelf: 'flex-end' },
  messageText: { color: 'white' },
  inputRow: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3A6953',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
});

export default MessageUserScreen;
