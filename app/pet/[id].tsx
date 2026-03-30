// ============================================
// LAIKITA - Pet Detail Screen
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
import {
  speciesEmoji,
  speciesLabel,
  formatDate,
  formatCurrency,
  treatmentTypeLabel,
  treatmentStatusLabel,
} from '@/utils/formatters';

export default function PetDetailScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, getOwner, deletePet, getTreatmentsByPet } = useData();

  const pet = getPet(id!);
  if (!pet) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text, padding: 20 }}>Mascota no encontrada</Text>
      </SafeAreaView>
    );
  }

  const owner = getOwner(pet.ownerId);
  const petTreatments = getTreatmentsByPet(pet.id);

  const handleDelete = () => {
    Alert.alert('Eliminar mascota', `¿Eliminar a ${pet.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => { deletePet(pet.id); router.back(); },
      },
    ]);
  };

  const genderLabel = pet.gender === 'male' ? 'Macho' : 'Hembra';
  const sizeLabel = pet.size === 'small' ? 'Pequeño' : pet.size === 'medium' ? 'Mediano' : 'Grande';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Detalle mascota</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
          <Ionicons name="trash-outline" size={22} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wrapper}>
          {/* Profile */}
          <Card style={styles.profileCard}>
            <View style={[styles.avatar, { backgroundColor: `${Colors.speciesColors[pet.species]}20` }]}>
              <Text style={styles.avatarEmoji}>{speciesEmoji[pet.species]}</Text>
            </View>
            <Text style={[styles.petName, { color: theme.text }]}>{pet.name}</Text>
            <Text style={[styles.petBreed, { color: theme.textSecondary }]}>{pet.breed}</Text>
            <View style={styles.badgesRow}>
              <Badge text={speciesLabel[pet.species]} variant="primary" size="sm" />
              <Badge text={genderLabel} variant="secondary" size="sm" />
              <Badge text={sizeLabel} variant="neutral" size="sm" />
            </View>
          </Card>

          {/* Info Grid */}
          <Card>
            <View style={styles.infoGrid}>
              {[
                { label: 'Peso', value: `${pet.weight} kg`, icon: 'scale-outline' as const },
                { label: 'Color', value: pet.color, icon: 'color-palette-outline' as const },
                { label: 'Nacimiento', value: formatDate(pet.birthDate), icon: 'calendar-outline' as const },
                { label: 'Esterilizado', value: pet.isNeutered ? 'Sí' : 'No', icon: 'medical-outline' as const },
              ].map((info, idx) => (
                <View key={info.label} style={styles.infoItem}>
                  <Ionicons name={info.icon} size={20} color={Colors.primary} />
                  <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>{info.label}</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{info.value}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Owner */}
          {owner && (
            <Card onPress={() => router.push(`/owner/${owner.id}` as any)}>
              <View style={styles.ownerRow}>
                <Ionicons name="person-circle-outline" size={28} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ownerLabel, { color: theme.textTertiary }]}>Dueño</Text>
                  <Text style={[styles.ownerName, { color: theme.text }]}>
                    {owner.firstName} {owner.lastName}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
              </View>
            </Card>
          )}

          {/* Allergies */}
          {pet.allergies.length > 0 && (
            <Card>
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Alergias</Text>
              <View style={styles.badgesRow}>
                {pet.allergies.map(a => (
                  <Badge key={a} text={a} variant="error" size="sm" />
                ))}
              </View>
            </Card>
          )}

          {/* Treatments */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Historial ({petTreatments.length})
          </Text>
          {petTreatments.map(t => (
            <Card key={t.id} onPress={() => router.push(`/treatment/${t.id}` as any)} style={{ marginBottom: 8 }}>
              <View style={styles.treatmentRow}>
                <View style={[styles.treatmentDot, { backgroundColor: Colors.treatmentColors[t.type] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.treatmentTitle, { color: theme.text }]}>{t.title}</Text>
                  <Text style={[styles.treatmentMeta, { color: theme.textSecondary }]}>
                    {formatDate(t.date)} • {treatmentTypeLabel[t.type]}
                  </Text>
                </View>
                <Text style={[styles.treatmentCost, { color: Colors.primary }]}>
                  {formatCurrency(t.cost)}
                </Text>
              </View>
            </Card>
          ))}

          <Button
            title="+ Nueva cita"
            variant="outline"
            onPress={() => router.push('/treatment/create' as any)}
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
  profileCard: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },
  petName: { fontSize: Layout.fontSize.xxl, fontWeight: '800' },
  petBreed: { fontSize: Layout.fontSize.md },
  badgesRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    paddingVertical: 10,
    gap: 4,
  },
  infoLabel: { fontSize: Layout.fontSize.xs },
  infoValue: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ownerLabel: { fontSize: Layout.fontSize.xs },
  ownerName: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  sectionLabel: { fontSize: Layout.fontSize.md, fontWeight: '600', marginBottom: 8 },
  sectionTitle: { fontSize: Layout.fontSize.lg, fontWeight: '700', marginTop: 4 },
  treatmentRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  treatmentDot: { width: 8, height: 8, borderRadius: 4 },
  treatmentTitle: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  treatmentMeta: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  treatmentCost: { fontSize: Layout.fontSize.md, fontWeight: '700' },
});
