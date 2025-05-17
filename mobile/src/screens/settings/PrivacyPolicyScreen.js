import React from 'react';
import {
  Linking,
  TouchableOpacity,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from 'react-native';

const PrivacyPolicyScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Privacy Policy</Text>
    <Text style={styles.subtitle}>Effective Date: May 30, 2025</Text>

    <Section title="1. Information We Collect">
      <BulletList
        items={[
          'Personal details: Name, Birthdate, Gender, Address, Mobile number, and Email',
          'Verification data: Profile image, and Government-issued ID',
          'Financial activity: Wallet transactions, Group contributions, and Payouts',
          'Device and session data: IP address, Browser type, and Timestamps',
        ]}
      />
    </Section>

    <Section title="2. How We Use Your Information">
      <BulletList
        items={[
          'To create and manage accounts',
          'To automate contributions and payouts',
          'To provide user support and send notifications',
          'To comply with KYC/AML requirements',
        ]}
      />
    </Section>

    <Section title="3. User Control Over Funds">
      <Text style={styles.text}>
        Users (organizers and members) always maintain control over their wallet
        balances. WulaPal cannot move, withdraw, or access user funds without
        explicit user consent through platform actions.
      </Text>
    </Section>

    <Section title="4. Legal Compliance">
      <Text style={styles.text}>We comply with:</Text>
      <BulletList
        items={[
          'RA 10173 - Data Privacy Act of 2012',
          'RA 8792 - E-Commerce Act of 2000',
          'BSP E-Money & KYC Guidelines',
        ]}
      />
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        <Text style={styles.text}>You may contact the </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://privacy.gov.ph')}>
          <Text style={[styles.text, styles.link]}>
            National Privacy Commission (NPC)
          </Text>
        </TouchableOpacity>
        <Text style={styles.text}>
          {' '}
          for any violations of your data rights.
        </Text>
      </View>
    </Section>

    <Section title="5. Your Rights">
      <BulletList
        items={[
          'Access, update, or delete your personal data',
          'Withdraw consent to data processing',
          'Request account deletion',
        ]}
      />
    </Section>

    <Section title="6. Data Protection Measures">
      <Text style={styles.text}>
        Your data is stored securely using encryption, access controls, and
        secure hosting practices. While we take every precaution, no system is
        completely immune to breaches.
      </Text>
    </Section>

    <Section title="7. Updates">
      <Text style={styles.text}>
        This Privacy Policy may be updated at any time. We will notify you
        through the platform or email. Continued use of the platform after
        changes indicates your agreement.
      </Text>
    </Section>

    <Section title="8. Contact Us">
      <Text style={styles.text}>
        If you have any questions or concerns about these policies, please
        contact us at:
      </Text>
      <Text style={styles.text}>
        Email: rams_company@gmail.com{'\n'}
        Phone: 09544852365{'\n'}
        Office Address: 57 Building 2, Generoso St., Obrero, Buhangin (Pob.),
        Davao City, Davao del Sur, 8000
      </Text>
    </Section>
  </ScrollView>
);

const Section = ({title, children}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const BulletList = ({items}) => (
  <View style={{paddingLeft: 16}}>
    {items.map((item, index) => (
      <Text key={index} style={styles.bulletItem}>
        • {item}
      </Text>
    ))}
  </View>
);

export default PrivacyPolicyScreen;

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
    fontSize: 14,
    color: '#6A8C73',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {marginBottom: 20},
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#285236',
    marginBottom: 8,
    textAlign: 'justify',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    textAlign: 'justify',
    marginBottom: 10,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 5,
    textAlign: 'justify',
  },
  link: {
    color: '#285236',
    textDecorationLine: 'underline',
  },
});
