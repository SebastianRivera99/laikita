// ============================================
// LAIKITA - Treatments List Screen
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  Platform, TouchableOpacity, ScrollView, Alert, useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useNavigationBack } from '@/hooks/useNavigationBack';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import {
  formatDate, formatCurrency, treatmentTypeLabel,
  treatmentStatusLabel, speciesEmoji,
} from '@/utils/formatters';
import type { Treatment, TreatmentStatus } from '@/types';

const statusFilters: { key: TreatmentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'scheduled', label: 'Programados' },
  { key: 'in_progress', label: 'En progreso' },
  { key: 'completed', label: 'Completados' },
  { key: 'cancelled', label: 'Cancelados' },
];

export default function TreatmentsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { goBack } = useNavigationBack();
  const { treatments, getPet } = useData();
  const { canViewTreatments, canCreateTreatments, canChangeTreatmentStatus, canEditTreatments, canDeleteTreatments } = usePermissions();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'all'>('all');
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  if (!canViewTreatments) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={[styles.wrapper, isDesktop && styles.wrapperDesktop]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Citas</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.noAccessContainer}>
            <Ionicons name="lock-closed-outline" size={64} color={theme.textTertiary} />
            <Text style={[styles.noAccessText, { color: theme.textSecondary }]}>
              No tienes acceso a este módulo
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const filtered = useMemo(() => {
    let result = treatments;
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => {
        const pet = getPet(Number(t.petId));
        return (
          t.title.toLowerCase().includes(q) ||
          (pet && pet.name.toLowerCase().includes(q)) ||
          t.veterinarian.toLowerCase().includes(q)
        );
      });
    }
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [treatments, search, statusFilter, getPet]);

  const statusBadgeVariant = (status: TreatmentStatus) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
    }
  };

  const handleDelete = async (id: number, title: string) => {
    Alert.alert('Eliminar cita', `¿Eliminar "${title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('treatments').delete().eq('id', id);
            if (error) throw error;
            alert(`"${title}" eliminado correctamente`);
          } catch (error: any) {
            alert('Error: ' + error.message);
          }
        },
      },
    ]);
  };

  const handleStatusChange = (id: number, newStatus: TreatmentStatus) => {
    Alert.alert('Cambiar estado', `¿Cambiar estado a "${newStatus}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cambiar',
        onPress: async () => {
          try {
            const { error } = await supabase.from('treatments').update({ status: newStatus }).eq('id', id);
            if (error) throw error;
            alert('Estado actualizado correctamente');
          } catch (error: any) {
            alert('Error: ' + error.message);
          }
        },
      },
    ]);
  };

  const renderTreatment = ({ item }: { item: Treatment }) => {
    const pet = getPet(Number(item.petId));
    const typeColor = Colors.treatmentColors[item.type as keyof typeof Colors.treatmentColors] || Colors.primary;

    return (
      <Card style={styles.card}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/treatment/${item.id}`)}>
          <View style={styles.row}>
            <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
            <View style={styles.info}>
              <View style={styles.topRow}>
                <Text style={[styles.treatmentTitle, { color: theme.text }]}>{item.title}</Text>
                <Badge
                  text={treatmentStatusLabel[item.status as keyof typeof treatmentStatusLabel]}
                  variant={statusBadgeVariant(item.status)}
                  size="sm"
                />
              </View>
              {pet && (
                <Text style={[styles.petName, { color: theme.textSecondary }]}>
                  {speciesEmoji[pet.species as keyof typeof speciesEmoji]} {pet.name} — {treatmentTypeLabel[item.type as keyof typeof treatmentTypeLabel]}
                </Text>
              )}
              <View style={styles.bottomRow}>
                <Text style={[styles.dateMeta, { color: theme.textTertiary }]}>
                  {formatDate(item.date)} • {item.time}
                </Text>
                <Text style={[styles.cost, { color: Colors.primary }]}>
                  {formatCurrency(item.cost)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {canChangeTreatmentStatus && (
          <View style={[styles.statusButtons, { borderTopColor: theme.borderLight }]}>
            {item.status !== 'in_progress' && item.status !== 'completed' && (
              <TouchableOpacity style={[styles.statusBtn, { backgroundColor: Colors.warningSoft }]} onPress={() => handleStatusChange(Number(item.id), 'in_progress')}>
                <Text style={styles.statusBtnWarn}>En progreso</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'completed' && (
              <TouchableOpacity style={[styles.statusBtn, { backgroundColor: Colors.successSoft }]} onPress={() => handleStatusChange(Number(item.id), 'completed')}>
                <Text style={styles.statusBtnSuccess}>Completar</Text>
              </TouchableOpacity>
            )}
            {item.status !== 'cancelled' && item.status !== 'completed' && (
              <TouchableOpacity style={[styles.statusBtn, { backgroundColor: Colors.errorSoft }]} onPress={() => handleStatusChange(Number(item.id), 'cancelled')}>
                <Text style={styles.statusBtnError}>Cancelar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {canEditTreatments && (
          <View style={[styles.actionButtons, { borderTopColor: theme.borderLight }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.primarySoft }]}
              onPress={() => router.push(`/treatment/edit/${item.id}`)}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={styles.actionBtnTextPrimary}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: Colors.errorSoft }]}
              onPress={() => handleDelete(Number(item.id), item.title)}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={styles.actionBtnTextError}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.wrapper, isDesktop && styles.wrapperDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Citas</Text>
          {canCreateTreatments ? (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: Colors.accent }]}
              onPress={() => router.push('/treatment/create')}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar tratamiento, mascota..." />

{isDesktop ? (
  <View style={styles.filtersWrap}>
    {statusFilters.map(f => {
      const active = statusFilter === f.key;
      return (
        <TouchableOpacity
          key={f.key}
          style={[
            styles.filterChip,
            {
              backgroundColor: active ? Colors.primary : theme.surfaceSecondary,
              borderColor: active ? Colors.primary : theme.border,
            },
          ]}
          onPress={() => setStatusFilter(f.key as TreatmentStatus | 'all')}
        >
          <Text style={[styles.filterLabel, { color: active ? '#FFF' : theme.textSecondary }]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
) : (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.filtersScroll}
    contentContainerStyle={styles.filtersContent}
  >
    {statusFilters.map(f => {
      const active = statusFilter === f.key;
      return (
        <TouchableOpacity
          key={f.key}
          style={[
            styles.filterChip,
            {
              backgroundColor: active ? Colors.primary : theme.surfaceSecondary,
              borderColor: active ? Colors.primary : theme.border,
            },
          ]}
          onPress={() => setStatusFilter(f.key as TreatmentStatus | 'all')}
        >
          <Text style={[styles.filterLabel, { color: active ? '#FFF' : theme.textSecondary }]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
)}

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderTreatment}
          numColumns={isDesktop ? 2 : 1}
          key={isDesktop ? 'desktop' : 'mobile'}
          columnWrapperStyle={isDesktop ? styles.columnWrapper : undefined}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="medkit-outline"
              title="Sin tratamientos"
              description="Crea un nuevo tratamiento o cita para una mascota"
              actionLabel="+ Nueva cita"
              onAction={() => router.push('/treatment/create')}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  wrapper: {
    flex: 1,
    padding: Layout.spacing.lg,
    paddingBottom: 0,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  wrapperDesktop: {
    padding: 32,
    maxWidth: 1050,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 16 : 0,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  placeholder: { width: 40 },
  title: { fontSize: Layout.fontSize.title, fontWeight: '800', flex: 1, textAlign: 'center' },
  addBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  filtersWrap: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 16,
  alignItems: 'flex-start',
},
  filtersScroll: { marginBottom: 12, flexGrow: 0 },
  filtersContent: { gap: 8, paddingRight: 32 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Layout.radius.full, borderWidth: 1 },
  filterLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  columnWrapper: { gap: 12, marginBottom: 12 },
  list: { paddingBottom: 120, gap: 10 },
  card: { marginBottom: 0, padding: Layout.spacing.md, flex: 1 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  typeIndicator: { width: 4, borderRadius: 2, marginRight: 12, alignSelf: 'stretch' },
  info: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  treatmentTitle: { fontSize: Layout.fontSize.md, fontWeight: '600', flex: 1 },
  petName: { fontSize: Layout.fontSize.sm, marginTop: 4 },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  dateMeta: { fontSize: Layout.fontSize.xs },
  cost: { fontSize: Layout.fontSize.md, fontWeight: '700' },
  statusButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  statusBtnWarn: { color: Colors.warning },
  statusBtnSuccess: { color: Colors.success },
  statusBtnError: { color: Colors.error },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  actionBtnTextPrimary: { fontSize: 12, color: Colors.primary },
  actionBtnTextError: { fontSize: 12, color: Colors.error },
  noAccessContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  noAccessText: { fontSize: Layout.fontSize.lg, textAlign: 'center' },
});