// ============================================
// LAIKITA - Gestión de Productos (Inventory)
// CRUD completo para inventario
// ============================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { supabase } from '@/lib/supabase';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/formatters';

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

export default function InventoryProductsScreen() {
  const theme = useThemeColors();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number, productName: string) => {
    const isWeb = Platform.OS === 'web';
    
    const doDelete = async () => {
      try {
        console.log('Eliminando producto ID:', id);
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setProducts(prev => prev.filter(p => p.id !== id));
        
        if (isWeb) {
          alert(`"${productName}" eliminado correctamente`);
        } else {
          Alert.alert('Éxito', `"${productName}" eliminado correctamente`);
        }
      } catch (error: any) {
        if (isWeb) {
          alert('Error: ' + error.message);
        } else {
          Alert.alert('Error', error.message);
        }
      }
    };

    if (isWeb) {
      if (window.confirm(`¿Eliminar "${productName}"? Esta acción no se puede deshacer.`)) {
        doDelete();
      }
    } else {
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
    const isWeb = Platform.OS === 'web';
    
    const doToggle = async () => {
      try {
        const { error } = await supabase
          .from('products')
          .update({ is_active: !currentStatus })
          .eq('id', id);

        if (error) throw error;
        await loadProducts();
        
        if (isWeb) {
          alert(currentStatus ? 'Producto desactivado' : 'Producto activado');
        } else {
          Alert.alert('Éxito', currentStatus ? 'Producto desactivado' : 'Producto activado');
        }
      } catch (error: any) {
        if (isWeb) {
          alert('Error: ' + error.message);
        } else {
          Alert.alert('Error', error.message);
        }
      }
    };

    if (isWeb) {
      if (window.confirm(`¿${currentStatus ? 'Desactivar' : 'Activar'} el producto?`)) {
        doToggle();
      }
    } else {
      Alert.alert(
        'Cambiar estado',
        `¿${currentStatus ? 'Desactivar' : 'Activar'} el producto?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: doToggle }
        ]
      );
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/(inventory)/products/${id}` as any);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <Card style={styles.productCard}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: Colors.primarySoft }]}>
          <Ionicons name="cart-outline" size={24} color={Colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.brand, { color: theme.textSecondary }]}>{item.brand}</Text>
          <View style={styles.priceStockRow}>
            <Text style={[styles.price, { color: Colors.primary }]}>{formatCurrency(item.price)}</Text>
            <Text style={[styles.stock, { color: theme.textTertiary }]}>Stock: {item.stock}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.is_active ? Colors.successSoft : Colors.errorSoft }]}>
            <Text style={{ color: item.is_active ? Colors.success : Colors.error, fontSize: 10, fontWeight: '600' }}>
              {item.is_active ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: Colors.primarySoft }]}
              onPress={() => handleEdit(item.id)}
            >
              <Ionicons name="create-outline" size={18} color={Colors.primary} />
              <Text style={{ fontSize: 11, color: Colors.primary }}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: Colors.warningSoft }]}
              onPress={() => toggleActive(item.id, item.is_active)}
            >
              <Ionicons name={item.is_active ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.warning} />
              <Text style={{ fontSize: 11, color: Colors.warning }}>{item.is_active ? 'Desactivar' : 'Activar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: Colors.errorSoft }]}
              onPress={() => handleDelete(item.id, item.name)}
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
              <Text style={{ fontSize: 11, color: Colors.error }}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/store')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Productos</Text>
          <TouchableOpacity onPress={() => router.push('/(inventory)/products/create' as any)} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar productos..." />

        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadProducts}
          ListEmptyComponent={
            <EmptyState
              icon="cart-outline"
              title="Sin productos registrados"
              description="Agrega el primer producto"
              actionLabel="+ Agregar producto"
              onAction={() => router.push('/(inventory)/products/create' as any)}
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
  productCard: { marginBottom: 0, padding: Layout.spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  name: { fontSize: Layout.fontSize.md, fontWeight: '600' },
  brand: { fontSize: Layout.fontSize.sm, marginTop: 2 },
  priceStockRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  price: { fontSize: Layout.fontSize.md, fontWeight: '700' },
  stock: { fontSize: Layout.fontSize.xs },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, alignSelf: 'flex-start', marginTop: 6 },
  rightCol: { alignItems: 'flex-end' },
  actionButtons: { flexDirection: 'row', gap: 6 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6 },
});