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
import { speciesEmoji, speciesLabel } from '@/utils/formatters';
import type { Pet } from '@/types';

export default function PetsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { pets, getOwner } = useData();
  const [search, setSearch] = useState('');

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

  const renderPet = ({ item }: { item: Pet }) => {
    const owner = getOwner(item.ownerId);
    return (
      <Card onPress={() => router.push(`/pet/${item.id}` as any)} style={styles.card}>
        <View style={styles.row}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: `${Colors.speciesColors[item.species]}20` },
            ]}
          >
            <Text style={styles.emoji}>{speciesEmoji[item.species]}</Text>
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
            <Badge text={speciesLabel[item.species]} variant="primary" size="sm" />
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Mascotas</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/pet/create' as any)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, raza..." />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderPet}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="paw-outline"
              title="Sin mascotas registradas"
              description="Registra la primera mascota asociada a un dueño"
              actionLabel="+ Agregar mascota"
              onAction={() => router.push('/pet/create' as any)}
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
  list: { paddingBottom: 120, gap: 10 },
  card: { marginBottom: 0 },
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
});
