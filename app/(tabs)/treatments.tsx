// ============================================
// LAIKITA - Treatments List Screen
// ============================================

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import {
  formatDate,
  formatCurrency,
  treatmentTypeLabel,
  treatmentStatusLabel,
  speciesEmoji,
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
  const { treatments, getPet } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let result = treatments;
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => {
        const pet = getPet(t.petId);
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

  const renderTreatment = ({ item }: { item: Treatment }) => {
    const pet = getPet(item.petId);
    const typeColor = Colors.treatmentColors[item.type] || Colors.primary;

    return (
      <Card onPress={() => router.push(`/treatment/${item.id}` as any)} style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
          <View style={styles.info}>
            <View style={styles.topRow}>
              <Text style={[styles.treatmentTitle, { color: theme.text }]}>
                {item.title}
              </Text>
              <Badge
                text={treatmentStatusLabel[item.status]}
                variant={statusBadgeVariant(item.status)}
                size="sm"
              />
            </View>
            {pet && (
              <Text style={[styles.petName, { color: theme.textSecondary }]}>
                {speciesEmoji[pet.species]} {pet.name} — {treatmentTypeLabel[item.type]}
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
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Tratamientos</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.accent }]}
            onPress={() => router.push('/treatment/create' as any)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar tratamiento, mascota..." />

        {/* Status filter chips */}
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
                onPress={() => setStatusFilter(f.key)}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    { color: active ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderTreatment}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="medkit-outline"
              title="Sin tratamientos"
              description="Crea un nuevo tratamiento o cita para una mascota"
              actionLabel="+ Nueva cita"
              onAction={() => router.push('/treatment/create' as any)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 16 : 0,
  },
  title: { fontSize: Layout.fontSize.title, fontWeight: '800' },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: { marginBottom: 12, flexGrow: 0 },
  filtersContent: { gap: 8, paddingRight: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
  },
  filterLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  list: { paddingBottom: 120, gap: 10 },
  card: { marginBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'stretch' },
  typeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
    alignSelf: 'stretch',
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  treatmentTitle: { fontSize: Layout.fontSize.md, fontWeight: '600', flex: 1 },
  petName: { fontSize: Layout.fontSize.sm, marginTop: 4 },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  dateMeta: { fontSize: Layout.fontSize.xs },
  cost: { fontSize: Layout.fontSize.md, fontWeight: '700' },
});
