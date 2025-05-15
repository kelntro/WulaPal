import React from 'react';
import {ScrollView, Text, View, StyleSheet} from 'react-native';

const TermsScreen = () => (
  <ScrollView contentContainerStyle={styles.container}>
    <Text style={styles.title}>Terms and Conditions</Text>
    <Text style={styles.subtitle}>Effective Date: May 30, 2025</Text>

    <Section title="1. Acceptance of Terms">
      <Text style={styles.text}>
        By accessing or using WulaPal, you confirm that you are at least 18 years old or have obtained parental/guardian consent and agree to be bound by these terms and applicable laws.
      </Text>
    </Section>

    <Section title="2. Use of the Platform">
      <Text style={styles.subheading}>2.1 License Grant:</Text>
      <Text style={styles.text}>
        WulaPal grants you a limited, non-exclusive, non-transferable, revocable license to use the platform for personal, non-commercial purposes.
      </Text>
      <Text style={styles.subheading}>2.2 Prohibited Activities:</Text>
      <BulletList
        items={[
          'Use the platform for unlawful purposes.',
          'Attempt to reverse engineer, modify, or distribute the platform.',
          'Upload viruses, malware, or other harmful content.',
          'Violate the rights of other users or third parties.',
        ]}
      />
    </Section>

    <Section title="3. Account Registration and Security">
      <Text style={styles.subheading}>3.1 Account Creation:</Text>
      <Text style={styles.text}>
        You may need to create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials.
      </Text>
      <Text style={styles.subheading}>3.2 Account Responsibility:</Text>
      <Text style={styles.text}>
        You agree to notify us immediately of any unauthorized use of your account. WulaPal will not be liable for any losses or damages arising from unauthorized account access.
      </Text>
    </Section>

    <Section title="4. Privacy and Data Collection">
      <Text style={styles.text}>
        WulaPal values your privacy. Please review our Privacy Policy for details on how we collect, use, and protect your personal information.
      </Text>
    </Section>

    <Section title="5. Intellectual Property">
      <Text style={styles.text}>
        All content, features, and functionalities of the platform are owned by WulaPal or its licensors and are protected by intellectual property laws.
      </Text>
    </Section>

    <Section title="6. Payments and Subscriptions">
      <Text style={styles.subheading}>6.1 Fees:</Text>
      <Text style={styles.text}>
        Some features of the platform may require payment. All fees are disclosed within the platform and are subject to change with notice.
      </Text>
      <Text style={styles.subheading}>6.2 Subscriptions:</Text>
      <Text style={styles.text}>
        If the platform offers subscriptions, you agree to recurring charges as specified during sign-up. You can manage or cancel through your settings.
      </Text>
    </Section>

    <Section title="7. Disclaimer of Warranties">
      <Text style={styles.text}>
        The platform is provided on an "as-is" and "as-available" basis. WulaPal makes no warranties, express or implied, regarding functionality, reliability, or suitability.
      </Text>
    </Section>

    <Section title="8. Limitation of Liability">
      <Text style={styles.text}>
        To the fullest extent permitted by law, WulaPal and its affiliates are not liable for any direct, indirect, incidental, or consequential damages from your use of the platform.
      </Text>
    </Section>

    <Section title="9. Termination">
      <Text style={styles.text}>
        WulaPal may suspend or terminate your access at any time without notice for violations or any other necessary reasons.
      </Text>
    </Section>

    <Section title="10. Changes to Terms and Conditions">
      <Text style={styles.text}>
        Terms may be updated at any time. Continued use constitutes acceptance of the changes.
      </Text>
    </Section>

    <Section title="11. Governing Law">
      <Text style={styles.text}>
        These terms are governed by the laws of the Republic of the Philippines, including but not limited to the Civil Code, E-Commerce Act (RA 8792), and other regulations. Disputes shall be resolved in Davao City courts.
      </Text>
    </Section>

    <Section title="12. Financial Transactions and User Control">
      <Text style={styles.text}>
        Users retain full ownership and control over funds. WulaPal facilitates contributions and payouts via smart contracts and does not directly hold user funds.
      </Text>
    </Section>

    <Section title="13. Smart Contracts and Irreversibility">
      <Text style={styles.text}>
        Transactions via smart contracts are irreversible. Users must verify accuracy before authorizing.
      </Text>
    </Section>

    <Section title="14. Refunds and Disputes">
      <Text style={styles.text}>
        All fees are final unless stated otherwise. Contact support with transaction details for review.
      </Text>
    </Section>

    <Section title="15. Contact Us">
      <Text style={styles.text}>
        Email: rams_company@gmail.com{"\n"}
        Phone: +63 9544852365{"\n"}
        Office Address: 57 Building 2, Generoso St., Obrero, Buhangin (Pob.), Davao City, Davao del Sur, 8000
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

export default TermsScreen;

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6A8C73',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'justify',
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    textAlign: 'justify',
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    marginBottom: 5,
    textAlign: 'justify',
  },
});
