// ============================================
// LAIKITA - Button Component
// ============================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useThemeColors();

  const getButtonStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: Layout.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    };

    // Size
    switch (size) {
      case 'sm': Object.assign(base, { paddingHorizontal: 12, paddingVertical: 8 }); break;
      case 'lg': Object.assign(base, { paddingHorizontal: 24, paddingVertical: 16 }); break;
      default: Object.assign(base, { paddingHorizontal: 20, paddingVertical: 12 }); break;
    }

    // Variant
    switch (variant) {
      case 'primary':
        base.backgroundColor = Colors.primary;
        break;
      case 'secondary':
        base.backgroundColor = Colors.secondary;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = Colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = Colors.error;
        break;
    }

    if (disabled || loading) base.opacity = 0.5;
    if (fullWidth) base.width = '100%';

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
    };

    switch (size) {
      case 'sm': base.fontSize = Layout.fontSize.sm; break;
      case 'lg': base.fontSize = Layout.fontSize.lg; break;
      default: base.fontSize = Layout.fontSize.md; break;
    }

    switch (variant) {
      case 'outline':
      case 'ghost':
        base.color = Colors.primary;
        break;
      default:
        base.color = '#FFFFFF';
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getButtonStyle(), style]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFF'} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
