// ============================================
// LAIKITA - Admin Pets List (con eliminación)
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
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
import { speciesEmoji, speciesLabel } from '@/utils/formatters';

interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  size: string;
  weight: number;
  color: string;
  owner_id: number;
  is_neutered: boolean;
}

interface Owner {
  id: number;
  first_name: string;
  last_name: string;
}

export default function AdminPetsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar mascotas
      const { data: petsData, error: petsError } = await supabase
        .from('pets')
        .select('*')
        .order('name', { ascending: true });

      if (petsError) throw petsError;
      setPets(petsData || []);

      // Cargar dueños para obtener nombres
      const { data: ownersData, error: ownersError } = await supabase
        .from('owners')
        .select('id, first_name, last_name');

      if (ownersError) throw ownersError;
      setOwners(ownersData || []);
      
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getOwnerName = (ownerId: number) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner ? `${owner.first_name} ${owner.last_name}` : 'Desconocido';
  };

  const filtered = pets.filter(pet =>
    pet.name.toLowerCase().includes(search.toLowerCase()) ||
    pet.breed.toLowerCase().includes(search.toLowerCase()) ||
    pet.species.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number, name: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) {
        performDelete(id, name);
      }
    } else {
      Alert.alert(
        'Eliminar mascota',
        `¿Eliminar a ${name}? Se eliminarán también sus citas.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => performDelete(id, name) }
        ]
      );
    }
  };

  const performDelete = async (id: number, name: string) => {
    try {
      const { error } = await supabase.from('pets').delete().eq('id', id);
      if (error) throw error;
      setPets(prev => prev.filter(p => p.id !== id));
      alert(`"${name}" eliminado correctamente`);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <Card style={styles.card}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/pet/${item.id}`)}
      >
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: `${Colors.speciesColors[item.species as keyof typeof Colors.speciesColors]}20` }]}>
            <Text style={styles.avatarEmoji}>{speciesEmoji[item.species as keyof typeof speciesEmoji]}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {item.breed} • {item.weight}kg
            </Text>
            <Text style={[styles.owner, { color: theme.textTertiary }]}>
              Dueño: {getOwnerName(item.owner_id)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>
      
      {/* Botones de acción para admin */}
      <View style={[styles.actionButtons, { borderTopColor: theme.borderLight }]}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: Colors.primarySoft }]}
          onPress={() => router.push(`/pet/edit/${item.id}`)}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={{ fontSize: 12, color: Colors.primary }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: Colors.errorSoft }]}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={18} color={Colors.error} />
          <Text style={{ fontSize: 12, color: Colors.error }}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(admin)')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Mascotas</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/pet/create')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, raza..." />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderPet}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadData}
          ListEmptyComponent={
            <EmptyState
              icon="paw-outline"
              title="Sin mascotas registradas"
              description="Agrega la primera mascota"
              actionLabel="+ Agregar mascota"
              onAction={() => router.push('/pet/create')}
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
  list: { paddingBottom: 120, gap: 12 },
  card: { marginBottom: 0, padding: Layout.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  meta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  owner: { fontSize: Layout.fontSize.xs, marginTop: 2 },
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