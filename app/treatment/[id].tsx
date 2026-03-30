// ============================================
// LAIKITA - Treatment Detail Screen
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  formatDate,
  formatCurrency,
  treatmentTypeLabel,
  treatmentStatusLabel,
  speciesEmoji,
} from '@/utils/formatters';
import type { TreatmentStatus } from '@/types';

export default function TreatmentDetailScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTreatment, updateTreatment, deleteTreatment, getPet, getOwner } = useData();

  const treatment = getTreatment(id!);
  if (!treatment) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Tratamiento no encontrado</Text>
      </SafeAreaView>
    );
  }

  const pet = getPet(treatment.petId);
  const owner = getOwner(treatment.ownerId);
  const typeColor = Colors.treatmentColors[treatment.type] || Colors.primary;

  const statusBadgeVariant = (status: TreatmentStatus) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
    }
  };

  const handleStatusChange = (newStatus: TreatmentStatus) => {
    updateTreatment(treatment.id, { status: newStatus });
  };

  const handleDelete = () => {
    Alert.alert('Eliminar tratamiento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => { deleteTreatment(treatment.id); router.back(); },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle cita</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Title Card */}
          <Card style={{ borderLeftWidth: 4, borderLeftColor: typeColor }}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.treatmentTitle, { color: theme.text }]}>{treatment.title}</Text>
                <Text style={[styles.treatmentType, { color: typeColor }]}>
                  {treatmentTypeLabel[treatment.type]}
                </Text>
              </View>
              <Badge
                text={treatmentStatusLabel[treatment.status]}
                variant={statusBadgeVariant(treatment.status)}
              />
            </View>
            <Text style={[styles.costBig, { color: Colors.primary }]}>
              {formatCurrency(treatment.cost)}
            </Text>
          </Card>

          {/* Date/Time */}
          <Card>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={22} color={Colors.primary} />
              <View>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Fecha y hora</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {formatDate(treatment.date)} — {treatment.time}
                </Text>
              </View>
            </View>
            <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: theme.borderLight }]}>
              <Ionicons name="person-outline" size={22} color={Colors.primary} />
              <View>
                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Veterinario</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{treatment.veterinarian}</Text>
              </View>
            </View>
          </Card>

          {/* Pet & Owner */}
          {pet && (
            <Card onPress={() => router.push(`/pet/${pet.id}` as any)}>
              <View style={styles.entityRow}>
                <Text style={styles.entityEmoji}>{speciesEmoji[pet.species]}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.entityName, { color: theme.text }]}>{pet.name}</Text>
                  <Text style={[styles.entityMeta, { color: theme.textSecondary }]}>
                    {pet.breed} • {pet.weight}kg
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </View>
            </Card>
          )}

          {owner && (
            <Card onPress={() => router.push(`/owner/${owner.id}` as any)}>
              <View style={styles.entityRow}>
                <Ionicons name="person-circle-outline" size={32} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.entityName, { color: theme.text }]}>
                    {owner.firstName} {owner.lastName}
                  </Text>
                  <Text style={[styles.entityMeta, { color: theme.textSecondary }]}>
                    {owner.phone}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </View>
            </Card>
          )}

          {/* Description */}
          {treatment.description ? (
            <Card>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Descripción</Text>
              <Text style={[styles.descText, { color: theme.textSecondary }]}>{treatment.description}</Text>
            </Card>
          ) : null}

          {treatment.diagnosis ? (
            <Card>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Diagnóstico</Text>
              <Text style={[styles.descText, { color: theme.textSecondary }]}>{treatment.diagnosis}</Text>
            </Card>
          ) : null}

          {/* Status Actions */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Cambiar estado</Text>
          <View style={styles.statusActions}>
            {treatment.status !== 'in_progress' && treatment.status !== 'completed' && (
              <Button
                title="En progreso"
                variant="outline"
                onPress={() => handleStatusChange('in_progress')}
                style={{ flex: 1 }}
              />
            )}
            {treatment.status !== 'completed' && (
              <Button
                title="Completar"
                onPress={() => handleStatusChange('completed')}
                style={{ flex: 1 }}
              />
            )}
            {treatment.status !== 'cancelled' && treatment.status !== 'completed' && (
              <Button
                title="Cancelar"
                variant="danger"
                onPress={() => handleStatusChange('cancelled')}
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  scrollContent: { paddingBottom: 60 },
  wrapper: {
    padding: Layout.spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  treatmentTitle: { fontSize: Layout.fontSize.xl, fontWeight: '800' },
  treatmentType: { fontSize: Layout.fontSize.sm, fontWeight: '600', marginTop: 4 },
  costBig: { fontSize: Layout.fontSize.xxl, fontWeight: '800', marginTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  infoLabel: { fontSize: Layout.fontSize.xs },
  infoValue: { fontSize: Layout.fontSize.md, fontWeight: '500', marginTop: 2 },
  entityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entityEmoji: { fontSize: 28 },
  entityName: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  entityMeta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  sectionLabel: { fontSize: Layout.fontSize.md, fontWeight: '600', marginBottom: 6 },
  descText: { fontSize: Layout.fontSize.md, lineHeight: 22 },
  sectionTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700', marginTop: 4 },
  statusActions: { flexDirection: 'row', gap: 10 },
});
