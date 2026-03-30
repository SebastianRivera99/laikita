// ============================================
// LAIKITA - Owner Detail Screen
// ============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useData } from '@/context/DataContext';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { getInitials, formatPhone, speciesEmoji, speciesLabel } from '@/utils/formatters';

export default function OwnerDetailScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getOwner, deleteOwner, getPetsByOwner, getTreatmentsByOwner } = useData();

  const owner = getOwner(id!);
  if (!owner) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Dueño no encontrado</Text>
      </SafeAreaView>
    );
  }

  const ownerPets = getPetsByOwner(owner.id);
  const ownerTreatments = getTreatmentsByOwner(owner.id);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar dueño',
      `¿Estás seguro de eliminar a ${owner.firstName} ${owner.lastName}? Se eliminarán también sus mascotas y tratamientos.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteOwner(owner.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle del dueño</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Profile Card */}
          <Card style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: Colors.primarySoft }]}>
              <Text style={styles.avatarText}>
                {getInitials(owner.firstName, owner.lastName)}
              </Text>
            </View>
            <Text style={[styles.ownerName, { color: theme.text }]}>
              {owner.firstName} {owner.lastName}
            </Text>
            <Badge text={`${ownerPets.length} mascota(s)`} variant="primary" />
          </Card>

          {/* Info */}
          <Card>
            {[
              { icon: 'card-outline' as const, label: 'Documento', value: owner.document },
              { icon: 'mail-outline' as const, label: 'Email', value: owner.email },
              { icon: 'call-outline' as const, label: 'Teléfono', value: formatPhone(owner.phone) },
              { icon: 'location-outline' as const, label: 'Dirección', value: owner.address },
            ].map((info, idx) => (
              <View
                key={info.label}
                style={[
                  styles.infoRow,
                  idx > 0 && { borderTopWidth: 1, borderTopColor: theme.borderLight },
                ]}
              >
                <Ionicons name={info.icon} size={20} color={Colors.primary} />
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>{info.label}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{info.value}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Pets */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Mascotas ({ownerPets.length})
          </Text>
          {ownerPets.map(pet => (
            <Card key={pet.id} onPress={() => router.push(`/pet/${pet.id}` as any)} style={styles.petCard}>
              <View style={styles.petRow}>
                <Text style={styles.petEmoji}>{speciesEmoji[pet.species]}</Text>
                <View style={styles.petInfo}>
                  <Text style={[styles.petName, { color: theme.text }]}>{pet.name}</Text>
                  <Text style={[styles.petMeta, { color: theme.textSecondary }]}>
                    {pet.breed} • {speciesLabel[pet.species]}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </View>
            </Card>
          ))}

          <Button
            title="+ Agregar mascota"
            variant="outline"
            onPress={() => router.push('/pet/create' as any)}
            fullWidth
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
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
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700' },
  scrollContent: { paddingBottom: 60 },
  wrapper: {
    padding: Layout.spacing.lg,
    maxWidth: Layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: 14,
  },
  profileCard: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: Colors.primaryDark },
  ownerName: { fontSize: Layout.fontSize.xl, fontWeight: '800' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: Layout.fontSize.xs, marginBottom: 2 },
  infoValue: { fontSize: Layout.fontSize.md, fontWeight: '500' },
  sectionTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700', marginTop: 8 },
  petCard: { marginBottom: 0 },
  petRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  petEmoji: { fontSize: 28 },
  petInfo: { flex: 1 },
  petName: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  petMeta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
});
