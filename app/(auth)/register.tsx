// ============================================
// LAIKITA - Register Screen (Con pregunta de seguridad)
// ============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, TextInput,
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
import { supabase } from '@/lib/supabase';

// Opciones de preguntas de seguridad
const questionOptions = [
  '¿Cuál es el nombre de tu primera mascota?',
  '¿Cuál es tu comida favorita?',
  '¿Cuál es el nombre de tu mejor amigo?',
  '¿Cuál es tu ciudad de nacimiento?',
  '¿Cuál es el apellido de tu madre?',
];

export default function RegisterScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [values, setValues] = useState<Record<string, string>>({
    name: '', email: '', password: '', confirmPassword: '',
  });
  
  // Estado para pregunta de seguridad
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const showMsg = (msg: string) => {
    Platform.OS === 'web' ? window.alert(msg) : alert(msg);
  };

  const handleRegister = async () => {
    // Validaciones básicas
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
    if (!securityQuestion) {
      showMsg('Por favor selecciona una pregunta de seguridad');
      return;
    }
    if (!securityAnswer.trim()) {
      showMsg('Por favor responde la pregunta de seguridad');
      return;
    }

    setLoading(true);
    try {
      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Guardar perfil en tabla users con pregunta secreta
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: values.name,
            email: values.email,
            role: 'receptionist',
            security_question: securityQuestion,
            security_answer: securityAnswer.toLowerCase().trim(),
          });

        if (profileError) throw profileError;
      }

      showMsg('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
      router.push('/(auth)/login');
      
    } catch (error: any) {
      console.error('Error en registro:', error);
      showMsg(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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

            {/* Pregunta de seguridad */}
            <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 16 }]}>
              Pregunta de seguridad *
            </Text>
            <View style={styles.questionsContainer}>
              {questionOptions.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[
                    styles.questionChip,
                    {
                      backgroundColor: securityQuestion === q ? Colors.primary : theme.surfaceSecondary,
                      borderColor: securityQuestion === q ? Colors.primary : theme.borderLight,
                    },
                  ]}
                  onPress={() => setSecurityQuestion(q)}
                >
                  <Text
                    style={[
                      styles.questionChipText,
                      { color: securityQuestion === q ? '#FFF' : theme.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: theme.text, marginTop: 12 }]}>
              Tu respuesta *
            </Text>
            <TextInput
              value={securityAnswer}
              onChangeText={setSecurityAnswer}
              placeholder="Escribe tu respuesta"
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
              title="Crear cuenta" 
              onPress={handleRegister} 
              loading={loading || isLoading} 
              fullWidth 
              size="lg" 
              style={{ marginTop: 16 }} 
            />
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
  sectionLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600', marginBottom: 8 },
  questionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  questionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  questionChipText: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: Layout.fontSize.sm, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: Layout.fontSize.md },
  loginLink: { fontSize: Layout.fontSize.md, fontWeight: '700' },
});