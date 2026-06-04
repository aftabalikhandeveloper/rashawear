'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WooCart } from '@/lib/types';

interface CartContextType {
  cart: WooCart | null;
  loading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (productId: number, quantity?: number, variationId?: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getSession(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('woo_session_token');
}

function saveSession(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('woo_session_token', token);
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<WooCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshCart = useCallback(async () => {
    const session = getSession();
    if (!session) return;
    try {
      const res = await fetch('/api/cart', {
        headers: { 'x-woo-session': session },
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      if (data.sessionToken) saveSession(data.sessionToken);
    } catch (e) {
      console.error('Failed to refresh cart', e);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (productId: number, quantity = 1, variationId?: number) => {
    setLoading(true);
    try {
      const session = getSession();
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(session ? { 'x-woo-session': session } : {}) },
        body: JSON.stringify({ productId, quantity, variationId }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      if (data.sessionToken) saveSession(data.sessionToken);
      setIsCartOpen(true);
    } catch (e) {
      console.error('Failed to add to cart', e);
    }
    setLoading(false);
  }, []);

  const updateQuantity = useCallback(async (key: string, quantity: number) => {
    const session = getSession();
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-woo-session': session },
        body: JSON.stringify({ key, quantity }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      if (data.sessionToken) saveSession(data.sessionToken);
    } catch (e) {
      console.error('Failed to update cart', e);
    }
    setLoading(false);
  }, []);

  const removeItem = useCallback(async (key: string) => {
    const session = getSession();
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-woo-session': session },
        body: JSON.stringify({ keys: [key] }),
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      if (data.sessionToken) saveSession(data.sessionToken);
    } catch (e) {
      console.error('Failed to remove item', e);
    }
    setLoading(false);
  }, []);

  const clearCart = useCallback(async () => {
    const session = getSession();
    // Always reset local state
    setCart(null);
    if (!session) return;
    setLoading(true);
    try {
      const res = await fetch('/api/cart/empty', {
        method: 'POST',
        headers: { 'x-woo-session': session },
      });
      const data = await res.json();
      if (data.cart) setCart(data.cart);
      if (data.sessionToken) saveSession(data.sessionToken);
    } catch (e) {
      // Session may already be invalid after checkout — that's fine
      console.error('Failed to clear cart on server', e);
    }
    setLoading(false);
  }, []);

  const totalItems = cart?.contents?.itemCount || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart,
      totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
