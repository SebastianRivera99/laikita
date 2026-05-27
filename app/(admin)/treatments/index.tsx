// ============================================
// LAIKITA - Admin Treatments List (con eliminación)
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
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
import type { TreatmentStatus } from '@/types';

interface Treatment {
  id: number;
  pet_id: number;
  owner_id: number;
  type: string;
  title: string;
  description: string;
  status: string;
  date: string;
  time: string;
  veterinarian: string;
  cost: number;
}

interface Pet {
  id: number;
  name: string;
  species: string;
}

const statusFilters: { key: TreatmentStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'scheduled', label: 'Programados' },
  { key: 'in_progress', label: 'En progreso' },
  { key: 'completed', label: 'Completados' },
  { key: 'cancelled', label: 'Cancelados' },
];

export default function AdminTreatmentsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TreatmentStatus | 'all'>('all');

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar tratamientos
      const { data: treatmentsData, error: treatmentsError } = await supabase
        .from('treatments')
        .select('*')
        .order('date', { ascending: false });

      if (treatmentsError) throw treatmentsError;
      setTreatments(treatmentsData || []);

      // Cargar mascotas
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('id, name, species');

      if (petsError) throw petsError;
      setPets(petsData || []);
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los tratamientos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getPetName = (petId: number) => {
    const pet = pets.find(p => p.id === petId);
    return pet || { name: 'Desconocido', species: 'other' };
  };

  const filtered = treatments.filter(treatment => {
    // Filtro por estado
    if (statusFilter !== 'all' && treatment.status !== statusFilter) return false;
    
    // Filtro por búsqueda
    if (search) {
      const pet = getPetName(treatment.pet_id);
      const q = search.toLowerCase();
      return treatment.title.toLowerCase().includes(q) ||
             pet.name.toLowerCase().includes(q) ||
             treatment.veterinarian.toLowerCase().includes(q);
    }
    
    return true;
  });

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'neutral';
    }
  };

  const handleDelete = (id: number, title: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar "${title}"? Esta acción no se puede deshacer.`)) {
        performDelete(id, title);
      }
    } else {
      Alert.alert(
        'Eliminar cita',
        `¿Eliminar "${title}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => performDelete(id, title) }
        ]
      );
    }
  };

  const performDelete = async (id: number, title: string) => {
    try {
      const { error } = await supabase.from('treatments').delete().eq('id', id);
      if (error) throw error;
      setTreatments(prev => prev.filter(t => t.id !== id));
      alert(`"${title}" eliminado correctamente`);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const renderTreatment = ({ item }: { item: Treatment }) => {
    const pet = getPetName(item.pet_id);
    const typeColor = Colors.treatmentColors[item.type as keyof typeof Colors.treatmentColors] || Colors.primary;

    return (
      <Card style={styles.card}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push(`/treatment/${item.id}`)}
        >
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
              <Text style={[styles.petName, { color: theme.textSecondary }]}>
                {speciesEmoji[pet.species as keyof typeof speciesEmoji]} {pet.name} — {treatmentTypeLabel[item.type as keyof typeof treatmentTypeLabel]}
              </Text>
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
        
        {/* Botones de acción para admin */}
        <View style={[styles.actionButtons, { borderTopColor: theme.borderLight }]}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.primarySoft }]}
            onPress={() => router.push(`/treatment/edit/${item.id}`)}
          >
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
            <Text style={{ fontSize: 12, color: Colors.primary }}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.errorSoft }]}
            onPress={() => handleDelete(item.id, item.title)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={{ fontSize: 12, color: Colors.error }}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(admin)')} style={styles.backBtn}>
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
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTreatment}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <EmptyState
              icon="medkit-outline"
              title="Sin tratamientos"
              description="Crea un nuevo tratamiento"
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Layout.fontSize.title, fontWeight: '800', flex: 1, textAlign: 'center' },
  addBtn: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  filtersScroll: { marginBottom: 12, flexGrow: 0 },
  filtersContent: { gap: 8, paddingRight: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
  },
  filterLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  list: { paddingBottom: 120, gap: 12 },
  card: { marginBottom: 0, padding: Layout.spacing.md },
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});