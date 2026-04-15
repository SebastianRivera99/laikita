// ============================================
// LAIKITA - Register Screen (Optimizado)
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
import { registerFields } from '@/constants/FormFields';
import FormBuilder from '@/components/ui/FormBuilder';
import Button from '@/components/ui/Button';

export default function RegisterScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({
    name: '', email: '', password: '', confirmPassword: '',
  });

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const showMsg = (msg: string) => {
    Platform.OS === 'web' ? window.alert(msg) : null;
  };

  const handleRegister = async () => {
    if (!values.name || !values.email || !values.password || !values.confirmPassword) {
      showMsg('Por favor completa todos los campos');
      return;
    }
    if (values.password !== values.confirmPassword) {
      showMsg('Las contraseñas no coinciden');
      return;
    }
    if (values.password.length < 4) {
      showMsg('La contraseña debe tener al menos 4 caracteres');
      return;
    }
    await register(values.name, values.email, values.password);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={[styles.logoCircle, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="paw" size={32} color={Colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Crear cuenta</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Únete a Laikita y gestiona tu veterinaria</Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            <FormBuilder fields={registerFields} values={values} onChange={onChange} />
            <Button title="Crear cuenta" onPress={handleRegister} loading={isLoading} fullWidth size="lg" style={{ marginTop: 8 }} />
          </View>

          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: theme.textSecondary }]}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.loginLink, { color: Colors.primary }]}>Inicia sesión</Text>
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
  header: { alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginBottom: 16 },
  logoCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: Layout.fontSize.xxl, fontWeight: '800' },
  subtitle: { fontSize: Layout.fontSize.md, marginTop: 4, textAlign: 'center' },
  formCard: { borderRadius: Layout.radius.xl, padding: Layout.spacing.lg, borderWidth: 1, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: Layout.fontSize.md },
  loginLink: { fontSize: Layout.fontSize.md, fontWeight: '700' },
});
