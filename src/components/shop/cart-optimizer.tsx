
'use client';

import { useState } from 'react';
import { useSharedCart } from '@/hooks/use-shared-cart';
import { useBudget } from '@/hooks/use-budget';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Sparkles, ThumbsUp, ThumbsDown, ArrowRight } from 'lucide-react';
import { optimizeCartWithinBudget } from '@/lib/ai-client';
import { products as allProducts } from '@/lib/mock-data';
import { CartItem } from '@/lib/types';
import { formatIndianCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

type OptimizedItem = CartItem & { reason: string };

export function CartOptimizer() {
  const { cart, clearCart, addToCart: addProductToCart } = useSharedCart();
  const { selectedBudget } = useBudget();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [optimizedCart, setOptimizedCart] = useState<OptimizedItem[]>([]);
  const [removedItems, setRemovedItems] = useState<OptimizedItem[]>([]);
  const [reasoning, setReasoning] = useState('');

  const handleOptimizeCart = async () => {
    if (!selectedBudget) {
      toast({
        variant: 'destructive',
        title: 'No Budget Selected',
        description: 'Please select a budget to optimize your cart.',
      });
      return;
    }
    if (!cart || cart.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cart is Empty',
        description: 'Add items to your cart before optimizing.',
      });
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    try {
      const response = await optimizeCartWithinBudget({
        cartItems: JSON.stringify(cart),
        allProducts: JSON.stringify(allProducts),
        budget: selectedBudget.amount,
      });

      setOptimizedCart(JSON.parse(response.optimizedCart));
      setRemovedItems(JSON.parse(response.removedItems));
      setReasoning(response.reasoning);

    } catch (error) {
      console.error('Error optimizing cart:', error);
      toast({
        variant: 'destructive',
        title: 'Optimization Failed',
        description: 'Could not get optimization suggestions. Please try again.',
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = () => {
    // Clear the existing cart
    clearCart();
    // Add all the optimized items to the cart
    optimizedCart.forEach(item => {
        const product = allProducts.find(p => p.id === item.productId);
        if (product) {
             // We need to call addToCart multiple times for quantity > 1
            for (let i = 0; i < item.quantity; i++) {
                addProductToCart(product);
            }
        }
    });
    toast({
        title: "Cart Optimized!",
        description: "Your cart has been updated with the suggested items."
    });
    setIsOpen(false);
  };
  
  const optimizedTotal = optimizedCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      <Button onClick={handleOptimizeCart} disabled={isLoading || !cart || cart.length === 0}>
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        Optimize Cart
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cart Optimization Suggestion</DialogTitle>
            <DialogDescription>
              Based on your budget of {formatIndianCurrency(selectedBudget?.amount || 0)}, here is the suggested optimal cart.
            </DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Finding the best value for you...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Kept/Added Items */}
                <div className="flex flex-col gap-4 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                        <ThumbsUp className="h-6 w-6 text-green-500" />
                        <h3 className="text-lg font-semibold">Suggested Cart ({formatIndianCurrency(optimizedTotal)})</h3>
                    </div>
                    <ScrollArea className="h-64">
                    <div className="space-y-4 pr-4">
                        {optimizedCart.map(item => (
                            <div key={item.id} className="text-sm">
                                <div className="flex justify-between font-medium">
                                    <span>{item.name} (x{item.quantity})</span>
                                    <span>{formatIndianCurrency(item.price * item.quantity)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground italic">&quot;{item.reason}&quot;</p>
                            </div>
                        ))}
                    </div>
                    </ScrollArea>
                </div>
                
                {/* Removed Items */}
                <div className="flex flex-col gap-4 rounded-lg border p-4">
                     <div className="flex items-center gap-2">
                        <ThumbsDown className="h-6 w-6 text-red-500" />
                        <h3 className="text-lg font-semibold">Removed Items</h3>
                    </div>
                    <ScrollArea className="h-64">
                    {removedItems.length > 0 ? (
                         <div className="space-y-4 pr-4">
                            {removedItems.map(item => (
                                <div key={item.id} className="text-sm">
                                     <div className="flex justify-between font-medium text-muted-foreground">
                                        <span className="line-through">{item.name} (x{item.quantity})</span>
                                        <span className="line-through">{formatIndianCurrency(item.price * item.quantity)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">&quot;{item.reason}&quot;</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-8">No items were removed.</p>
                    )}
                    </ScrollArea>
                </div>
                 <div className="md:col-span-2 space-y-2">
                    <Separator />
                     <p className="text-sm font-semibold">Summary:</p>
                    <p className="text-sm text-muted-foreground">{reasoning}</p>
                </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Ignore</Button>
            </DialogClose>
            <Button onClick={handleApplySuggestion} disabled={isLoading}>Apply Suggestion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
