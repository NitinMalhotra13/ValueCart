'use client';

import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export function CartSummary() {
  const { cart } = useCart();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cart.length > 0 ? (
          <div>
            {/* Cart items could be listed here */}
            <p>You have {cart.length} items in your cart.</p>
          </div>
        ) : (
          <p className="text-muted-foreground">Your cart is empty</p>
        )}
      </CardContent>
    </Card>
  );
}
