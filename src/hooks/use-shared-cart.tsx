
'use client';

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, deleteDoc, runTransaction, increment } from 'firebase/firestore';
import { useBudget } from './use-budget';
import { Product, CartItem } from '@/lib/types';
import { useToast } from './use-toast';

interface SharedCartContextType {
  cart: CartItem[] | null;
  isCartLoading: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

export const useSharedCart = (): SharedCartContextType => {
  const { selectedBudget } = useBudget();
  const firestore = useFirestore();
  const { toast } = useToast();

  const cartCollectionQuery = useMemoFirebase(() => {
    if (!firestore || !selectedBudget) return null;
    return collection(firestore, 'budgets', selectedBudget.id, 'cart');
  }, [firestore, selectedBudget]);

  const { data: cart, isLoading: isCartLoading } = useCollection<CartItem>(cartCollectionQuery);

  const cartTotal = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    if (!cart) return 0;
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const addToCart = async (product: Product) => {
    if (!firestore || !selectedBudget) {
        toast({
            variant: 'destructive',
            title: 'No Budget Selected',
            description: 'Please select a budget before adding items to the cart.',
        });
        return;
    }
    const cartCollectionRef = collection(firestore, 'budgets', selectedBudget.id, 'cart');
    const cartItemRef = doc(cartCollectionRef, product.id);

    try {
        await runTransaction(firestore, async (transaction) => {
            const sfDoc = await transaction.get(cartItemRef);
            if (!sfDoc.exists()) {
                transaction.set(cartItemRef, { 
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    imageHint: product.imageHint,
                    quantity: 1 
                });
            } else {
                transaction.update(cartItemRef, { quantity: increment(1) });
            }
        });
         toast({
            title: 'Added to cart',
            description: `${product.name} has been added to the shared cart.`,
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        toast({
            variant: 'destructive',
            title: 'Error adding to cart',
            description: 'Could not add the item to the cart. Please try again.',
        });
    }
  };
  
  const removeFromCart = async (productId: string) => {
    if (!firestore || !selectedBudget) return;
    const cartItemRef = doc(firestore, 'budgets', selectedBudget.id, 'cart', productId);
    await deleteDoc(cartItemRef);
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!firestore || !selectedBudget) return;
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const cartItemRef = doc(firestore, 'budgets', selectedBudget.id, 'cart', productId);
    await setDoc(cartItemRef, { quantity: newQuantity }, { merge: true });
  };
  
  const clearCart = async () => {
    if (!firestore || !selectedBudget || !cart) return;
    try {
      await runTransaction(firestore, async (transaction) => {
        cart.forEach(item => {
          const docRef = doc(firestore, 'budgets', selectedBudget.id, 'cart', item.id);
          transaction.delete(docRef);
        });
      });
    } catch (e) {
      console.error("Failed to clear cart: ", e);
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not clear the cart.',
      });
    }
  };

  return { cart, isCartLoading, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount };
};
