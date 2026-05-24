import { Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const theme = useThemeColors();

  if (isLoading) return null;
  
  // Solo admins pueden acceder
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}