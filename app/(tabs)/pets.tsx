// ============================================
// LAIKITA - Pets List Screen
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
  Alert,
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
import { speciesEmoji, speciesLabel } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';
import type { Pet } from '@/types';

export default function PetsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { goBack } = useNavigationBack();
  const { pets, getOwner } = useData();
  const { canViewPets, canCreatePets, canEditPets, canDeletePets } = usePermissions();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  if (!canViewPets) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Mascotas</Text>
            <View style={{ width: 40 }} />
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
    if (!search) return pets;
    const q = search.toLowerCase();
    return pets.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.breed.toLowerCase().includes(q) ||
        p.species.toLowerCase().includes(q)
    );
  }, [pets, search]);

  const handleDelete = async (id: number, name: string) => {
    Alert.alert(
      'Eliminar mascota',
      `¿Eliminar a ${name}? Se eliminarán también sus citas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('pets').delete().eq('id', id);
              if (error) throw error;
              alert(`"${name}" eliminado correctamente`);
            } catch (error: any) {
              alert('Error: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const renderPet = ({ item }: { item: Pet }) => {
    const owner = getOwner(Number(item.ownerId));
    
    return (
      <Card style={styles.card}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push(`/pet/${item.id}`)}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: `${Colors.speciesColors[item.species as keyof typeof Colors.speciesColors]}20` },
              ]}
            >
              <Text style={styles.emoji}>{speciesEmoji[item.species as keyof typeof speciesEmoji]}</Text>
            </View>
            <View style={styles.info}>
              <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: theme.textSecondary }]}>
                {item.breed} • {item.weight}kg
              </Text>
              {owner && (
                <Text style={[styles.owner, { color: theme.textTertiary }]}>
                  Dueño: {owner.firstName} {owner.lastName}
                </Text>
              )}
            </View>
            <View style={styles.rightCol}>
              <Badge text={speciesLabel[item.species as keyof typeof speciesLabel]} variant="primary" size="sm" />
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} style={{ marginTop: 8 }} />
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Botones de acción - solo admin puede editar/eliminar */}
        {canEditPets && (
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
              onPress={() => handleDelete(Number(item.id), item.name)}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={{ fontSize: 12, color: Colors.error }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Mascotas</Text>
          {canCreatePets && (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: Colors.secondary }]}
              onPress={() => router.push('/pet/create')}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          {!canCreatePets && <View style={{ width: 40 }} />}
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, raza..." />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderPet}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={() => {}}
          ListEmptyComponent={
            <EmptyState
              icon="paw-outline"
              title="Sin mascotas registradas"
              description="Registra la primera mascota asociada a un dueño"
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
  list: { paddingBottom: 120, gap: 10 },
  card: { marginBottom: 0, padding: Layout.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  meta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  owner: { fontSize: Layout.fontSize.xs, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
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
  noAccessContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  noAccessText: { fontSize: Layout.fontSize.lg, textAlign: 'center' },
});