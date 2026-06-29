
'use client';

import { useState, useEffect } from 'react';
import { products } from '@/lib/mock-data';
import { ProductCard } from '@/components/shop/product-card';
import { ShopHeader } from '@/components/shop/header';
import { SmartProductSearch } from '@/components/shop/smart-product-search';
import { BudgetTracker } from '@/components/shop/budget-tracker';
import { AiBargainBuddy } from '@/components/shop/ai-bargain-buddy';
import { Product } from '@/lib/types';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ShopPage() {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    let results = products;
    if (selectedCategory !== 'all') {
      results = results.filter((product) => product.category === selectedCategory);
    }
    setFilteredProducts(results);
  }, [selectedCategory]);

  useEffect(() => {
    setFilteredProducts(products);
  }, []);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ShopHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-1 space-y-8">
              <SmartProductSearch onCategoryChange={setSelectedCategory} />
              <BudgetTracker />
            </div>
            <div className="md:col-span-2">
              <AiBargainBuddy />
            </div>
          </div>

          <section>
            <h2 className="mb-6 text-2xl font-bold tracking-tight">
              {selectedCategory !== 'all' ? `Results for ${selectedCategory}` : 'Featured Products'}
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <footer className="border-t bg-card">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">&copy; 2024 ValueCart. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
