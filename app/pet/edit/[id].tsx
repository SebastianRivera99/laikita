// ============================================
// LAIKITA - Edit Pet Screen (solo admin)
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

const speciesOptions = [
  { value: 'dog', label: 'Perro', emoji: '🐕' },
  { value: 'cat', label: 'Gato', emoji: '🐱' },
  { value: 'bird', label: 'Ave', emoji: '🐦' },
  { value: 'rabbit', label: 'Conejo', emoji: '🐰' },
  { value: 'hamster', label: 'Hámster', emoji: '🐹' },
  { value: 'other', label: 'Otro', emoji: '🐾' },
];

const genderOptions = [
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Hembra' },
];

const sizeOptions = [
  { value: 'small', label: 'Pequeño' },
  { value: 'medium', label: 'Mediano' },
  { value: 'large', label: 'Grande' },
];

export default function EditPetScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { canEdit } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    gender: 'male',
    size: 'medium',
    weight: '',
    color: '',
    birth_date: '',
    is_neutered: false,
  });

  useEffect(() => {
    if (!canEdit) {
      Alert.alert('Acceso denegado', 'No tienes permisos para editar');
      router.back();
    }
  }, [canEdit]);

  useEffect(() => {
    loadPet();
  }, []);

  const loadPet = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setForm({
          name: data.name || '',
          species: data.species || 'dog',
          breed: data.breed || '',
          gender: data.gender || 'male',
          size: data.size || 'medium',
          weight: data.weight ? String(data.weight) : '',
          color: data.color || '',
          birth_date: data.birth_date || '',
          is_neutered: data.is_neutered || false,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la mascota');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('pets')
        .update({
          name: form.name.trim(),
          species: form.species,
          breed: form.breed.trim(),
          gender: form.gender,
          size: form.size,
          weight: parseFloat(form.weight) || 0,
          color: form.color.trim(),
          birth_date: form.birth_date || null,
          is_neutered: form.is_neutered,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Éxito', 'Mascota actualizada correctamente');
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Editar Mascota</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Nombre *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Nombre"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Especie</Text>
          <View style={styles.optionsRow}>
            {speciesOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: form.species === opt.value ? Colors.primary : theme.surface,
                    borderColor: form.species === opt.value ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setForm({ ...form, species: opt.value })}
              >
                <Text style={{ color: form.species === opt.value ? '#FFF' : theme.textSecondary }}>
                  {opt.emoji} {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Raza</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.breed}
            onChangeText={(text) => setForm({ ...form, breed: text })}
            placeholder="Raza"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Género</Text>
          <View style={styles.optionsRow}>
            {genderOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: form.gender === opt.value ? Colors.primary : theme.surface,
                    borderColor: form.gender === opt.value ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setForm({ ...form, gender: opt.value })}
              >
                <Text style={{ color: form.gender === opt.value ? '#FFF' : theme.textSecondary }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Tamaño</Text>
          <View style={styles.optionsRow}>
            {sizeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionChip,
                  {
                    backgroundColor: form.size === opt.value ? Colors.primary : theme.surface,
                    borderColor: form.size === opt.value ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setForm({ ...form, size: opt.value })}
              >
                <Text style={{ color: form.size === opt.value ? '#FFF' : theme.textSecondary }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Peso (kg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.weight}
              onChangeText={(text) => setForm({ ...form, weight: text })}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Color</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.color}
              onChangeText={(text) => setForm({ ...form, color: text })}
              placeholder="Color"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Fecha de nacimiento</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.birth_date}
            onChangeText={(text) => setForm({ ...form, birth_date: text })}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, { backgroundColor: form.is_neutered ? Colors.primary : theme.surface, borderColor: Colors.primary }]}
              onPress={() => setForm({ ...form, is_neutered: !form.is_neutered })}
            >
              {form.is_neutered && <Ionicons name="checkmark" size={16} color="#FFF" />}
            </TouchableOpacity>
            <Text style={[styles.label, { color: theme.text }]}>Esterilizado/Castrado</Text>
          </View>
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
  row: { flexDirection: 'row', gap: 12 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});