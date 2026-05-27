// ============================================
// LAIKITA - Gestión de Usuarios (Admin)
// ============================================

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';

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
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'No se pudieron cargar los usuarios');
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

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentRole === newRole) return;
    
    Alert.alert(
      'Cambiar rol',
      `¿Cambiar rol de ${currentRole} a ${newRole}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cambiar',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

              if (error) throw error;
              
              Alert.alert('Éxito', 'Rol actualizado correctamente');
              loadUsers();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
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
      <View style={styles.userInfo}>
        <View style={[styles.avatar, { backgroundColor: Colors.primarySoft }]}>
          <Text style={[styles.avatarText, { color: Colors.primaryDark }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(item.role)}20` }]}>
            <Text style={[styles.roleText, { color: getRoleColor(item.role) }]}>
              {getRoleLabel(item.role)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.roleSelector}>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Gestionar Usuarios</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={theme.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar por nombre o email..."
          placeholderTextColor={theme.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadUsers}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 50 }}>
            No hay usuarios registrados
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Layout.spacing.lg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 8 },
  list: { padding: Layout.spacing.lg, gap: 16 },
  userCard: { padding: Layout.spacing.md },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700' },
  userDetails: { flex: 1 },
  userName: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  userEmail: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  roleText: { fontSize: 10, fontWeight: '600' },
  roleSelector: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginTop: 4 },
  selectorLabel: { fontSize: Layout.fontSize.xs, marginBottom: 8 },
  roleButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  roleChipText: { fontSize: 12, fontWeight: '600' },
});