// ============================================
// LAIKITA - ThemeContext
// Toggle manual entre modo claro y oscuro
// ============================================

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ThemeColors } from '@/constants/Colors';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeColors;
  toggleTheme: () => void;
  setDark: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // Inicia en modo claro por defecto (para que no esté oscuro)
  const [isDark, setIsDark] = useState(false);

  const theme = isDark ? Colors.dark : Colors.light;

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const setDark = useCallback((value: boolean) => {
    setIsDark(value);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
  return context;
}
