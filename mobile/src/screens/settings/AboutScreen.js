import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

const AboutScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>About WulaPal</Text>
    <Text style={styles.text}>
      WulaPal is a digital platform that modernizes the Paluwagan system using smart contracts and automation...
    </Text>
  </ScrollView>
);

export default AboutScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#3A6953', marginBottom: 10 },
  text: { fontSize: 14, lineHeight: 22, color: '#333' },
});
