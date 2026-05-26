import { Stack } from 'expo-router';

export default function TabsLayout() {
  return (
    <Stack initialRouteName="onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="register" />
      <Stack.Screen name="route-setup" />
      <Stack.Screen name="route-detail" />
      <Stack.Screen name="route-profiles" />
      <Stack.Screen name="weekly-history" />
      <Stack.Screen name="wellness-history" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="wellness-mode" />
      <Stack.Screen name="relaxation-library" />
      <Stack.Screen name="guided-breathing" />
      <Stack.Screen name="sabana-zen-chat" />
      <Stack.Screen name="index" />
      <Stack.Screen name="plan-day" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
