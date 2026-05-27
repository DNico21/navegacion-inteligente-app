import '@/utils/suppressWarnings';
import { initCrashReporter } from '@/utils/crashReporter';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext/AuthContext';
import { RouteProvider } from '@/context/RouteContext/RouteContext';
import { PlanningProvider } from '@/context/PlanningContext/PlanningContext';

initCrashReporter();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <RouteProvider>
        <PlanningProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="register-success" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PlanningProvider>
      </RouteProvider>
    </AuthProvider>
  );
}
