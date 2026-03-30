// ============================================
// LAIKITA - Root Layout
// Auth check + Providers + Theme
// ============================================

import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { CartProvider } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useThemeColors';

function RootLayoutNav() {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const theme = useThemeColors();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const timeout = setTimeout(() => {
      const inAuthGroup = segments[0] === '(auth)';

      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/login');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [isAuthenticated, segments, isMounted]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="owner/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="pet/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="treatment/[id]" options={{ headerShown: false, presentation: 'card' }} />
        <Stack.Screen name="owner/create" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="pet/create" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="treatment/create" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <CartProvider>
            <RootLayoutNav />
          </CartProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
