// ============================================
// LAIKITA - Login Screen (Optimizado)
// ============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/context/AuthContext';
import { loginFields } from '@/constants/FormFields';
import FormBuilder from '@/components/ui/FormBuilder';
import Button from '@/components/ui/Button';

export default function LoginScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({ email: '', password: '' });

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleLogin = async () => {
    if (!values.email || !values.password) {
      Platform.OS === 'web'
        ? window.alert('Por favor completa todos los campos')
        : null;
      return;
    }
    await login(values.email, values.password);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="paw" size={44} color={Colors.primary} />
            </View>
            <Text style={[styles.brandName, { color: theme.text }]}>Laikita</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Administración Veterinaria</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>Iniciar sesión</Text>
            <FormBuilder fields={loginFields} values={values} onChange={onChange} />

            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={[styles.forgotText, { color: Colors.primary }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            <Button
              title="Ingresar"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: theme.textSecondary }]}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: Colors.primary }]}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center' },
  content: { padding: Layout.spacing.lg, maxWidth: Layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  brandName: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: Layout.fontSize.md, marginTop: 4 },
  formCard: {
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.lg,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3
  },
  formTitle: { fontSize: Layout.fontSize.xl, fontWeight: '700', marginBottom: 20 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  forgotText: { fontSize: Layout.fontSize.sm, fontWeight: '500' },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { fontSize: Layout.fontSize.md },
  registerLink: { fontSize: Layout.fontSize.md, fontWeight: '700' },
});