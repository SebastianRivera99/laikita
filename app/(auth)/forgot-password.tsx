// ============================================
// LAIKITA - Recuperar Contraseña (con pregunta secreta)
// ============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, TextInput, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

export default function ForgotPasswordScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const showMessage = (message: string) => {
    Platform.OS === 'web' ? window.alert(message) : Alert.alert('Mensaje', message);
  };

  // Paso 1: Buscar usuario por email
  const checkEmail = async () => {
    if (!email.trim()) {
      showMessage('Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, security_question')
        .eq('email', email)
        .single();

      if (error || !data) {
        showMessage('Correo no encontrado');
        return;
      }

      if (!data.security_question) {
        showMessage('Este usuario no tiene pregunta de seguridad configurada');
        return;
      }

      setUserId(data.id);
      setSecurityQuestion(data.security_question);
      setStep(2);
    } catch (error) {
      showMessage('Error al verificar el correo');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar respuesta secreta
  const verifyAnswer = async () => {
    if (!securityAnswer.trim()) {
      showMessage('Responde la pregunta de seguridad');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .eq('security_answer', securityAnswer.toLowerCase().trim())
        .single();

      if (error || !data) {
        showMessage('Respuesta incorrecta');
        return;
      }

      setStep(3);
    } catch (error) {
      showMessage('Respuesta incorrecta');
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Cambiar contraseña usando la función RPC
  const updatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showMessage('Completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('reset_user_password', {
        user_id: userId,
        new_password: newPassword
      });

      if (error) throw error;

      showMessage('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
      router.push('/(auth)/login');
    } catch (error: any) {
      showMessage(error.message || 'No se pudo cambiar la contraseña');
    } finally {
      setLoading(false);
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
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: theme.surfaceSecondary }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color={theme.text} />
            </TouchableOpacity>
            <View style={[styles.logoCircle, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="shield-outline" size={40} color={Colors.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>Recuperar contraseña</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {step === 1 && 'Ingresa tu correo electrónico'}
              {step === 2 && 'Responde tu pregunta de seguridad'}
              {step === 3 && 'Ingresa tu nueva contraseña'}
            </Text>
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
            
            {/* Paso 1: Email */}
            {step === 1 && (
              <>
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
                    { color: theme.text, borderColor: theme.borderLight, backgroundColor: theme.background },
                  ]}
                />
                <Button
                  title="Continuar"
                  onPress={checkEmail}
                  loading={loading}
                  fullWidth
                  size="lg"
                  style={{ marginTop: 18 }}
                />
              </>
            )}

            {/* Paso 2: Pregunta secreta */}
            {step === 2 && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>Pregunta de seguridad</Text>
                <View style={[styles.questionBox, { backgroundColor: theme.background, borderColor: theme.borderLight }]}>
                  <Text style={[styles.questionText, { color: theme.text }]}>
                    {securityQuestion}
                  </Text>
                </View>
                
                <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>Tu respuesta</Text>
                <TextInput
                  value={securityAnswer}
                  onChangeText={setSecurityAnswer}
                  placeholder="Escribe tu respuesta"
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.borderLight, backgroundColor: theme.background },
                  ]}
                />
                <Button
                  title="Verificar respuesta"
                  onPress={verifyAnswer}
                  loading={loading}
                  fullWidth
                  size="lg"
                  style={{ marginTop: 18 }}
                />
              </>
            )}

            {/* Paso 3: Nueva contraseña */}
            {step === 3 && (
              <>
                <Text style={[styles.label, { color: theme.text }]}>Nueva contraseña</Text>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nueva contraseña"
                  secureTextEntry
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.borderLight, backgroundColor: theme.background },
                  ]}
                />
                <Text style={[styles.label, { color: theme.text, marginTop: 14 }]}>Confirmar contraseña</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirmar contraseña"
                  secureTextEntry
                  placeholderTextColor={theme.textSecondary}
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.borderLight, backgroundColor: theme.background },
                  ]}
                />
                <Button
                  title="Actualizar contraseña"
                  onPress={updatePassword}
                  loading={loading}
                  fullWidth
                  size="lg"
                  style={{ marginTop: 18 }}
                />
              </>
            )}

            <Button
              title="Volver al login"
              onPress={() => router.back()}
              variant="outline"
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
  container: { flexGrow: 1, justifyContent: 'center' },
  content: { padding: Layout.spacing.lg, maxWidth: Layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginBottom: 16 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: Layout.fontSize.md, marginTop: 4, textAlign: 'center' },
  formCard: { borderRadius: Layout.radius.xl, padding: Layout.spacing.lg, borderWidth: 1, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3 },
  label: { fontSize: Layout.fontSize.sm, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  questionBox: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 },
  questionText: { fontSize: 16, fontWeight: '500', textAlign: 'center' },
});