// ============================================
// LAIKITA - useThemeColors Hook
// Ahora usa ThemeContext en vez del sistema
// ============================================

import { Colors, ThemeColors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';

export function useThemeColors(): ThemeColors & { isDark: boolean } {
  const { isDark, theme } = useTheme();
  return { ...theme, isDark };
}
