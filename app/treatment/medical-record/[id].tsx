// ============================================
// LAIKITA - Historia Clínica
// Vista para veterinarios después de completar una consulta
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatDate, formatCurrency, treatmentTypeLabel, speciesEmoji } from '@/utils/formatters';

export default function MedicalRecordScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTreatment, getPet, getOwner, updateTreatment } = useData();
  const { canChangeTreatmentStatus } = usePermissions();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [existingRecord, setExistingRecord] = useState<any>(null);

  const treatment = getTreatment(Number(id));
  
  useEffect(() => {
    loadExistingRecord();
  }, []);

  const loadExistingRecord = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('treatments')
        .select('diagnosis, prescription, notes')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setExistingRecord(data);
        setDiagnosis(data.diagnosis || '');
        setPrescription(data.prescription || '');
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error cargando historia:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!treatment) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Tratamiento no encontrado</Text>
      </SafeAreaView>
    );
  }

  const pet = getPet(Number(treatment.petId));
  const owner = getOwner(Number(treatment.ownerId));

  const handleSave = async () => {
    if (!diagnosis.trim()) {
      Alert.alert('Error', 'El diagnóstico es obligatorio');
      return;
    }

    setSaving(true);
    try {
      await updateTreatment(Number(id), {
        diagnosis: diagnosis.trim(),
        prescription: prescription.trim() || null,
        notes: notes.trim() || null,
      });
      
      Alert.alert('Éxito', 'Historia clínica guardada correctamente');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la historia clínica');
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

  const isViewOnly = treatment.status !== 'completed' && !existingRecord?.diagnosis;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {existingRecord?.diagnosis ? 'Historia Clínica' : 'Registrar Historia Clínica'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Información del paciente */}
        <Card style={styles.patientCard}>
          <View style={styles.patientHeader}>
            <Text style={styles.patientEmoji}>
              {speciesEmoji[pet?.species as keyof typeof speciesEmoji] || '🐾'}
            </Text>
            <View style={styles.patientInfo}>
              <Text style={[styles.patientName, { color: theme.text }]}>{pet?.name || 'Mascota'}</Text>
              <Text style={[styles.patientBreed, { color: theme.textSecondary }]}>{pet?.breed}</Text>
              <Text style={[styles.patientOwner, { color: theme.textTertiary }]}>
                Dueño: {owner?.firstName} {owner?.lastName}
              </Text>
            </View>
          </View>
          
          <View style={styles.treatmentInfo}>
            <View style={[styles.infoBadge, { backgroundColor: Colors.primarySoft }]}>
              <Text style={[styles.infoBadgeText, { color: Colors.primaryDark }]}>
                {treatmentTypeLabel[treatment.type as keyof typeof treatmentTypeLabel]}
              </Text>
            </View>
            <Text style={[styles.treatmentDate, { color: theme.textSecondary }]}>
              {formatDate(treatment.date)} - {treatment.time}
            </Text>
            <Text style={[styles.treatmentVet, { color: theme.textTertiary }]}>
              Veterinario: {treatment.veterinarian}
            </Text>
          </View>
        </Card>

        {/* Diagnóstico */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Diagnóstico {!isViewOnly && '*'}
          </Text>
          {isViewOnly ? (
            <Text style={[styles.readOnlyText, { color: theme.textSecondary, backgroundColor: theme.surfaceSecondary }]}>
              {diagnosis || 'No registrado'}
            </Text>
          ) : (
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="Ingrese el diagnóstico del paciente..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
            />
          )}
        </Card>

        {/* Prescripción médica */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Prescripción médica</Text>
          {isViewOnly ? (
            <Text style={[styles.readOnlyText, { color: theme.textSecondary, backgroundColor: theme.surfaceSecondary }]}>
              {prescription || 'No registrada'}
            </Text>
          ) : (
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={prescription}
              onChangeText={setPrescription}
              placeholder="Medicamentos, dosis, indicaciones..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
            />
          )}
        </Card>

        {/* Notas adicionales */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Notas adicionales</Text>
          {isViewOnly ? (
            <Text style={[styles.readOnlyText, { color: theme.textSecondary, backgroundColor: theme.surfaceSecondary }]}>
              {notes || 'No hay notas adicionales'}
            </Text>
          ) : (
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas adicionales, seguimiento, etc."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={3}
            />
          )}
        </Card>

        {/* Botón guardar (solo si está en edición) */}
        {!isViewOnly && (
          <Button
            title="Guardar Historia Clínica"
            onPress={handleSave}
            loading={saving}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />
        )}
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
  content: { padding: Layout.spacing.lg, gap: 16, paddingBottom: 40 },
  patientCard: { padding: Layout.spacing.md },
  patientHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  patientEmoji: { fontSize: 48 },
  patientInfo: { flex: 1 },
  patientName: { fontSize: Layout.fontSize.xl, fontWeight: '700' },
  patientBreed: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  patientOwner: { fontSize: Layout.fontSize.xs, marginTop: 2 },
  treatmentInfo: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 6 },
  infoBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  infoBadgeText: { fontSize: 12, fontWeight: '600' },
  treatmentDate: { fontSize: Layout.fontSize.sm },
  treatmentVet: { fontSize: Layout.fontSize.xs },
  sectionTitle: { fontSize: Layout.fontSize.md, fontWeight: '600', marginBottom: 12 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  readOnlyText: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, lineHeight: 22 },
  saveButton: { marginTop: 8 },
});