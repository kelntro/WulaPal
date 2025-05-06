'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const UserProfileScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchReviews();
    getCurrentUser();
  }, []);
  
  const getCurrentUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error reading user from AsyncStorage:', err);
    }
  };
  
  useEffect(() => {
    fetchUser();
    fetchReviews();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('❌ Error fetching user:', err.message);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${userId}`);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('❌ Error fetching reviews:', err.message);
    }
  };

  const isUserActive = (lastActive) => {
    if (!lastActive) return false;
    const last = moment(lastActive);
    const now = moment();
    return now.diff(last, 'minutes') <= 5; // Active if seen within last 5 mins
  };
  
  const getLastSeenText = (lastActive) => {
    if (!lastActive) return 'Offline';
    return `Last active ${moment(lastActive).fromNow()}`;
  };

  const handleSubmit = async () => {
    if (!rating || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewer: currentUser._id,
          reviewedUser: userId,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setRating(0);
        setComment('');
        fetchReviews();
      }
    } catch (err) {
      console.error('❌ Submit review error:', err.message);
    } finally {
      setSubmitting(false);
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
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={
          user.profileImage
            ? { uri: user.profileImage }
            : require('../assets/Profile.jpg')
        }
        style={styles.profileImage}
      />

<View style={styles.nameRow}>
  <Text style={styles.name}>{user.name}</Text>
  {isUserActive(user.lastActive) && <View style={styles.greenDot} />}
</View>
<Text style={styles.email}>{user.email}</Text>
<Text style={styles.lastSeen}>
  {isUserActive(user.lastActive) ? 'Active now' : getLastSeenText(user.lastActive)}
</Text>

      <Text style={styles.role}>Role: {user.role}</Text>

      <View style={styles.card}>
        <InfoRow label="User ID" value={user._id} />
        {user.country && <InfoRow label="Country" value={user.country} />}
        {user.address && (() => {
          let parsedAddress;
          try {
            parsedAddress = JSON.parse(user.address);
          } catch (err) {
            console.warn('Failed to parse address:', err);
            return null;
          }

          return (
            <>
              {parsedAddress.street && <InfoRow label="Street" value={parsedAddress.street} />}
              {parsedAddress.barangay && <InfoRow label="Barangay" value={parsedAddress.barangay} />}
              {parsedAddress.city && <InfoRow label="City" value={parsedAddress.city} />}
              {parsedAddress.province && <InfoRow label="Province" value={parsedAddress.province} />}
              {parsedAddress.zipCode && <InfoRow label="ZIP Code" value={parsedAddress.zipCode} />}
            </>
          );
        })()}

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MessageUserScreen', { userId })}
      >
        <Text style={styles.buttonText}>Message User</Text>
      </TouchableOpacity>

      {currentUser?._id !== userId && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Leave a Review</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Text
                key={star}
                style={[
                  styles.star,
                  star <= rating ? styles.starActive : styles.starInactive,
                ]}
                onPress={() => setRating(star)}
              >
                ★
              </Text>
            ))}
          </View>
          <TextInput
            placeholder="Write your comment"
            value={comment}
            onChangeText={setComment}
            multiline
            style={styles.commentInput}
          />
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Review'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>User Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>No reviews yet.</Text>
        ) : (
          reviews.map((review, i) => (
            <View key={i} style={styles.reviewItem}>
              <Text style={styles.reviewer}>{review.reviewer.name}</Text>
              <Text style={styles.reviewStars}>
                {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
              </Text>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const InfoRow = ({ label, value }) => (
  <View style={{ marginBottom: 8 }}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7faf9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#285236',
    textAlign: 'center',
  },
  email: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
  },
  role: {
    fontSize: 13,
    color: '#3A6953',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderColor: '#e1e1e1',
    borderWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#222',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3A6953',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#285236',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  star: {
    fontSize: 26,
    marginRight: 6,
  },
  starActive: {
    color: '#FFD700',
  },
  starInactive: {
    color: '#ccc',
  },
  commentInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 10,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#285236',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
  },
  noReviews: {
    color: '#777',
    fontStyle: 'italic',
    fontSize: 14,
  },
  reviewItem: {
    marginBottom: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  reviewer: {
    fontWeight: 'bold',
    color: '#333',
  },
  reviewStars: {
    color: '#FFD700',
    fontSize: 15,
    marginBottom: 4,
  },
  reviewComment: {
    color: '#444',
    fontSize: 14,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greenDot: {
    width: 10,
    height: 10,
    backgroundColor: 'green',
    borderRadius: 5,
    marginLeft: 8,
  },
  lastSeen: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 12,
  },  
});

export default UserProfileScreen;
