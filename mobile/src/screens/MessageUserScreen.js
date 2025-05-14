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
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const MessageUserScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('user');
      const parsed = userData ? JSON.parse(userData) : null;
      setCurrentUserId(parsed?._id);

      // Fetch user details
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        const userData = await res.json();
        setUserName(userData.name);
      } catch (err) {
        console.error('❌ Error fetching user details:', err.message);
      }
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
      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
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

  const pickAndSendFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: DocumentPicker.types.allFiles });

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'ios' ? res.uri.replace('file://', '') : res.uri,
        type: res.type || 'application/octet-stream',
        name: res.name,
      });

      const upload = await fetch(`${API_BASE_URL}/api/upload-chat-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!upload.ok) {
        throw new Error(`Upload failed with status: ${upload.status}`);
      }

      const data = await upload.json();

      if (data.url) {
        const messageRes = await fetch(`${API_BASE_URL}/api/messages/send`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            toUserId: userId,
            fromUserId: currentUserId,
            content: data.url,
            type: 'file'
          }),
        });

        if (!messageRes.ok) {
          throw new Error(`Message send failed with status: ${messageRes.status}`);
        }

        const newMessage = {
          content: data.url,
          from: currentUserId,
          type: 'file',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("❌ File Upload Error:", err);
        alert("Failed to upload file. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userName}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          const isMe = item.from === currentUserId;
          return (
            <View
              style={[
                styles.messageBubble,
                isMe ? styles.outgoing : styles.incoming,
              ]}
            >
              {item.type === 'file' ? (
                <TouchableOpacity onPress={() => {
                  const fileUrl = item.content.startsWith('http') ? item.content : `${API_BASE_URL}${item.content}`;
                  Linking.openURL(fileUrl);
                }}>
                  <Text style={styles.messageText}>📎 View File</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.messageText}>{item.content}</Text>
              )}
              <Text style={[styles.timestamp, isMe && styles.senderTimestamp]}>
                {new Date(item.timestamp).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'numeric',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickAndSendFile}>
          <Icon name="attach-outline" size={24} color="#3A6953" style={{ marginRight: 8 }} />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7faf9' },
  header: {
    backgroundColor: '#3A6953',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2E7D32',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
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
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#3A6953',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  senderTimestamp: {
    color: '#2E7D32',
    alignSelf: 'flex-end',
  },
});

export default MessageUserScreen;
