import { useContext, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthContext } from '@/context/AuthContext/AuthContext';

// register-success is intentionally excluded: a just-registered (logged-in)
// user must be allowed to see it without being bounced to home.
const PUBLIC_ROUTES = ['login', 'register', 'onboarding'];

function useAuthRedirect() {
  const { state, isLoading } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const currentScreen = segments[segments.length - 1] as string;
    const isOnPublicRoute = PUBLIC_ROUTES.includes(currentScreen);

    if (!state.user && !isOnPublicRoute) {
      router.replace('/(tabs)/login');
    } else if (state.user && isOnPublicRoute) {
      router.replace('/(tabs)/');
    }
  }, [state.user, isLoading]);
}

export default function TabsLayout() {
  const { state, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F4F6F8', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#1B3A6B" />
      </View>
    );
  }

  return (
    <AuthGuardStack isAuthenticated={!!state.user} />
  );
}

function AuthGuardStack({ isAuthenticated }: { isAuthenticated: boolean }) {
  useAuthRedirect();

  return (
    <Stack
      initialRouteName={isAuthenticated ? 'index' : 'login'}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-success" options={{ gestureEnabled: false }} />
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
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
      <Stack.Screen name="plan-day" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}
