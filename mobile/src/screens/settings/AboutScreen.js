import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from 'react-native';

const AboutScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>About WulaPal</Text>

    <Text style={styles.text}>
      WulaPal is a digital platform designed to modernize the traditional
      Paluwagan savings system by integrating blockchain technology, smart
      contracts, and financial automation. It enables groups to create secure,
      transparent, and digitalized rotating savings and credit arrangements
      while maintaining the cultural essence of Paluwagan.
    </Text>

    <Text style={styles.text}>
      Through WulaPal, members can join savings groups, contribute funds, and
      receive payouts automatically according to preset cycles. The platform
      ensures accountability by utilizing smart contracts to automate
      contributions, payouts, and transaction logging, solving common issues
      such as missed payments or mismanagement.
    </Text>

    <Text style={styles.text}>
      The platform is also integrated with mobile wallets, notifications, and
      KYC features to make financial inclusion more accessible, especially for
      unbanked communities in the Philippines.
    </Text>

    <Text style={styles.subtitle}>Developed By</Text>

    <TouchableOpacity
      onPress={() => Linking.openURL('https://www.instagram.com/khaelzen/')}>
      <Text style={styles.link}>Michael E. Entero</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() =>
        Linking.openURL('https://web.facebook.com/ReyHelorentino/')
      }>
      <Text style={styles.link}>Rey S. Helorentino</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => Linking.openURL('https://web.facebook.com/Alibaba.Plnds')}>
      <Text style={styles.link}>Alejane O. Pelandas</Text>
    </TouchableOpacity>

    <Text style={styles.text}>
      From the College of Information and Computing at the University of
      Southeastern Philippines (USeP).
    </Text>
  </ScrollView>
);

export default AboutScreen;

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3A6953',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#285236',
    marginTop: 20,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 10,
    marginTop: 10,
  },
  link: {
    fontSize: 14,
    lineHeight: 22,
    color: '#285236',
    textDecorationLine: 'underline',
    marginBottom: 5,
  },
});
