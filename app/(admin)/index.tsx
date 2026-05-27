import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';

export default function AdminDashboard() {
  const theme = useThemeColors();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { owners, pets, treatments } = useData();
  const [productsCount, setProductsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    loadProductsCount();
    loadUsersCount();
  }, []);

  const loadProductsCount = async () => {
    try {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setProductsCount(count || 0);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const loadUsersCount = async () => {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setUsersCount(count || 0);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const menuItems = [
    { key: 'users', title: 'Usuarios', icon: 'people-outline', color: Colors.error, route: '/(admin)/users' },
    { key: 'products', title: 'Productos', icon: 'cart-outline', color: Colors.primary, route: '/(admin)/products' },
    { key: 'owners', title: 'Dueños', icon: 'people-outline', color: Colors.secondary, route: '/(admin)/owners' },
    { key: 'pets', title: 'Mascotas', icon: 'paw-outline', color: Colors.accent, route: '/(admin)/pets' },
    { key: 'treatments', title: 'Citas', icon: 'medkit-outline', color: Colors.info, route: '/(admin)/treatments' },
  ];

  const pendingTreatments = treatments.filter(t => t.status === 'scheduled').length;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.wrapper}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: theme.surfaceSecondary }]}
                onPress={() => router.push('/(tabs)')}
              >
                <Ionicons name="arrow-back" size={20} color={theme.text} />
              </TouchableOpacity>
              <View style={styles.headerText}>
                <Text style={[styles.greeting, { color: theme.textSecondary }]}>Panel Admin</Text>
                <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Administrador'}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: isDark ? Colors.primarySoft : theme.surfaceSecondary }]}
                onPress={toggleTheme}
              >
                <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color={isDark ? Colors.primary : theme.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: theme.surfaceSecondary }]}
                onPress={logout}
              >
                <Ionicons name="log-out-outline" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { borderLeftColor: Colors.error, borderLeftWidth: 3 }]}>
              <Ionicons name="people-outline" size={24} color={Colors.error} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{usersCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Usuarios</Text>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: Colors.primary, borderLeftWidth: 3 }]}>
              <Ionicons name="cart-outline" size={24} color={Colors.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{productsCount}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Productos</Text>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { borderLeftColor: Colors.secondary, borderLeftWidth: 3 }]}>
              <Ionicons name="people-outline" size={24} color={Colors.secondary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{owners.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Dueños</Text>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: Colors.accent, borderLeftWidth: 3 }]}>
              <Ionicons name="paw-outline" size={24} color={Colors.accent} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{pets.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mascotas</Text>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { borderLeftColor: Colors.info, borderLeftWidth: 3 }]}>
              <Ionicons name="calendar-outline" size={24} color={Colors.info} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{pendingTreatments}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Citas Pendientes</Text>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: Colors.warning, borderLeftWidth: 3 }]}>
              <Ionicons name="archive-outline" size={24} color={Colors.warning} />
              <Text style={[styles.statNumber, { color: theme.text }]}>0</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Inventario</Text>
            </Card>
          </View>

          {/* Gestión */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Gestión</Text>
          <View style={styles.actionsRow}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text }]}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Volver al panel de cliente */}
          <TouchableOpacity
            style={[styles.backToClientBtn, { backgroundColor: Colors.primarySoft, borderColor: Colors.primary }]}
            onPress={() => router.push('/(tabs)')}
          >
            <Ionicons name="home-outline" size={20} color={Colors.primary} />
            <Text style={[styles.backToClientText, { color: Colors.primary }]}>Volver al panel de cliente</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  wrapper: {
    padding: Layout.spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'android' ? 16 : 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {},
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  greeting: { fontSize: Layout.fontSize.sm },
  userName: { fontSize: Layout.fontSize.lg, fontWeight: '800', marginTop: 2 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  statNumber: { fontSize: Layout.fontSize.xl, fontWeight: '800', marginTop: 4 },
  statLabel: { fontSize: Layout.fontSize.sm },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  actionBtn: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    gap: 8,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  backToClientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: Layout.radius.lg,
    borderWidth: 1,
    marginTop: 24,
  },
  backToClientText: { fontSize: Layout.fontSize.md, fontWeight: '600' },
});