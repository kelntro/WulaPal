import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
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

const MemberGroupChat = () => {
  const route = useRoute();
  const { groupId } = route.params;

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    const initUserAndMessages = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) return;
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Fetch group details
      const groupRes = await fetch(`${API_BASE_URL}/api/groups/${groupId}`);
      const groupData = await groupRes.json();
      setGroupName(groupData.name);

      fetch(`${API_BASE_URL}/api/chat/group/${groupId}`)
        .then(res => res.json())
        .then(data => {
          console.log("📩 Loaded messages:", data);
          setMessages(data);
        });

      fetch(`${API_BASE_URL}/api/chat/group/${groupId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: parsedUser._id }),
      });

      socket.emit('join', groupId);

      socket.on('new-message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socket.on('typing', ({ user }) => {
        setTypingUsers(prev => [...new Set([...prev, user])]);
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== user));
        }, 3000);
      });

      return () => {
        socket.emit('leave', groupId);
        socket.off('new-message');
        socket.off('typing');
      };
    };

    initUserAndMessages();
  }, [groupId]);

  useEffect(() => {
    chatRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleTyping = () => {
    if (user?.name) {
      socket.emit('typing', { groupId, user: user.name });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    await fetch(`${API_BASE_URL}/api/chat/group/${groupId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        sender: user._id,
        type: 'text',
        content: input,
      }),
    });

    setInput('');
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
        console.log("📤 Sending message with file URL:", data.url);
        const messageRes = await fetch(`${API_BASE_URL}/api/chat/group/${groupId}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            groupId,
            sender: user._id,
            type: 'file',
            content: data.url,
          }),
        });
        console.log("📤 Message send response status:", messageRes.status);
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
    const isSender = item.sender._id === user._id;
    const firstName = item.sender?.name?.split(' ')[0] || 'Unknown';
  
    return (
      <View style={[styles.messageWrapper, isSender ? styles.alignRight : styles.alignLeft]}>
        {!isSender && (
          <Text style={styles.senderName}>
            {item.sender.name || 'Unknown'}
          </Text>
        )}
        
        <View style={[styles.message, isSender && styles.sender]}>
          
          {item.type === 'file' ? (
            item.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
              
              <Image
                source={{
                  uri: item.content.startsWith('http')
                    ? item.content.replace('http://localhost:5050', API_BASE_URL)
                    : `${API_BASE_URL}${item.content.startsWith('/') ? '' : '/'}${item.content}`,
                  cache: 'reload'
                }}
                style={styles.messageImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error("❌ Image loading error:", error.nativeEvent);
                  console.log("🔍 Attempted URL:", item.content);
                }}
                onLoad={() => console.log("✅ Image loaded successfully:", item.content)}
              />
            ) : (
              <TouchableOpacity onPress={() => {
                const fileUrl = item.content.startsWith('http') ? item.content : `${API_BASE_URL}${item.content}`;
                console.log("🔗 Opening file URL:", fileUrl);
                Linking.openURL(fileUrl);
              }}>
                <Text style={[styles.fileLink, isSender && styles.senderText]}>📎 View File</Text>
              </TouchableOpacity>
            )
          ) : (
            <Text style={[styles.messageText, isSender && styles.senderText]}>
              {item.content}
            </Text>
          )}
          <Text style={[styles.timestamp, isSender && styles.senderTimestamp]}>
            {firstName} • {new Date(item.timestamp).toLocaleString(undefined, {
              year: 'numeric',
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    );
  };
  

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', color: '#888' }}>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{groupName}</Text>
      </View>
      <FlatList
        ref={chatRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 10 }}
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

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickAndSendFile}>
          <Icon name="attach-outline" size={24} color="#3A6953" style={{ marginRight: 8 }} />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={(text) => {
            setInput(text);
            handleTyping();
          }}
          onSubmitEditing={sendMessage}
          placeholder="Type a message..."
          style={styles.input}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Icon name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8F7' },
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
  message: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  sender: {
    backgroundColor: '#DFF0DA',
    alignSelf: 'flex-end',
  },
  messageText: { fontSize: 14, color: '#333' },
  senderText: { color: '#2E7D32' },
  fileLink: { textDecorationLine: 'underline', fontSize: 14 },
  typingIndicator: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    marginLeft: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    backgroundColor: '#3A6953',
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  messageWrapper: {
    marginBottom: 10,
    maxWidth: '80%',
  },
  
  alignLeft: {
    alignSelf: 'flex-start',
  },
  
  alignRight: {
    alignSelf: 'flex-end',
  },
  
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3A6953',
    marginBottom: 4,
    marginLeft: 5,
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
});

export default MemberGroupChat;
