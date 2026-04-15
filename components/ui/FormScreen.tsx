// ============================================
// LAIKITA - FormScreen Wrapper
// Layout reutilizable para pantallas de crear/editar
// Evita repetir SafeAreaView + Header + ScrollView
// ============================================

import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import Button from './Button';

interface FormScreenProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
  submitLabel: string;
  onSubmit: () => void;
  loading?: boolean;
  children: React.ReactNode;
}

export default function FormScreen({
  title, icon, iconColor, iconBgColor,
  submitLabel, onSubmit, loading, children,
}: FormScreenProps) {
  const theme = useThemeColors();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formWrapper}>
            <View style={[styles.iconHeader, { backgroundColor: iconBgColor }]}>
              <Ionicons name={icon} size={32} color={iconColor} />
            </View>
            {children}
            <Button
              title={submitLabel}
              onPress={onSubmit}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg, paddingVertical: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700' },
  scrollContent: { paddingBottom: 60 },
  formWrapper: {
    padding: Layout.spacing.lg, maxWidth: Layout.maxContentWidth,
    width: '100%', alignSelf: 'center',
  },
  iconHeader: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 24,
  },
});
