
'use client';

import { ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { useSharedCart } from '@/hooks/use-shared-cart';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatIndianCurrency } from '@/lib/utils';
import { useUser, useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import { collection, writeBatch, doc, getFirestore, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useBudget } from '@/hooks/use-budget';
import { type DeliveryAddress } from '@/lib/types';
import { CheckoutDialog } from '@/components/shop/checkout-dialog';


export function CartSidebar() {
  const { cart, cartCount, cartTotal, removeFromCart, clearCart, updateQuantity, isCartLoading } = useSharedCart();
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const { selectedBudget } = useBudget();

  const handleInitiateCheckout = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'You must be logged in to checkout.' });
      return;
    }
    if (!selectedBudget) {
      toast({ variant: 'destructive', title: 'No budget selected.' });
      return;
    }
    if (!cart || cart.length === 0) {
      toast({ variant: 'destructive', title: 'Cart is empty.' });
      return;
    }
    
    setIsCheckoutDialogOpen(true);
  }

  const handleFinalizeCheckout = async (deliveryAddress: DeliveryAddress) => {
    if (!user || !firestore || !cart || !selectedBudget) return;

    setIsCheckingOut(true);
    try {
      const db = getFirestore();
      const batch = writeBatch(db);

      // Generate ONE purchase ID to be shared across all users for this order.
      const newPurchaseRef = doc(collection(db, 'users', user.uid, 'purchases'));
      const purchaseId = newPurchaseRef.id;

      const basePurchaseData = {
        id: purchaseId, // Use the shared ID
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          priceAtPurchase: item.price,
          imageUrl: item.imageUrl,
          imageHint: item.imageHint,
        })),
        totalAmount: cartTotal,
        purchaseDate: serverTimestamp(),
        status: 'Processing' as 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled',
        budgetId: selectedBudget.id,
        budgetName: selectedBudget.name,
        deliveryAddress: {
            userId: deliveryAddress.userId,
            fullName: deliveryAddress.fullName,
            addressLine1: deliveryAddress.addressLine1,
            addressLine2: deliveryAddress.addressLine2,
            city: deliveryAddress.city,
            state: deliveryAddress.state,
            postalCode: deliveryAddress.postalCode,
            country: deliveryAddress.country,
            phoneNumber: deliveryAddress.phoneNumber,
        },
      };

      for (const memberId of selectedBudget.sharedUsers) {
        if (typeof memberId === 'string' && memberId.length > 0) {
          // Create a reference for each user's purchase doc using the SHARED ID
          const userPurchaseRef = doc(db, 'users', memberId, 'purchases', purchaseId);
          const purchaseDataForUser = {
            ...basePurchaseData,
            userId: memberId, // Correctly assign the userId for each member
          };
          batch.set(userPurchaseRef, purchaseDataForUser);
        }
      }
      
      await batch.commit().catch(e => {
          const permissionError = new FirestorePermissionError({
              path: `/users/{userId}/purchases`,
              operation: 'create',
              requestResourceData: basePurchaseData,
          });
          errorEmitter.emit('permission-error', permissionError);
          throw e; 
      });
      
      clearCart();
      toast({
        title: 'Checkout Successful',
        description: 'Thank you! Your collaborative order is now processing.',
      });
      setIsCheckoutDialogOpen(false);
      router.push('/profile');

    } catch (error) {
      if (!(error instanceof FirestorePermissionError)) {
        toast({
          variant: 'destructive',
          title: 'Checkout failed',
          description: 'Could not complete your purchase. Please try again.',
        });
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const renderContent = () => {
    if (!selectedBudget) {
       return (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">No Budget Selected</h3>
            <p className="text-muted-foreground">Please select a budget to start shopping.</p>
          </div>
        );
    }

    if (isCartLoading) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }
    
    if (cart && cart.length > 0) {
       return (
          <>
            <ScrollArea className="flex-1">
              <div className="flex flex-col gap-4 px-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        data-ai-hint={item.imageHint}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                          className="w-12 rounded-md border border-input bg-transparent px-2 py-1"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatIndianCurrency(item.price * item.quantity)}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Separator />
            <SheetFooter className="px-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between font-bold">
                  <span>Subtotal</span>
                  <span>{formatIndianCurrency(cartTotal)}</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Button onClick={handleInitiateCheckout} className="w-full" disabled={isCheckingOut}>
                    {isCheckingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Proceed to Checkout
                  </Button>
                </div>
                <Button variant="outline" className="w-full" onClick={() => clearCart()}>
                  Clear Cart
                </Button>
              </div>
            </SheetFooter>
          </>
        )
    }

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-muted-foreground">Add some products to get started.</p>
        </div>
    )
  }

  return (
    <>
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Open cart</span>
          {cartCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0"
            >
              {cartCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle>Shopping Cart ({cartCount})</SheetTitle>
        </SheetHeader>
        <Separator />
        {renderContent()}
      </SheetContent>
    </Sheet>
    {isCheckoutDialogOpen && <CheckoutDialog 
        open={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        onCheckout={handleFinalizeCheckout}
    />}
    </>
  );
}
