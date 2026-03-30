// ============================================
// LAIKITA - Owners List Screen
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
import { getInitials, formatPhone } from '@/utils/formatters';

export default function OwnersScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { owners, getPetsByOwner } = useData();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return owners;
    const q = search.toLowerCase();
    return owners.filter(
      o =>
        o.firstName.toLowerCase().includes(q) ||
        o.lastName.toLowerCase().includes(q) ||
        o.document.includes(q) ||
        o.phone.includes(q)
    );
  }, [owners, search]);

  const renderOwner = ({ item }: { item: typeof owners[0] }) => {
    const petCount = getPetsByOwner(item.id).length;
    return (
      <Card onPress={() => router.push(`/owner/${item.id}` as any)} style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: Colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: Colors.primaryDark }]}>
              {getInitials(item.firstName, item.lastName)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {formatPhone(item.phone)}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              CC: {item.document}
            </Text>
          </View>
          <View style={styles.rightCol}>
            <Badge text={`${petCount} mascota${petCount !== 1 ? 's' : ''}`} variant="primary" size="sm" />
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} style={{ marginTop: 8 }} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Dueños</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/owner/create' as any)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, cédula..." />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderOwner}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Sin dueños registrados"
              description="Agrega el primer dueño para empezar a gestionar tu veterinaria"
              actionLabel="+ Agregar dueño"
              onAction={() => router.push('/owner/create' as any)}
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
  avatarText: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  meta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
});
