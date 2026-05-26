import { LogBox } from 'react-native';

// Suppress Expo Go SDK 53+ push token warning — local notifications still work
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications',
  'expo-notifications: iOS Push notifications',
]);
