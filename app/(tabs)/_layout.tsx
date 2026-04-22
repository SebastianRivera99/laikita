// ============================================
// LAIKITA - Tabs Layout
// Bottom navigation with 5 tabs
// ============================================

import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { can } from '@/utils/permissions';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
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

export default function TabsLayout() {
  const theme = useThemeColors();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.borderLight,
          borderTopWidth: 1,
          height: Layout.tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          ...(Layout.isWeb && {
            maxWidth: Layout.maxWebWidth,
            alignSelf: 'center',
            width: '100%',
          }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="owners"
        options={{
          href: can(user, 'owners', 'view') ? undefined : null,
          title: 'Dueños',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'people' : 'people-outline'} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="pets"
        options={{
          href: can(user, 'pets', 'view') ? undefined : null,
          title: 'Mascotas',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'paw' : 'paw-outline'} color={color} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="treatments"
        options={{
          href: can(user, 'treatments', 'view') ? undefined : null,
          title: 'Citas',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'medical' : 'medkit-outline'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="store"
        options={{
          href: can(user, 'store', 'view') ? undefined : null,
          title: 'Tienda',
          tabBarIcon: ({ color, focused }) => (
            <CartTabIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
});