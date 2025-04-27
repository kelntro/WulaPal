import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import HomeScreen from '../screens/dashboard/HomeScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GroupsScreen from '../screens/groups/GroupsScreen';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

const AnimatedTabIcon = ({ name, label, focused }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.iconCircle,
          { transform: [{ scale: scaleAnim }], opacity: scaleAnim },
        ]}
      />
      <Icon name={name} size={22} color={focused ? "#FFFFFF" : "#888"} />
      <Text style={[styles.tabText, focused && styles.tabTextFocused]}>{label}</Text>
    </View>
  );
};

const CustomTabBar = ({ state, navigation }) => {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {/* Groups */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('Groups')}
        >
          <Ionicons
            name={state.index === 0 ? 'people' : 'people-outline'}
            size={28}
            color={state.index === 0 ? '#3A6953' : '#B0B0B0'}
          />
        </TouchableOpacity>

        {/* Wallet */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Ionicons
            name={state.index === 1 ? 'wallet' : 'wallet-outline'}
            size={28}
            color={state.index === 1 ? '#3A6953' : '#B0B0B0'}
          />
        </TouchableOpacity>

        {/* Empty space */}
        <View style={{ width: 70 }} />

        {/* Transactions */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Ionicons
            name={state.index === 3 ? 'swap-horizontal' : 'swap-horizontal-outline'}
            size={28}
            color={state.index === 3 ? '#3A6953' : '#B0B0B0'}
          />
        </TouchableOpacity>

        {/* Profile */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons
            name={state.index === 4 ? 'person' : 'person-outline'}
            size={28}
            color={state.index === 4 ? '#3A6953' : '#B0B0B0'}
          />
        </TouchableOpacity>
      </View>

      {/* Floating Home Button */}
      <TouchableOpacity
        style={styles.homeButtonWrapper}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.8}
      >
        <View style={styles.homeButton}>
          <Image
            source={require('../assets/4.png')} // 🟢 Update with your actual home logo path
            style={{
              width: 58,
              height: 58,
              tintColor: state.index === 2 ? '#ffffff' : '#B0B0B0',
            }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};


const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
  initialRouteName="Home"
  tabBar={(props) => <CustomTabBar {...props} />}
  screenOptions={{ headerShown: false }}
>

      <Tab.Screen
        name="Groups"
        component={GroupsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.animatedButton, focused && styles.animatedButtonActive]}>
              <AnimatedTabIcon name="users" label="Groups" focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.animatedButton, focused && styles.animatedButtonActive]}>
              <AnimatedTabIcon name="wallet" label="Wallet" focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
            tabBarIcon: ({ focused }) => (
            <View style={styles.homeWrapper}>
                <Animated.View
                style={[
                    styles.iconCircle,
                    { opacity: focused ? 1 : 0, transform: [{ scale: focused ? 1 : 0 }] },
                ]}
                />
                <Image 
                source={require('../assets/4.png')} 
                style={[styles.homeIcon, { tintColor: focused ? "#FFFFFF" : "#888" }]}
                />
                <Text style={[styles.tabText, styles.homeTabText, focused && styles.tabTextFocused]}>Home</Text>
            </View>
            ),
        }}
        />


      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.animatedButton, focused && styles.animatedButtonActive]}>
              <AnimatedTabIcon name="clock-rotate-left" label="History" focused={focused} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.animatedButton, focused && styles.animatedButtonActive]}>
              <AnimatedTabIcon name="user" label="Profile" focused={focused} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const CustomTabBarButton = ({ children, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start(() => onPress && onPress());
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.middleButton}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonWrapper: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
    zIndex: 10,
  },
  homeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#3A6953',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  tabTextFocused: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  iconCircle: {
    position: 'absolute',
    width: 55, // Uniform size for all background circles
    height: 55,
    borderRadius: 40, // Full circle
    backgroundColor: '#2E7D32',
    alignSelf: 'center',
    top: -5,  // Adjusted to match middle button positioning
  },  
  animatedButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: 65,
    marginHorizontal: 2,
  },
  animatedButtonActive: {
    backgroundColor: '#2E7D32',
    borderRadius: 40,
    width: 55,  // Same as home button
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5, // Align with middle button
  },  
  middleButton: {
    width: 65,
    height: 65,
    backgroundColor: '#2E7D32',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15, // Adjusted to keep it in sync
    elevation: 10,
  },  
  middleIcon: {
    width: 65,
    height: 65,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  middleIconActive: {
    width: 65,
    height: 65,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32', // Green only when active
  }, 
  homeIcon: {
    width: 55,  // Keep the icon large
    height: 55,
    resizeMode: 'contain',
    marginBottom: -10, // Moves the icon up slightly to align better
  },
  homeIconActive: {
    tintColor: '#FFFFFF', 
  },
  homeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -5, // Moves everything up slightly to align with other tabs
  },
  homeTabText: {
    marginTop: -5, // Moves text up to align with other tabs
  },
});

export default BottomTabNavigator;
