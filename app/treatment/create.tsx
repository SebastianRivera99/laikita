// ============================================
// LAIKITA - Create Treatment Screen (async API)
// ============================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { speciesEmoji } from '@/utils/formatters';
import type { TreatmentType } from '@/types';

const typeOptions: { key: TreatmentType; label: string; color: string }[] = [
  { key: 'consultation', label: 'Consulta', color: Colors.treatmentColors.consultation },
  { key: 'vaccination', label: 'Vacunación', color: Colors.treatmentColors.vaccination },
  { key: 'surgery', label: 'Cirugía', color: Colors.treatmentColors.surgery },
  { key: 'grooming', label: 'Peluquería', color: Colors.treatmentColors.grooming },
  { key: 'dental', label: 'Dental', color: Colors.treatmentColors.dental },
  { key: 'laboratory', label: 'Laboratorio', color: Colors.treatmentColors.laboratory },
  { key: 'emergency', label: 'Emergencia', color: Colors.treatmentColors.emergency },
  { key: 'deworming', label: 'Desparasitación', color: Colors.treatmentColors.deworming },
];

export default function CreateTreatmentScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { pets, owners, addTreatment } = useData();

  const [petId, setPetId] = useState('');
  const [showPetPicker, setShowPetPicker] = useState(false);
  const [type, setType] = useState<TreatmentType>('consultation');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedPet = pets.find(p => p.id === petId);
  const selectedOwner = selectedPet ? owners.find(o => o.id === selectedPet.ownerId) : null;

  const handleSave = async () => {
    if (!petId || !title || !date || !time) {
      Alert.alert('Error', 'Mascota, título, fecha y hora son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await addTreatment({
        petId, ownerId: selectedPet!.ownerId, type, title, description,
        status: 'scheduled', date, time,
        veterinarian: user?.name || 'Veterinario',
        cost: parseFloat(cost) || 0,
      });
      Alert.alert('Cita creada', 'La cita fue agendada exitosamente', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cita');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Nueva Cita</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View style={[styles.iconHeader, { backgroundColor: Colors.accentSoft }]}>
              <Ionicons name="medical" size={32} color={Colors.accent} />
            </View>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Mascota *</Text>
            <TouchableOpacity style={[styles.pickerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowPetPicker(!showPetPicker)}>
              <Ionicons name="paw-outline" size={20} color={theme.textTertiary} />
              <Text style={[styles.pickerText, { color: selectedPet ? theme.text : theme.textTertiary }]}>
                {selectedPet ? `${speciesEmoji[selectedPet.species]} ${selectedPet.name}${selectedOwner ? ` (${selectedOwner.firstName})` : ''}` : 'Seleccionar mascota'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
            {showPetPicker && (
              <View style={[styles.pickerList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {pets.map(p => {
                  const o = owners.find(ow => ow.id === p.ownerId);
                  return (
                    <TouchableOpacity key={p.id} style={[styles.pickerItem, p.id === petId && { backgroundColor: Colors.primarySoft }]} onPress={() => { setPetId(p.id); setShowPetPicker(false); }}>
                      <Text style={[styles.pickerItemText, { color: theme.text }]}>{speciesEmoji[p.species]} {p.name} — {p.breed}{o ? ` (${o.firstName} ${o.lastName})` : ''}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Tipo de tratamiento</Text>
            <View style={styles.chipRow}>
              {typeOptions.map(opt => {
                const active = type === opt.key;
                return (
                  <TouchableOpacity key={opt.key} style={[styles.chip, { backgroundColor: active ? opt.color : theme.surfaceSecondary, borderColor: active ? opt.color : theme.border }]} onPress={() => setType(opt.key)}>
                    <Text style={[styles.chipText, { color: active ? '#FFF' : theme.textSecondary }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Input label="Título *" icon="text-outline" placeholder="Vacuna antirrábica" value={title} onChangeText={setTitle} />
            <Input label="Descripción" icon="document-text-outline" placeholder="Detalles..." value={description} onChangeText={setDescription} multiline />
            <View style={styles.row}>
              <View style={{ flex: 1 }}><Input label="Fecha *" icon="calendar-outline" placeholder="2025-03-28" value={date} onChangeText={setDate} /></View>
              <View style={{ flex: 1 }}><Input label="Hora *" icon="time-outline" placeholder="10:00" value={time} onChangeText={setTime} /></View>
            </View>
            <Input label="Costo ($)" icon="cash-outline" placeholder="45000" value={cost} onChangeText={setCost} keyboardType="numeric" />
            <Button title="Agendar cita" onPress={handleSave} loading={saving} fullWidth size="lg" style={{ marginTop: 12 }} />
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
  fieldLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Layout.spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Layout.radius.full, borderWidth: 1 },
  chipText: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: Layout.radius.md, paddingHorizontal: Layout.spacing.md, height: 50, gap: 10, marginBottom: Layout.spacing.md },
  pickerText: { flex: 1, fontSize: Layout.fontSize.md },
  pickerList: { borderWidth: 1, borderRadius: Layout.radius.md, marginTop: -12, marginBottom: Layout.spacing.md, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12 },
  pickerItemText: { fontSize: Layout.fontSize.md },
  row: { flexDirection: 'row', gap: 12 },
});
