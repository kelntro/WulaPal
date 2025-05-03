import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

const TermsScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Terms and Conditions</Text>
    <Text style={styles.text}>
      {/* You can load this from a file or API later */}
      These are the Terms and Conditions for using WulaPal. By accessing the platform...
    </Text>
  </ScrollView>
);

export default TermsScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#3A6953', marginBottom: 10 },
  text: { fontSize: 14, lineHeight: 22, color: '#333' },
});
