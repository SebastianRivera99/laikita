// ============================================
// LAIKITA - Store Screen
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
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCart } from '@/context/CartContext';
import { mockProducts } from '@/data/mockData';
import Card from '@/components/ui/Card';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  formatCurrency,
  categoryLabel,
  categoryEmoji,
} from '@/utils/formatters';
import type { Product, ProductCategory } from '@/types';

const categories: { key: ProductCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'Todos', emoji: '🏪' },
  { key: 'food', label: 'Alimento', emoji: '🍖' },
  { key: 'medicine', label: 'Medicina', emoji: '💊' },
  { key: 'hygiene', label: 'Higiene', emoji: '🧴' },
  { key: 'toys', label: 'Juguetes', emoji: '🎾' },
  { key: 'accessories', label: 'Accesorios', emoji: '🎒' },
];

export default function StoreScreen() {
  const theme = useThemeColors();
  const { addToCart, isInCart, cart, removeFromCart, clearCart, getItemCount } = useCart();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ProductCategory | 'all'>('all');
  const [showCart, setShowCart] = useState(false);

  const filtered = useMemo(() => {
    let result = mockProducts.filter(p => p.isActive);
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, category]);

  const handleCheckout = () => {
    Alert.alert(
      'Compra realizada',
      `Total: ${formatCurrency(cart.total)}\n${getItemCount()} producto(s)`,
      [{ text: 'OK', onPress: clearCart }]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const inCart = isInCart(item.id);
    return (
      <Card style={styles.productCard}>
        <View style={[styles.productImage, { backgroundColor: `${Colors.speciesColors[item.petType[0]] || Colors.primary}15` }]}>
          <Text style={styles.productEmoji}>{categoryEmoji[item.category]}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productBrand, { color: theme.textTertiary }]}>{item.brand}</Text>
          <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productDesc, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.productBottom}>
            <View>
              <Text style={[styles.productPrice, { color: Colors.primary }]}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={[styles.stockText, { color: item.stock > 5 ? Colors.success : Colors.warning }]}>
                {item.stock > 5 ? 'En stock' : `Quedan ${item.stock}`}
              </Text>
            </View>
            {inCart ? (
              <TouchableOpacity
                style={[styles.cartBtn, { backgroundColor: Colors.errorSoft }]}
                onPress={() => removeFromCart(item.id)}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.error} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.cartBtn, { backgroundColor: Colors.primarySoft }]}
                onPress={() => addToCart(item)}
              >
                <Ionicons name="cart-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Tienda</Text>
          <TouchableOpacity
            style={[styles.cartIcon, { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => setShowCart(!showCart)}
          >
            <Ionicons name="cart" size={22} color={theme.text} />
            {getItemCount() > 0 && (
              <View style={styles.cartCountBadge}>
                <Text style={styles.cartCountText}>{getItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar productos..." />

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(c => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? Colors.primary : theme.surface,
                    borderColor: active ? Colors.primary : theme.border,
                  },
                ]}
                onPress={() => setCategory(c.key)}
              >
                <Text style={styles.categoryEmoji}>{c.emoji}</Text>
                <Text style={[styles.categoryLabel, { color: active ? '#FFF' : theme.textSecondary }]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Cart Summary (collapsible) */}
        {showCart && cart.items.length > 0 && (
          <Card style={styles.cartSummary}>
            <Text style={[styles.cartTitle, { color: theme.text }]}>
              Carrito ({getItemCount()} items)
            </Text>
            {cart.items.map(item => (
              <View key={item.product.id} style={styles.cartItem}>
                <Text style={[styles.cartItemName, { color: theme.text }]} numberOfLines={1}>
                  {item.product.name} x{item.quantity}
                </Text>
                <Text style={[styles.cartItemPrice, { color: theme.textSecondary }]}>
                  {formatCurrency(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
            <View style={[styles.cartDivider, { backgroundColor: theme.border }]} />
            <View style={styles.cartTotalRow}>
              <Text style={[styles.cartTotalLabel, { color: theme.text }]}>Total:</Text>
              <Text style={[styles.cartTotalValue, { color: Colors.primary }]}>
                {formatCurrency(cart.total)}
              </Text>
            </View>
            <Button title="Finalizar compra" onPress={handleCheckout} fullWidth size="sm" style={{ marginTop: 10 }} />
          </Card>
        )}

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderProduct}
          numColumns={Layout.isLargeDevice ? 3 : 2}
          columnWrapperStyle={styles.productsRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
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
    maxWidth: Layout.maxWebWidth,
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
  title: { fontSize: Layout.fontSize.title, fontWeight: '800' },
  cartIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartCountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartCountText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  categoriesScroll: { marginBottom: 12, flexGrow: 0 },
  categoriesContent: { gap: 8 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Layout.radius.full,
    borderWidth: 1,
    gap: 6,
  },
  categoryEmoji: { fontSize: 16 },
  categoryLabel: { fontSize: Layout.fontSize.sm, fontWeight: '600' },
  cartSummary: { marginBottom: 12, padding: 14 },
  cartTitle: { fontSize: Layout.fontSize.md, fontWeight: '700', marginBottom: 8 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cartItemName: { fontSize: Layout.fontSize.sm, flex: 1, marginRight: 8 },
  cartItemPrice: { fontSize: Layout.fontSize.sm },
  cartDivider: { height: 1, marginVertical: 8 },
  cartTotalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cartTotalLabel: { fontSize: Layout.fontSize.md, fontWeight: '700' },
  cartTotalValue: { fontSize: Layout.fontSize.lg, fontWeight: '800' },
  list: { paddingBottom: 120 },
  productsRow: { gap: 12, marginBottom: 12 },
  productCard: { flex: 1, padding: 0, overflow: 'hidden' },
  productImage: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: { fontSize: 36 },
  productInfo: { padding: 12 },
  productBrand: { fontSize: Layout.fontSize.xs, fontWeight: '600', textTransform: 'uppercase' },
  productName: { fontSize: Layout.fontSize.md, fontWeight: '600', marginTop: 2 },
  productDesc: { fontSize: Layout.fontSize.xs, marginTop: 4, lineHeight: 16 },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  productPrice: { fontSize: Layout.fontSize.lg, fontWeight: '800' },
  stockText: { fontSize: Layout.fontSize.xs, marginTop: 2 },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
