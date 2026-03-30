// ============================================
// LAIKITA - Create Owner Screen (async API)
// ============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { validateOwnerForm } from '@/utils/validators';

export default function CreateOwnerScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { addOwner } = useData();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    document: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async () => {
    const validationErrors = validateOwnerForm(form);
    if (validationErrors.length > 0) {
      const errMap: Record<string, string> = {};
      validationErrors.forEach(e => (errMap[e.field] = e.message));
      setErrors(errMap);
      return;
    }

    setSaving(true);
    try {
      await addOwner({ ...form, avatar: undefined });
      Alert.alert('Dueño creado', `${form.firstName} ${form.lastName} fue registrado exitosamente`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear el dueño');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Nuevo Dueño</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            <View style={[styles.iconHeader, { backgroundColor: Colors.primarySoft }]}>
              <Ionicons name="person-add" size={32} color={Colors.primary} />
            </View>
            <Input label="Nombre *" icon="person-outline" placeholder="María" value={form.firstName} onChangeText={v => updateField('firstName', v)} error={errors.firstName} />
            <Input label="Apellido *" icon="person-outline" placeholder="García" value={form.lastName} onChangeText={v => updateField('lastName', v)} error={errors.lastName} />
            <Input label="Cédula / Documento *" icon="card-outline" placeholder="1023456789" value={form.document} onChangeText={v => updateField('document', v)} keyboardType="numeric" error={errors.document} />
            <Input label="Correo electrónico *" icon="mail-outline" placeholder="maria@email.com" value={form.email} onChangeText={v => updateField('email', v)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
            <Input label="Teléfono *" icon="call-outline" placeholder="3001234567" value={form.phone} onChangeText={v => updateField('phone', v)} keyboardType="phone-pad" error={errors.phone} />
            <Input label="Dirección *" icon="location-outline" placeholder="Calle 45 #12-30, Bogotá" value={form.address} onChangeText={v => updateField('address', v)} error={errors.address} />
            <Button title="Guardar dueño" onPress={handleSave} loading={saving} fullWidth size="lg" style={{ marginTop: 12 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Layout.spacing.lg, paddingVertical: 14, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700' },
  scrollContent: { paddingBottom: 60 },
  formWrapper: { padding: Layout.spacing.lg, maxWidth: Layout.maxContentWidth, width: '100%', alignSelf: 'center' },
  iconHeader: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
});
