
'use client';

import type { Product } from '@/lib/types';
import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useSharedCart } from './use-shared-cart';

// This interface is now a placeholder, the real logic is in useSharedCart.
interface CartContextType {
  cart: any[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  cartTotal: number;
  cartCount: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// This provider now acts as a compatibility layer.
// All its methods will now be no-ops or delegate to the new shared cart hook where appropriate.
// This prevents having to refactor every single component that uses useCart immediately.
export const CartProvider = ({ children }: { children: ReactNode }) => {
  
  const value = {
    cart: [],
    addToCart: () => console.warn("addToCart called on local cart provider."),
    removeFromCart: () => console.warn("removeFromCart called on local cart provider."),
    updateQuantity: () => console.warn("updateQuantity called on local cart provider."),
    cartTotal: 0,
    cartCount: 0,
    clearCart: () => console.warn("clearCart called on local cart provider."),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};


export const useCart = () => {
    // This is a proxy hook. It will try to use the shared cart if a budget is selected.
    // Otherwise it will return a dummy object.
    const { cart, addToCart, removeFromCart, updateQuantity, cartTotal, cartCount, clearCart, isCartLoading } = useSharedCart();

    const dummyCart = {
      cart: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      cartTotal: 0,
      cartCount: 0,
      clearCart: () => {},
    };

    const sharedCart = {
        cart: cart || [],
        addToCart,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount,
        clearCart
    };
    
    // if cart is loading, we return a dummy cart with some loading state maybe
    if (isCartLoading) {
        return dummyCart;
    }

    return sharedCart;
}
