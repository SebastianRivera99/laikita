// ============================================
// LAIKITA - Auth Layout
// ============================================

import { Stack } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AuthLayout() {
  const theme = useThemeColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'fade',
      }}
    />
  );
}
