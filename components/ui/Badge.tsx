// ============================================
// LAIKITA - Badge Component
// ============================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: Colors.primarySoft, text: Colors.primaryDark },
  secondary: { bg: Colors.secondarySoft, text: Colors.secondaryDark },
  success: { bg: Colors.successSoft, text: Colors.success },
  warning: { bg: Colors.warningSoft, text: Colors.warning },
  error: { bg: Colors.errorSoft, text: Colors.error },
  info: { bg: Colors.infoSoft, text: Colors.info },
  neutral: { bg: '#F1F3F8', text: '#6B7280' },
};

export default function Badge({ text, variant = 'primary', size = 'md' }: BadgeProps) {
  const colors = variantColors[variant];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? Layout.fontSize.xs : Layout.fontSize.sm,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Layout.radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
