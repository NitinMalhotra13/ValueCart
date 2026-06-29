
'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { Budget } from '@/lib/types';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

interface BudgetContextType {
  budgets: Budget[] | null;
  isLoadingBudgets: boolean;
  selectedBudget: Budget | null;
  setSelectedBudgetId: (id: string | null) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const firestore = useFirestore();
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [hasUserMadeSelection, setHasUserMadeSelection] = useState(false);

  const budgetsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'budgets'),
      where('sharedUsers', 'array-contains', user.uid)
    );
  }, [user, firestore]);

  const { data: budgets, isLoading: isLoadingBudgets } = useCollection<Budget>(budgetsQuery);

  useEffect(() => {
    if (isLoadingBudgets) return;

    // If the user hasn't made a selection yet and budgets are loaded, select the first one by default.
    if (!hasUserMadeSelection && budgets && budgets.length > 0) {
      setSelectedBudgetId(budgets[0].id);
      setHasUserMadeSelection(true); // Mark that an initial selection has been made.
    }
    
    // If a budget was selected, but it's no longer in the available list (e.g., deleted or user removed),
    // reset the selection to the first available budget or null.
    if (selectedBudgetId && budgets && !budgets.find(b => b.id === selectedBudgetId)) {
        const newBudgetId = budgets.length > 0 ? budgets[0].id : null;
        setSelectedBudgetId(newBudgetId);
    }
  }, [budgets, selectedBudgetId, isLoadingBudgets, hasUserMadeSelection]);

  const handleSetSelectedId = (id: string | null) => {
    setHasUserMadeSelection(true); // Any manual selection is tracked
    setSelectedBudgetId(id);
  }

  const selectedBudget = useMemo(() => {
    if (!selectedBudgetId || !budgets) return null;
    return budgets.find((b) => b.id === selectedBudgetId) || null;
  }, [selectedBudgetId, budgets]);

  const value = {
    budgets,
    isLoadingBudgets,
    selectedBudget,
    setSelectedBudgetId: handleSetSelectedId,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};
