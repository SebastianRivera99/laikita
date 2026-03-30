// ============================================
// LAIKITA - SearchBar Component
// ============================================

import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar...' }: SearchBarProps) {
  const theme = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceSecondary }]}>
      <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
      />
      {value.length > 0 && (
        <Ionicons
          name="close-circle"
          size={20}
          color={theme.textTertiary}
          onPress={() => onChangeText('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.radius.md,
    paddingHorizontal: Layout.spacing.md,
    height: 44,
    gap: 10,
    marginBottom: Layout.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    height: '100%',
  },
});
