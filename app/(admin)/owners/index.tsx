// ============================================
// LAIKITA - Admin Owners List (con eliminación)
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
import { getInitials, formatPhone } from '@/utils/formatters';

interface Owner {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  document: string;
}

export default function AdminOwnersScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadOwners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setOwners(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los dueños');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOwners();
    }, [])
  );

  const filtered = owners.filter(owner =>
    owner.first_name.toLowerCase().includes(search.toLowerCase()) ||
    owner.last_name.toLowerCase().includes(search.toLowerCase()) ||
    owner.document.includes(search)
  );

  const handleDelete = (id: number, name: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) {
        performDelete(id, name);
      }
    } else {
      Alert.alert(
        'Eliminar dueño',
        `¿Eliminar a ${name}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => performDelete(id, name) }
        ]
      );
    }
  };

  const performDelete = async (id: number, name: string) => {
    try {
      const { error } = await supabase.from('owners').delete().eq('id', id);
      if (error) throw error;
      setOwners(prev => prev.filter(o => o.id !== id));
      alert(`"${name}" eliminado correctamente`);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const renderOwner = ({ item }: { item: Owner }) => (
    <Card style={styles.card}>
      <TouchableOpacity 
        activeOpacity={0.7}
        onPress={() => router.push(`/owner/${item.id}`)}
      >
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: Colors.primarySoft }]}>
            <Text style={[styles.avatarText, { color: Colors.primaryDark }]}>
              {getInitials(item.first_name, item.last_name)}
            </Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]}>
              {item.first_name} {item.last_name}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              {formatPhone(item.phone)}
            </Text>
            <Text style={[styles.meta, { color: theme.textSecondary }]}>
              CC: {item.document}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
        </View>
      </TouchableOpacity>
      
      {/* Botones de acción para admin */}
      <View style={[styles.actionButtons, { borderTopColor: theme.borderLight }]}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: Colors.primarySoft }]}
          onPress={() => router.push(`/owner/edit/${item.id}`)}
        >
          <Ionicons name="create-outline" size={18} color={Colors.primary} />
          <Text style={{ fontSize: 12, color: Colors.primary }}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: Colors.errorSoft }]}
          onPress={() => handleDelete(item.id, `${item.first_name} ${item.last_name}`)}
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
          <Text style={[styles.title, { color: theme.text }]}>Dueños</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/owner/create')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, cédula..." />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderOwner}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadOwners}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Sin dueños registrados"
              description="Agrega el primer dueño"
              actionLabel="+ Agregar dueño"
              onAction={() => router.push('/owner/create')}
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
  avatarText: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  meta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
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