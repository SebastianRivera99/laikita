// ============================================
// LAIKITA - Cart Context
// Shopping cart for the pet store
// ============================================

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Product, CartItem, Cart } from '@/types';

interface CartContextType {
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(quantity, i.product.stock) }
            : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const getItemCount = useCallback(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const isInCart = useCallback(
    (productId: string) => items.some(i => i.product.id === productId),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        cart: { items, total },
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemCount,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
