import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Platform,
  TouchableOpacity,
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
import { speciesEmoji, speciesLabel } from '@/utils/formatters';
import type { Pet } from '@/types';

export default function PetsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const { pets, getOwner } = useData();
  const [search, setSearch] = useState('');
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
    const owner = getOwner(Number(item.ownerId));
    return (
      <Card onPress={() => router.push(`/pet/${item.id}`)} style={styles.card}>
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
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} style={styles.chevron} />
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
          keyExtractor={item => item.id}
          renderItem={renderPet}
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
  // Espacio entre las 2 columnas en desktop
  columnWrapper: { gap: 12, marginBottom: 12 },
  list: { paddingBottom: 120, gap: 10 },
  // flex: 1 hace que cada card ocupe el mismo ancho en su columna
  card: { marginBottom: 0, flex: 1 },
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
  chevron: { marginTop: 8 },
});