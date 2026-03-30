// ============================================
// LAIKITA - Create Pet Screen (async API)
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
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { PetSpecies, PetGender, PetSize } from '@/types';

const speciesOptions: { key: PetSpecies; label: string; emoji: string }[] = [
  { key: 'dog', label: 'Perro', emoji: '🐕' },
  { key: 'cat', label: 'Gato', emoji: '🐱' },
  { key: 'bird', label: 'Ave', emoji: '🐦' },
  { key: 'rabbit', label: 'Conejo', emoji: '🐰' },
  { key: 'hamster', label: 'Hámster', emoji: '🐹' },
  { key: 'other', label: 'Otro', emoji: '🐾' },
];

export default function CreatePetScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { owners, addPet } = useData();

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState<PetGender>('male');
  const [size, setSize] = useState<PetSize>('medium');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [showOwnerPicker, setShowOwnerPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedOwner = owners.find(o => o.id === ownerId);

  const handleSave = async () => {
    if (!name || !breed || !ownerId) {
      Alert.alert('Error', 'Nombre, raza y dueño son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await addPet({
        name, species, breed, gender, size,
        weight: parseFloat(weight) || 0, color,
        birthDate: birthDate || '2023-01-01',
        ownerId, isNeutered: false, allergies: [],
        photo: undefined, microchip: undefined, notes: undefined,
      });
      Alert.alert('Mascota registrada', `${name} fue registrado(a) exitosamente`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo registrar');
    } finally {
      setSaving(false);
    }
  };

  const ChipSelector = ({ options, selected, onSelect }: { options: { key: string; label: string; emoji?: string }[]; selected: string; onSelect: (key: string) => void; }) => (
    <View style={styles.chipRow}>
      {options.map(opt => {
        const active = selected === opt.key;
        return (
          <TouchableOpacity key={opt.key} style={[styles.chip, { backgroundColor: active ? Colors.primary : theme.surfaceSecondary, borderColor: active ? Colors.primary : theme.border }]} onPress={() => onSelect(opt.key)}>
            {opt.emoji && <Text style={{ fontSize: 16 }}>{opt.emoji}</Text>}
            <Text style={[styles.chipText, { color: active ? '#FFF' : theme.textSecondary }]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="close" size={24} color={theme.text} /></TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Nueva Mascota</Text>
          <View style={{ width: 40 }} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View style={[styles.iconHeader, { backgroundColor: Colors.secondarySoft }]}>
              <Ionicons name="paw" size={32} color={Colors.secondary} />
            </View>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Dueño *</Text>
            <TouchableOpacity style={[styles.pickerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setShowOwnerPicker(!showOwnerPicker)}>
              <Ionicons name="person-outline" size={20} color={theme.textTertiary} />
              <Text style={[styles.pickerText, { color: selectedOwner ? theme.text : theme.textTertiary }]}>{selectedOwner ? `${selectedOwner.firstName} ${selectedOwner.lastName}` : 'Seleccionar dueño'}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
            {showOwnerPicker && (
              <View style={[styles.pickerList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {owners.map(o => (
                  <TouchableOpacity key={o.id} style={[styles.pickerItem, o.id === ownerId && { backgroundColor: Colors.primarySoft }]} onPress={() => { setOwnerId(o.id); setShowOwnerPicker(false); }}>
                    <Text style={[styles.pickerItemText, { color: theme.text }]}>{o.firstName} {o.lastName} — {o.document}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <Input label="Nombre *" icon="paw-outline" placeholder="Luna" value={name} onChangeText={setName} />
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Especie *</Text>
            <ChipSelector options={speciesOptions} selected={species} onSelect={(k) => setSpecies(k as PetSpecies)} />
            <Input label="Raza *" icon="bookmark-outline" placeholder="Golden Retriever" value={breed} onChangeText={setBreed} />
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Género</Text>
            <ChipSelector options={[{ key: 'male', label: 'Macho', emoji: '♂️' }, { key: 'female', label: 'Hembra', emoji: '♀️' }]} selected={gender} onSelect={(k) => setGender(k as PetGender)} />
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Tamaño</Text>
            <ChipSelector options={[{ key: 'small', label: 'Pequeño' }, { key: 'medium', label: 'Mediano' }, { key: 'large', label: 'Grande' }]} selected={size} onSelect={(k) => setSize(k as PetSize)} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}><Input label="Peso (kg)" icon="scale-outline" placeholder="12" value={weight} onChangeText={setWeight} keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Input label="Color" icon="color-palette-outline" placeholder="Dorado" value={color} onChangeText={setColor} /></View>
            </View>
            <Input label="Fecha de nacimiento" icon="calendar-outline" placeholder="2022-05-15" value={birthDate} onChangeText={setBirthDate} />
            <Button title="Registrar mascota" onPress={handleSave} loading={saving} fullWidth size="lg" style={{ marginTop: 12 }} />
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
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: Layout.radius.full, borderWidth: 1, gap: 6 },
  chipText: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: Layout.radius.md, paddingHorizontal: Layout.spacing.md, height: 50, gap: 10, marginBottom: Layout.spacing.md },
  pickerText: { flex: 1, fontSize: Layout.fontSize.md },
  pickerList: { borderWidth: 1, borderRadius: Layout.radius.md, marginTop: -12, marginBottom: Layout.spacing.md, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12 },
  pickerItemText: { fontSize: Layout.fontSize.md },
  row: { flexDirection: 'row', gap: 12 },
});
