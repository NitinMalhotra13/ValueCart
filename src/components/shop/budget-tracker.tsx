
'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useSharedCart } from '@/hooks/use-shared-cart';
import { formatIndianCurrency } from '@/lib/utils';
import { Loader2, Target, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useBudget } from '@/hooks/use-budget';


export function BudgetTracker() {
  const { cartTotal } = useSharedCart();
  const { selectedBudget, setSelectedBudgetId, budgets, isLoadingBudgets } = useBudget();

  const budgetAmount = selectedBudget?.amount || 0;
  const remaining = budgetAmount - cartTotal;
  const progress = budgetAmount > 0 ? (cartTotal / budgetAmount) * 100 : 0;

  const handleBudgetChange = (budgetId: string) => {
    if (budgetId === 'none') {
      setSelectedBudgetId(null);
    } else {
      setSelectedBudgetId(budgetId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Budget Tracker
        </CardTitle>
        <CardDescription>Track your spending against your shared budgets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoadingBudgets ? (
            <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : budgets && budgets.length > 0 ? (
          <>
            <Select onValueChange={handleBudgetChange} value={selectedBudget?.id || 'none'}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a budget" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {budgets.map(budget => (
                  <SelectItem key={budget.id} value={budget.id}>
                    {budget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedBudget && (
              <>
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Selected Budget</span>
                    <span>{formatIndianCurrency(budgetAmount)}</span>
                  </div>
                </div>
                <Progress value={progress} />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent: <span className="font-medium text-foreground">{formatIndianCurrency(cartTotal)}</span></span>
                  <span className={`font-medium ${remaining < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    Remaining: {formatIndianCurrency(remaining)}
                  </span>
                </div>
              </>
            )}
          </>
        ) : (
            <div className="text-center text-sm text-muted-foreground p-4 border rounded-md">
                <Users className="mx-auto h-8 w-8 mb-2 text-muted" />
                <p className="mb-4">No budgets found. Go to the budget page to create or join one.</p>
                <Button asChild size="sm">
                  <Link href="/budget">Go to Budgets</Link>
                </Button>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
