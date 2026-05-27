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
import { getInitials, formatPhone } from '@/utils/formatters';
import { supabase } from '@/lib/supabase';

export default function OwnersScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { goBack } = useNavigationBack();
  const { owners, getPetsByOwner } = useData();
  const { canViewOwners, canCreateOwners, canDeleteOwners, canEditOwners } = usePermissions();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Si no tiene permiso para ver, mostrar mensaje
  if (!canViewOwners) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.wrapper}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.text }]}>Dueños</Text>
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

  const handleDelete = async (id: number, name: string) => {
    Alert.alert(
      'Eliminar dueño',
      `¿Eliminar a ${name}? Se eliminarán también sus mascotas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('owners').delete().eq('id', id);
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

  const renderOwner = ({ item }: { item: typeof owners[0] }) => {
    const petCount = getPetsByOwner(Number(item.id)).length;
    
    return (
      <Card style={styles.card}>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push(`/owner/${item.id}`)}
        >
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
        </TouchableOpacity>
        
        {/* Botones de acción - solo admin puede editar/eliminar */}
        {canEditOwners && (
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
              onPress={() => handleDelete(Number(item.id), `${item.firstName} ${item.lastName}`)}
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
          <Text style={[styles.title, { color: theme.text }]}>Dueños</Text>
          {canCreateOwners && (
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: Colors.primary }]}
              onPress={() => router.push('/owner/create')}
            >
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          {!canCreateOwners && <View style={{ width: 40 }} />}
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre, cédula..." />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderOwner}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={() => {}}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Sin dueños registrados"
              description="Agrega el primer dueño para empezar a gestionar tu veterinaria"
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
  avatarText: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  meta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
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