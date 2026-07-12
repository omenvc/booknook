import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { useResolvedColorScheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useResolvedColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ title: 'Home' }} />
        <Stack.Screen name="book/[id]" options={{ headerShown: true, title: 'Book Details' }} />
        <Stack.Screen name="checkout" options={{ headerShown: true, title: 'Checkout' }} />
      </Stack>
    </ThemeProvider>
  );
}
