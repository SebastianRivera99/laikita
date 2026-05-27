import React, { useState } from 'react';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Platform, View, Text, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTheme } from '@/context/ThemeContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { can } from '@/utils/permissions';

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary }]} />}
      <Ionicons name={name} size={24} color={color} />
    </View>
  );
}

function CartTabIcon({ color, focused }: { color: string; focused: boolean }) {
  const { getItemCount } = useCart();
  const count = getItemCount();
  return (
    <View style={styles.tabIconContainer}>
      {focused && <View style={[styles.activeIndicator, { backgroundColor: Colors.primary }]} />}
      <View>
        <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />
        {count > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{count > 9 ? '9+' : count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function Sidebar({ theme, user }: { theme: any; user: any }) {
  const router = useRouter();
  const segments = useSegments();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  // Estado que guarda el nombre del item que tiene el mouse encima
  // null = ningún item tiene hover activo
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoverToggle, setHoverToggle] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const activeTab = segments[segments.length - 1] === '(tabs)' ? 'index' : segments[segments.length - 1];

  const menuItems: {
    name: 'index' | 'owners' | 'pets' | 'treatments' | 'store';
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconOutline: keyof typeof Ionicons.glyphMap;
    visible: boolean;
    isCart?: boolean;
  }[] = [
    { name: 'index',      label: 'Inicio',   icon: 'home',    iconOutline: 'home-outline',   visible: true },
    { name: 'owners',     label: 'Dueños',   icon: 'people',  iconOutline: 'people-outline', visible: can(user, 'owners', 'view') },
    { name: 'pets',       label: 'Mascotas', icon: 'paw',     iconOutline: 'paw-outline',    visible: can(user, 'pets', 'view') },
    { name: 'treatments', label: 'Citas',    icon: 'medical', iconOutline: 'medkit-outline', visible: can(user, 'treatments', 'view') },
    { name: 'store',      label: 'Tienda',   icon: 'cart',    iconOutline: 'cart-outline',   visible: can(user, 'store', 'view'), isCart: true },
  ];

  return (
    <View style={[styles.sidebarContainer, { backgroundColor: theme.surface, borderColor: theme.borderLight }]}>
      <View style={styles.sidebarHeader}>
        <View style={[styles.logoCircle, { backgroundColor: Colors.primarySoft }]}>
          <Ionicons name="paw" size={24} color={Colors.primary} />
        </View>
        <Text style={[styles.sidebarBrand, { color: theme.text }]}>Laikita</Text>
      </View>

      <View style={styles.sidebarMenu}>
        {menuItems.map((item) => {
          if (!item.visible) return null;

          const isFocused = activeTab === item.name;
          const isHovered = hoveredItem === item.name;

          // Color del icono y texto segun estado:
          // activo → primario | hover → primario claro | normal → gris del tema
          const iconColor = isFocused
            ? Colors.primary
            : isHovered
            ? Colors.primaryLight
            : theme.tabIconDefault;

          // Fondo del boton segun estado:
          // activo → verde suave | hover → gris suave | normal → transparente
          const itemBgColor = isFocused
            ? Colors.primarySoft
            : isHovered
            ? theme.surfaceSecondary
            : 'transparent';

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.sidebarItem, { backgroundColor: itemBgColor }]}
              onPress={() => {
                if (item.name === 'index') {
                  router.push('/(tabs)');
                } else {
                  router.push(`/(tabs)/${item.name}`);
                }
              }}
              // Eventos de mouse — solo se disparan en web, ignorados en nativo
              // @ts-ignore TypeScript no los conoce pero React Native Web los soporta
              onMouseEnter={() => setHoveredItem(item.name)}
              // @ts-ignore
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Ionicons
                name={isFocused ? item.icon : item.iconOutline as any}
                size={22}
                color={iconColor}
              />
              <Text
                style={[
                  styles.sidebarItemText,
                  {
                    color: isFocused ? Colors.primary : isHovered ? Colors.primaryLight : theme.textSecondary,
                    fontWeight: isFocused ? '700' : isHovered ? '600' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>

              {item.isCart && cartCount > 0 && (
                <View style={[styles.cartBadge, styles.sidebarCartBadge]}>
                  <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Separador + Toggle de tema al fondo del sidebar */}
      <View style={styles.sidebarFooter}>
        <View style={[styles.sidebarDivider, { backgroundColor: theme.borderLight }]} />
        <TouchableOpacity
          style={[
            styles.sidebarItem,
            { backgroundColor: hoverToggle ? theme.surfaceSecondary : 'transparent' },
          ]}
          onPress={toggleTheme}
          // @ts-ignore
          onMouseEnter={() => setHoverToggle(true)}
          // @ts-ignore
          onMouseLeave={() => setHoverToggle(false)}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={22}
            color={hoverToggle ? Colors.primaryLight : theme.tabIconDefault}
          />
          <Text
            style={[
              styles.sidebarItemText,
              {
                color: hoverToggle ? Colors.primaryLight : theme.textSecondary,
                fontWeight: hoverToggle ? '600' : '500',
              },
            ]}
          >
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useThemeColors();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  return (
    <View style={styles.mainWrapper}>
      {isDesktop && <Sidebar theme={theme} user={user} />}
      <View style={styles.contentContainer}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: theme.tabIconDefault,
            tabBarStyle: [
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.borderLight,
                borderTopWidth: 1,
                height: Layout.tabBarHeight,
                paddingBottom: Platform.OS === 'ios' ? 20 : 8,
                paddingTop: 8,
              },
              isDesktop && { display: 'none' },
            ],
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
          }}
        >
          <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} /> }} />
          <Tabs.Screen name="owners" options={{ href: can(user, 'owners', 'view') ? undefined : null, title: 'Dueños', tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} /> }} />
          <Tabs.Screen name="pets" options={{ href: can(user, 'pets', 'view') ? undefined : null, title: 'Mascotas', tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'paw' : 'paw-outline'} color={color} focused={focused} /> }} />
          <Tabs.Screen name="treatments" options={{ href: can(user, 'treatments', 'view') ? undefined : null, title: 'Citas', tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'medical' : 'medkit-outline'} color={color} focused={focused} /> }} />
          <Tabs.Screen name="store" options={{ href: can(user, 'store', 'view') ? undefined : null, title: 'Tienda', tabBarIcon: ({ color, focused }) => <CartTabIcon color={color} focused={focused} /> }} />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, flexDirection: 'row' },
  contentContainer: { flex: 1 },
  tabIconContainer: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  activeIndicator: { position: 'absolute', top: -8, width: 24, height: 3, borderRadius: 2 },
  cartBadge: {
    position: 'absolute', top: -6, right: -10,
    backgroundColor: Colors.secondary, borderRadius: 10,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
  },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  sidebarContainer: { width: 240, height: '100%', borderRightWidth: 1, paddingTop: 32, paddingHorizontal: 16, paddingBottom: 24 },
  sidebarHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, marginBottom: 16 },
  logoCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sidebarBrand: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  // flex: 1 hace que el menu ocupe todo el espacio disponible
  // empujando el footer hacia el fondo del sidebar
  sidebarMenu: { gap: 8, flex: 1 },
  sidebarFooter: { gap: 8 },
  sidebarDivider: { height: 1, marginBottom: 4 },
  sidebarItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14,
    borderRadius: Layout.radius.md, gap: 12, position: 'relative',
    // Transicion suave del fondo en web
    // @ts-ignore
    transition: 'background-color 0.15s ease',
  },
  sidebarItemText: { fontSize: 14 },
  sidebarCartBadge: { position: 'absolute', right: 14, top: 14 },
});