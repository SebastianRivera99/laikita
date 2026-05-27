import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const theme = useThemeColors();

  if (isLoading) return null;
  
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="products" />
      <Stack.Screen name="owners" />
      <Stack.Screen name="pets" />
      <Stack.Screen name="treatments" />
    </Stack>
  );
}