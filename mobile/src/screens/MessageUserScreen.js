import React, { useEffect, useState, useRef } from 'react';
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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';
import { API_BASE_URL } from '@env';

const socket = io(API_BASE_URL);

const MessageUserScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const chatRef = useRef(null);

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

    // Socket connection for real-time messaging
    socket.emit('join-private', { userId, currentUserId: currentUserId });

    socket.on('new-private-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing', ({ user }) => {
      setTypingUsers(prev => [...new Set([...prev, user])]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u !== user));
      }, 3000);
    });

    return () => {
      socket.emit('leave-private', { userId, currentUserId: currentUserId });
      socket.off('new-private-message');
      socket.off('typing');
    };
  }, [userId, currentUserId]);

  useEffect(() => {
    chatRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleTyping = () => {
    if (userName) {
      socket.emit('typing', { userId, user: userName });
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/messages/conversation/${userId}`
      );
      const data = await res.json();
      const normalized = data.map(msg => ({
        ...msg,
        type: msg.type || (msg.content.match(/\.(jpg|jpeg|png|gif)$/i) ? 'file' : 'text')
      }));
      setMessages(normalized);

      // Mark messages as read
      if (currentUserId) {
        await fetch(`${API_BASE_URL}/api/messages/mark-read/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId })
        });
      }
      
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
          type: 'text',
          senderName: userName
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const newMessage = {
        content: message,
        from: currentUserId,
        type: 'text',
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
      console.log("📁 Starting file pick...");
      const res = await DocumentPicker.pickSingle({ type: DocumentPicker.types.allFiles });
      console.log("📁 File picked:", res);

      const formData = new FormData();
      const fileToUpload = {
        uri: Platform.OS === 'ios' ? res.uri.replace('file://', '') : res.uri,
        type: res.type || 'application/octet-stream',
        name: res.name,
      };
      console.log("📁 Preparing file for upload:", fileToUpload);
      
      formData.append('file', fileToUpload);

      console.log("📤 Uploading file to:", `${API_BASE_URL}/api/upload-chat-file`);
      const upload = await fetch(`${API_BASE_URL}/api/upload-chat-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log("📤 Upload response status:", upload.status);
      const data = await upload.json();
      console.log("📤 Upload response data:", data);

      if (data.url) {
        // Ensure the URL is properly formatted
        const fileUrl = data.url.startsWith('http') ? data.url : `${API_BASE_URL}${data.url.startsWith('/') ? '' : '/'}${data.url}`;
        console.log("📤 Sending message with file URL:", fileUrl);
        
        const messageRes = await fetch(`${API_BASE_URL}/api/messages/send`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            toUserId: userId,
            fromUserId: currentUserId,
            content: fileUrl,
            type: 'file'
          }),
        });
        console.log("📤 Message send response status:", messageRes.status);

        if (!messageRes.ok) {
          throw new Error(`Message send failed with status: ${messageRes.status}`);
        }

        const newMessage = {
          content: fileUrl,
          from: currentUserId,
          type: 'file',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("❌ File Upload Error Details:", {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        alert("Failed to upload file. Please try again.");
      }
    }
  };

    const renderItem = ({ item }) => {
      const isMe = item.from === currentUserId;
      const normalizedUrl = item.content.includes('localhost')
        ? item.content.replace('http://localhost:5050', API_BASE_URL)
        : item.content.startsWith('http')
          ? item.content
          : `${API_BASE_URL}${item.content.startsWith('/') ? '' : '/'}${item.content}`;
    
      return (
        <View style={[styles.messageBubble, isMe ? styles.outgoing : styles.incoming]}>
          {item.type === 'file' ? (
            item.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              <Image
                source={{ uri: normalizedUrl, cache: 'reload' }}
                style={styles.messageImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error("❌ Image loading error:", error.nativeEvent);
                  console.log("🔍 Attempted URL:", normalizedUrl);
                }}
                onLoad={() => console.log("✅ Image loaded successfully:", normalizedUrl)}
              />
            ) : (
              <TouchableOpacity onPress={() => Linking.openURL(normalizedUrl)}>
                <Text style={[styles.messageText, isMe && styles.senderText]}>📎 View File</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={[styles.messageText, isMe && styles.senderText]}>{item.content}</Text>
          )}
          <Text style={[styles.timestamp, isMe && styles.senderTimestamp]}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      );
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
        ref={chatRef}
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={{ padding: 20 }}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#888' }}>
            No messages yet.
          </Text>
        }
      />

      {typingUsers.length > 0 && (
        <Text style={styles.typingIndicator}>
          {typingUsers.join(", ")} {typingUsers.length > 1 ? "are" : "is"} typing...
        </Text>
      )}

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickAndSendFile}>
          <Icon name="attach-outline" size={24} color="#3A6953" style={{ marginRight: 8 }} />
        </TouchableOpacity>
        <TextInput
          placeholder="Type a message..."
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            handleTyping();
          }}
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
  incoming: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  outgoing: { backgroundColor: '#DFF0DA', alignSelf: 'flex-end' },
  messageText: { color: '#333' },
  senderText: { color: '#2E7D32' },
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
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 4,
  },
  typingIndicator: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginLeft: 12,
  },
});

export default MessageUserScreen;
