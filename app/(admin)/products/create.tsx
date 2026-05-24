import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

const categories = [
  { value: 'food', label: 'Alimento' },
  { value: 'medicine', label: 'Medicina' },
  { value: 'hygiene', label: 'Higiene' },
  { value: 'toys', label: 'Juguetes' },
  { value: 'accessories', label: 'Accesorios' },
  { value: 'clothing', label: 'Ropa' },
];

export default function CreateProductScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'food',
    price: '',
    stock: '',
    brand: '',
  });

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    if (!form.price || isNaN(parseFloat(form.price))) {
      Alert.alert('Error', 'El precio es obligatorio y debe ser un número');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('products').insert({
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        brand: form.brand.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      Alert.alert('Éxito', 'Producto creado correctamente', [
        { text: 'OK', onPress: () => router.push('/(admin)/products') }
      ]);
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'No se pudo crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Nuevo Producto</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Nombre *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="Nombre del producto"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Marca</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.brand}
            onChangeText={(text) => setForm({ ...form, brand: text })}
            placeholder="Marca"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Categoría *</Text>
          <View style={styles.categoriesRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: form.category === cat.value ? Colors.primary : theme.surface,
                    borderColor: form.category === cat.value ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setForm({ ...form, category: cat.value })}
              >
                <Text style={{ color: form.category === cat.value ? '#FFF' : theme.textSecondary, fontSize: 13 }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Precio *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.price}
              onChangeText={(text) => setForm({ ...form, price: text })}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={theme.textTertiary}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={[styles.label, { color: theme.text }]}>Stock</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
              value={form.stock}
              onChangeText={(text) => setForm({ ...form, stock: text })}
              placeholder="0"
              keyboardType="numeric"
              placeholderTextColor={theme.textTertiary}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.text }]}>Descripción</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
            value={form.description}
            onChangeText={(text) => setForm({ ...form, description: text })}
            placeholder="Descripción del producto"
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
          />
        </View>

        <Button title="Crear Producto" onPress={handleSave} loading={loading} fullWidth size="lg" style={{ marginTop: 20 }} />
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
  content: { padding: Layout.spacing.lg, gap: 16 },
  formGroup: { gap: 8 },
  label: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  textArea: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 12 },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
});