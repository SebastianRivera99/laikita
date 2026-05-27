import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';
import { Platform } from 'react-native';

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  brand: string;
  is_active: boolean;
}

export default function AdminProductsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const handleDelete = (id: number, productName: string) => {
  // Detectar si es web o móvil
  const isWeb = Platform.OS === 'web';
  
  const confirmDelete = () => {
    // Mostrar confirmación según la plataforma
    if (isWeb) {
      return window.confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`);
    } else {
      // Para móvil usamos una promesa con Alert.alert
      return new Promise((resolve) => {
        Alert.alert(
          'Eliminar producto',
          `¿Eliminar "${productName}"?`,
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Eliminar', style: 'destructive', onPress: () => resolve(true) }
          ]
        );
      });
    }
  };

  // Ejecutar confirmación y luego eliminar
  const doDelete = async () => {
    try {
      console.log('Eliminando producto ID:', id);
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      alert(`"${productName}" eliminado correctamente`);
    } catch (error: any) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  // Para web: confirmación sincrónica
  if (isWeb) {
    if (window.confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
      doDelete();
    }
  } else {
    // Para móvil: alerta asincrónica
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${productName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: doDelete }
      ]
    );
  }
};

  const toggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      await loadProducts();
      Alert.alert('Éxito', currentStatus ? 'Producto desactivado' : 'Producto activado');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Card style={styles.productCard}>
      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.productBrand, { color: theme.textSecondary }]}>{item.brand}</Text>
          <Text style={[styles.productPrice, { color: Colors.primary }]}>{formatCurrency(item.price)}</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.stock, { color: item.stock > 0 ? Colors.success : Colors.error }]}>
              Stock: {item.stock}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: item.is_active ? Colors.successSoft : Colors.errorSoft }]}>
              <Text style={{ color: item.is_active ? Colors.success : Colors.error, fontSize: 10, fontWeight: '600' }}>
                {item.is_active ? 'Activo' : 'Inactivo'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.primarySoft }]}
            onPress={() => router.push(`/(admin)/products/${item.id}`)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.warningSoft }]}
            onPress={() => toggleActive(item.id, item.is_active)}
          >
            <Ionicons name={item.is_active ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: Colors.errorSoft }]}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Ionicons name="trash-outline" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(admin)')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Gestionar Productos</Text>
        <TouchableOpacity onPress={() => router.push('/(admin)/products/create')} style={styles.addBtn}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadProducts}
        ListEmptyComponent={
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 50 }}>
            No hay productos registrados
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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Layout.spacing.lg, gap: 12 },
  productCard: { marginBottom: 0 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  productBrand: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  productPrice: { fontSize: Layout.fontSize.lg, fontWeight: '700', marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  stock: { fontSize: Layout.fontSize.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});