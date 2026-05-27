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
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { treatments, getPet } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'all'>('all');
  const { width } = useWindowDimensions();

  // Flag: true cuando la pantalla supera 768px (tablet/desktop)
  const isDesktop = width > 768;

  const goBack = () => {
    if (from === 'admin') {
      router.push('/(admin)');
    } else {
      router.back();
    }
  };

  const filtered = useMemo(() => {
    let result = treatments;
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }
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

  const renderTreatment = ({ item }: { item: Treatment }) => {
    const pet = getPet(Number(item.petId));
    const typeColor = Colors.treatmentColors[item.type as keyof typeof Colors.treatmentColors] || Colors.primary;

    return (
      <Card onPress={() => router.push(`/treatment/${item.id}`)} style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.typeIndicator, { backgroundColor: typeColor }]} />
          <View style={styles.info}>
            <View style={styles.topRow}>
              <Text style={[styles.treatmentTitle, { color: theme.text }]}>
                {item.title}
              </Text>
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
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* wrapper cambia de maxWidth 480 a 1050 segun el tamaño de pantalla */}
      <View style={[styles.wrapper, isDesktop && styles.wrapperDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Tratamientos</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.accent }]}
            onPress={() => router.push('/treatment/create')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar tratamiento, mascota..." />

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
          // En desktop: 2 columnas. En móvil: 1 columna
          numColumns={isDesktop ? 2 : 1}
          // key fuerza re-render cuando cambia numColumns (evita bug de React Native)
          key={isDesktop ? 'desktop' : 'mobile'}
          // columnWrapperStyle solo aplica cuando hay más de 1 columna
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
  // Estilo base: móvil, ancho máximo 480px centrado
  wrapper: {
    flex: 1,
    padding: Layout.spacing.lg,
    paddingBottom: 0,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  // Estilo desktop: más padding y más ancho para aprovechar la pantalla
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
  title: { fontSize: Layout.fontSize.title, fontWeight: '800', flex: 1, textAlign: 'center' },
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
  // Espacio entre las 2 columnas en desktop
  columnWrapper: { gap: 12, marginBottom: 12 },
  list: { paddingBottom: 120, gap: 10 },
  // flex: 1 hace que cada card ocupe el mismo ancho en su columna
  card: { marginBottom: 0, flex: 1 },
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