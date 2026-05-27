// ============================================
// LAIKITA - Gestión de Usuarios (Admin)
// CRUD completo: Crear, Eliminar, Cambiar rol
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { getInitials } from '@/utils/formatters';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const roleOptions = [
  { value: 'admin', label: 'Admin', color: '#E74C3C' },
  { value: 'vet', label: 'Veterinario', color: '#3498DB' },
  { value: 'inventory', label: 'Inventario', color: '#F39C12' },
  { value: 'receptionist', label: 'Recepcionista', color: '#27AE60' },
];

export default function ManageUsersScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('=== CARGANDO USUARIOS ===');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      console.log('Usuarios cargados:', data?.length);
      setUsers(data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      alert('Error: No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // Eliminar usuario con confirmación
  const handleDelete = async (userId: string, userName: string) => {
    const confirm = window.confirm(`¿Eliminar a "${userName}"? Esta acción no se puede deshacer.`);
    
    if (!confirm) {
      console.log('Eliminación cancelada');
      return;
    }
    
    try {
      console.log('Eliminando usuario ID:', userId);
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      console.log('Usuario eliminado exitosamente');
      alert(`"${userName}" eliminado correctamente`);
      loadUsers();
      
    } catch (error: any) {
      console.error('Error al eliminar:', error);
      alert('Error: ' + error.message);
    }
  };

  // Cambiar rol con confirmación
  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) {
      console.log('Roles iguales, cancelando cambio');
      return;
    }
    
    console.log('=== CAMBIANDO ROL ===');
    console.log('UserId:', userId);
    console.log('CurrentRole:', currentRole);
    console.log('NewRole:', newRole);
    
    const confirm = window.confirm(`¿Cambiar rol de "${currentRole}" a "${newRole}"?`);
    
    if (!confirm) {
      console.log('Cambio cancelado por el usuario');
      return;
    }
    
    try {
      console.log('Ejecutando update...');
      
      const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select();
      
      console.log('Resultado update:', { data, error });
      
      if (error) {
        console.error('Error de Supabase:', error);
        alert('Error: ' + error.message);
        return;
      }
      
      console.log('Rol actualizado exitosamente');
      alert('Rol actualizado correctamente');
      loadUsers();
      
    } catch (error: any) {
      console.error('Error al cambiar rol:', error);
      alert('Error: ' + error.message);
    }
  };

  const getRoleColor = (role: string) => {
    const option = roleOptions.find(r => r.value === role);
    return option?.color || '#6B7280';
  };

  const getRoleLabel = (role: string) => {
    const option = roleOptions.find(r => r.value === role);
    return option?.label || role;
  };

  const renderUser = ({ item }: { item: User }) => (
    <Card style={styles.userCard}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: Colors.primarySoft }]}>
          <Text style={[styles.avatarText, { color: Colors.primaryDark }]}>
            {getInitials(item.name, item.name)}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
            <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
              {getRoleLabel(item.role)}
            </Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <TouchableOpacity 
            style={[styles.deleteBtn, { backgroundColor: Colors.errorSoft }]}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Text style={{ fontSize: 11, color: Colors.error }}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={[styles.roleSelector, { borderTopColor: theme.borderLight }]}>
        <Text style={[styles.selectorLabel, { color: theme.textSecondary }]}>Cambiar rol:</Text>
        <View style={styles.roleButtons}>
          {roleOptions.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.roleChip,
                {
                  backgroundColor: item.role === role.value ? role.color : theme.surfaceSecondary,
                  borderColor: item.role === role.value ? role.color : theme.border,
                },
              ]}
              onPress={() => handleRoleChange(item.id, item.role, role.value)}
            >
              <Text
                style={[
                  styles.roleChipText,
                  { color: item.role === role.value ? '#FFF' : theme.textSecondary },
                ]}
              >
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
          <Text style={[styles.title, { color: theme.text }]}>Usuarios</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/(admin)/users/create')}
          >
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre o email..." />

        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadUsers}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="Sin usuarios registrados"
              description="Agrega el primer usuario"
              actionLabel="+ Agregar usuario"
              onAction={() => router.push('/(admin)/users/create')}
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
  list: { paddingBottom: 120, gap: 12 },
  userCard: { marginBottom: 0, padding: Layout.spacing.md },
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
  email: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  roleText: { fontSize: 10, fontWeight: '600' },
  rightCol: { alignItems: 'flex-end' },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
  roleSelector: { borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  selectorLabel: { fontSize: Layout.fontSize.xs, marginBottom: 8 },
  roleButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  roleChipText: { fontSize: 11, fontWeight: '600' },
});