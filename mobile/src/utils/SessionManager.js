import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

let timeoutId = null;
const TIMEOUT_DURATION = 10 * 60 * 1000; // 10 minutes

const SessionManager = {
  startTimer(navigation) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(async () => {
      console.log("⏰ Session expired. Logging out...");

      // Clear token and user
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      Alert.alert('Session Expired', 'You have been logged out due to inactivity.');

      // Navigate back to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    }, TIMEOUT_DURATION);
  },

  resetTimer(navigation) {
    console.log("🖱 User activity detected. Resetting session timer.");
    this.startTimer(navigation);
  },

  clearTimer() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  },
};

export default SessionManager;
