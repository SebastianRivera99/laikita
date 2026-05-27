// ============================================
// LAIKITA - Edit Treatment Screen (solo admin)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

const typeOptions = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'vaccination', label: 'Vacunación' },
  { value: 'surgery', label: 'Cirugía' },
  { value: 'grooming', label: 'Peluquería' },
  { value: 'dental', label: 'Dental' },
  { value: 'laboratory', label: 'Laboratorio' },
  { value: 'emergency', label: 'Emergencia' },
  { value: 'deworming', label: 'Desparasitación' },
  { value: 'other', label: 'Otro' },
];

const statusOptions = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export default function EditTreatmentScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canEdit } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'consultation',
    description: '',
    status: 'scheduled',
    date: '',
    time: '',
    veterinarian: '',
    cost: '',
    diagnosis: '',
  });

  useEffect(() => {
    if (!canEdit) {
      Alert.alert('Acceso denegado', 'No tienes permisos para editar');
      router.back();
    }
  }, [canEdit]);

  useEffect(() => {
    loadTreatment();
  }, []);

  const loadTreatment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setForm({
          title: data.title || '',
          type: data.type || 'consultation',
          description: data.description || '',
          status: data.status || 'scheduled',
          date: data.date || '',
          time: data.time || '',
          veterinarian: data.veterinarian || '',
          cost: data.cost ? String(data.cost) : '',
          diagnosis: data.diagnosis || '',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el tratamiento');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('treatments')
        .update({
          title: form.title.trim(),
          type: form.type,
          description: form.description.trim() || null,
          status: form.status,
          date: form.date,
          time: form.time,
          veterinarian: form.veterinarian.trim(),
          cost: parseFloat(form.cost) || 0,
          diagnosis: form.diagnosis.trim() || null,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Éxito', 'Tratamiento actualizado correctamente');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Editar Cita</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Título *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.title}
            onChangeText={(text) => setForm({ ...form, title: text })}
            placeholder="Título del tratamiento"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Tipo</Text>
          <View style={styles.optionsRow}>
            {typeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: form.type === opt.value ? Colors.primary : theme.surface,
                    borderColor: form.type === opt.value ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setForm({ ...form, type: opt.value })}
              >
                <Text style={{ color: form.type === opt.value ? '#FFF' : theme.textSecondary }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Estado</Text>
          <View style={styles.optionsRow}>
            {statusOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: form.status === opt.value ? Colors.primary : theme.surface,
                    borderColor: form.status === opt.value ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setForm({ ...form, status: opt.value })}
              >
                <Text style={{ color: form.status === opt.value ? '#FFF' : theme.textSecondary }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Fecha</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.date}
              onChangeText={(text) => setForm({ ...form, date: text })}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Hora</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.time}
              onChangeText={(text) => setForm({ ...form, time: text })}
              placeholder="HH:MM"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Veterinario</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.veterinarian}
            onChangeText={(text) => setForm({ ...form, veterinarian: text })}
            placeholder="Nombre del veterinario"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Costo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.cost}
              onChangeText={(text) => setForm({ ...form, cost: text })}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Descripción del tratamiento"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Diagnóstico</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.diagnosis}
            onChangeText={(text) => setForm({ ...form, diagnosis: text })}
            placeholder="Diagnóstico (opcional)"
            multiline
            numberOfLines={3}
          />
        </View>

        <Button title="Guardar Cambios" onPress={handleUpdate} loading={saving} fullWidth size="lg" style={{ marginTop: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700' },
  content: { padding: Layout.spacing.lg, gap: 16 },
  formGroup: { gap: 8 },
  label: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});