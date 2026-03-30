// ============================================
// LAIKITA - Card Component
// ============================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  noPadding?: boolean;
}

export default function Card({ children, onPress, style, noPadding }: CardProps) {
  const theme = useThemeColors();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.surface,
    borderRadius: Layout.radius.lg,
    padding: noPadding ? 0 : Layout.spacing.md,
    shadowColor: theme.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.borderLight,
  };

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
