
'use client';

import { LogIn, ShoppingCart, IndianRupee, User } from 'lucide-react';
import Link from 'next/link';
import { CartSidebar } from './cart-sidebar';
import { formatIndianCurrency } from '@/lib/utils';
import { useBudget } from '@/hooks/use-budget';
import { useSharedCart } from '@/hooks/use-shared-cart';
import { Badge } from '@/components/ui/badge';
import { useUser, useUserProfile } from '@/firebase';
import { Button } from '../ui/button';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="ValueCart Home">
      <div className="bg-primary p-2 rounded-md">
        <ShoppingCart className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="hidden text-xl font-bold text-foreground sm:inline-block">ValueCart</span>
    </Link>
  );
}

function UserAuth() {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return <div className="h-10 w-20 rounded-md bg-muted animate-pulse" />;
    }

    // Don't show login button if user is not logged in, as they will be on the login page.
    if (!user) {
        return null;
    }

    return null;
}


export function ShopHeader() {
  const { cartTotal } = useSharedCart();
  const { selectedBudget } = useBudget();
  const { userProfile, isUserProfileLoading } = useUserProfile();
  const { user, isUserLoading } = useUser();
  
  const budgetAmount = selectedBudget?.amount || 0;
  const spentPercentage = budgetAmount > 0 ? Math.round((cartTotal / budgetAmount) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Logo />
           {user && (
            <>
                <div className="hidden items-center gap-4 text-sm font-medium md:flex">
                    <span className="text-muted-foreground">Cart: {formatIndianCurrency(cartTotal)}</span>
                    {selectedBudget && (
                        <Badge variant={spentPercentage > 80 ? 'destructive' : 'secondary'}>Budget: {spentPercentage}%</Badge>
                    )}
                </div>
                <CartSidebar />
            </>
           )}
        </div>
        <div className="flex items-center gap-4">
            {user && (
            <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                <Link href="/budget" className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground/80">
                    <IndianRupee className="h-4 w-4" />
                    Budgets
                </Link>
                <Link href="/profile" className="flex items-center gap-2 text-foreground transition-colors hover:text-foreground/80">
                    <User className="h-4 w-4" />
                    {isUserProfileLoading ? '...' : userProfile?.name || 'Profile'}
                </Link>
            </nav>
          )}
          <UserAuth />
        </div>
      </div>
    </header>
  );
}
