// ============================================
// LAIKITA - Forgot Password Screen
// Sobrescribe contraseña por correo
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import Button from '@/components/ui/Button';
import { authAPI } from '@/utils/api';

export default function ForgotPasswordScreen() {
  const theme = useThemeColors();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      alert(message);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showMessage('Completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('La confirmación de contraseña no coincide');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);

      const response = await authAPI.changePassword(email, newPassword);

      showMessage(response.message || 'Contraseña actualizada correctamente');
      router.replace('/(auth)/login');
    } catch (error: any) {
      showMessage(error.message || 'No se pudo actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.logoCircle, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="key-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Restablecer contraseña</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Ingresa el correo y define una nueva contraseña
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.surface, borderColor: theme.borderLight },
            ]}
          >
            <Text style={[styles.label, { color: theme.text }]}>Correo electrónico</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.borderLight,
                  backgroundColor: theme.background,
                },
              ]}
            />

            <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>
              Nueva contraseña
            </Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Nueva contraseña"
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.borderLight,
                  backgroundColor: theme.background,
                },
              ]}
            />

            <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>
              Confirmar contraseña
            </Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmar contraseña"
              secureTextEntry
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                {
                  color: theme.text,
                  borderColor: theme.borderLight,
                  backgroundColor: theme.background,
                },
              ]}
            />

            <Button
              title="Actualizar contraseña"
              onPress={handleResetPassword}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: 18 }}
            />

            <Button
              title="Volver al login"
              onPress={() => router.back()}
              fullWidth
              size="lg"
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: Layout.spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.lg,
    borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});