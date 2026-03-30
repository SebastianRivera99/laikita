// ============================================
// LAIKITA - Dashboard (Home) + Theme Toggle
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import {
  formatCurrency,
  formatDate,
  treatmentTypeLabel,
  treatmentStatusLabel,
  speciesEmoji,
} from '@/utils/formatters';

export default function DashboardScreen() {
  const theme = useThemeColors();
  const { isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { owners, pets, treatments } = useData();

  const todayTreatments = treatments.filter(t => t.status === 'scheduled');
  const completedTreatments = treatments.filter(t => t.status === 'completed');
  const revenue = completedTreatments.reduce((sum, t) => sum + t.cost, 0);

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'neutral';
    }
  };

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
              <Text style={[styles.greeting, { color: theme.textSecondary }]}>Bienvenido,</Text>
              <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Doctor'}</Text>
            </View>
            <View style={styles.headerRight}>
              {/* Theme Toggle */}
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: isDark ? Colors.primarySoft : theme.surfaceSecondary }]}
                onPress={toggleTheme}
              >
                <Ionicons
                  name={isDark ? 'sunny' : 'moon'}
                  size={20}
                  color={isDark ? Colors.primary : theme.textSecondary}
                />
              </TouchableOpacity>
              {/* Logout */}
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
            <Card style={[styles.statCard, { borderLeftColor: Colors.primary, borderLeftWidth: 3 }]}>
              <Ionicons name="people-outline" size={24} color={Colors.primary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{owners.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Dueños</Text>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: Colors.secondary, borderLeftWidth: 3 }]}>
              <Ionicons name="paw-outline" size={24} color={Colors.secondary} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{pets.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Mascotas</Text>
            </Card>
          </View>

          <View style={styles.statsRow}>
            <Card style={[styles.statCard, { borderLeftColor: Colors.accent, borderLeftWidth: 3 }]}>
              <Ionicons name="calendar-outline" size={24} color={Colors.accent} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{todayTreatments.length}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pendientes</Text>
            </Card>
            <Card style={[styles.statCard, { borderLeftColor: Colors.success, borderLeftWidth: 3 }]}>
              <Ionicons name="cash-outline" size={24} color={Colors.success} />
              <Text style={[styles.statNumber, { color: theme.text }]}>{formatCurrency(revenue)}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Ingresos</Text>
            </Card>
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Acciones rápidas</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: 'person-add-outline' as const, label: 'Dueño', color: Colors.primary, route: '/owner/create' },
              { icon: 'paw-outline' as const, label: 'Mascota', color: Colors.secondary, route: '/pet/create' },
              { icon: 'medkit-outline' as const, label: 'Cita', color: Colors.accent, route: '/treatment/create' },
            ].map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[styles.actionBtn, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}15` }]}>
                  <Ionicons name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.text }]}>+ {action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Treatments */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Próximas citas</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/treatments')}>
              <Text style={[styles.seeAll, { color: Colors.primary }]}>Ver todo</Text>
            </TouchableOpacity>
          </View>

          {todayTreatments.length === 0 ? (
            <Card>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No hay citas programadas
              </Text>
            </Card>
          ) : (
            todayTreatments.slice(0, 3).map((treatment) => {
              const pet = pets.find(p => p.id === treatment.petId);
              return (
                <Card
                  key={treatment.id}
                  onPress={() => router.push(`/treatment/${treatment.id}` as any)}
                  style={styles.treatmentCard}
                >
                  <View style={styles.treatmentRow}>
                    <View style={styles.treatmentInfo}>
                      <View style={styles.treatmentTopRow}>
                        <Text style={[styles.treatmentTitle, { color: theme.text }]}>
                          {pet ? `${speciesEmoji[pet.species]} ${pet.name}` : ''} — {treatment.title}
                        </Text>
                      </View>
                      <Text style={[styles.treatmentMeta, { color: theme.textSecondary }]}>
                        {formatDate(treatment.date)} • {treatment.time} • {treatmentTypeLabel[treatment.type]}
                      </Text>
                      <Text style={[styles.treatmentCost, { color: Colors.primary }]}>
                        {formatCurrency(treatment.cost)}
                      </Text>
                    </View>
                    <Badge
                      text={treatmentStatusLabel[treatment.status]}
                      variant={statusBadgeVariant(treatment.status) as any}
                      size="sm"
                    />
                  </View>
                </Card>
              );
            })
          )}
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
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  greeting: { fontSize: Layout.fontSize.md },
  userName: { fontSize: Layout.fontSize.xxl, fontWeight: '800', marginTop: 2 },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
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
  treatmentCard: { marginBottom: 10 },
  treatmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  treatmentInfo: { flex: 1, marginRight: 10 },
  treatmentTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  treatmentTitle: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  treatmentMeta: { fontSize: Layout.fontSize.sm, marginTop: 4 },
  treatmentCost: { fontSize: Layout.fontSize.md, fontWeight: '700', marginTop: 4 },
  emptyText: { textAlign: 'center', padding: 20 },
});
