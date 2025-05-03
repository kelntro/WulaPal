import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

const PrivacyPolicyScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Privacy Policy</Text>
    <Text style={styles.text}>
      We value your privacy. This policy explains how WulaPal collects, uses, and protects your data...
    </Text>
  </ScrollView>
);

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#3A6953', marginBottom: 10 },
  text: { fontSize: 14, lineHeight: 22, color: '#333' },
});
