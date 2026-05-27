import { useRouter, useLocalSearchParams } from 'expo-router';

export function useNavigationBack(defaultRoute: string = '/(tabs)') {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const goBack = () => {
    if (from === 'admin') {
      router.push('/(admin)');
    } else {
      router.back();
    }
  };

  return { goBack, from };
}