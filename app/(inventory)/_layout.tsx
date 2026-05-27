// ============================================
// LAIKITA - Inventory Layout
// Solo para gestión de productos
// ============================================

import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function InventoryLayout() {
  const { user, isLoading } = useAuth();
  const theme = useThemeColors();

  if (isLoading) return null;
  
  // Solo inventory puede acceder
  if (!user || user.role !== 'inventory') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="products" />
    </Stack>
  );
}