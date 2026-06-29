
'use client';

import { CartProvider } from '@/hooks/use-cart';
import { Toaster } from '@/components/ui/toaster';
import { BudgetProvider } from '@/hooks/use-budget';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BudgetProvider>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </BudgetProvider>
  );
}
