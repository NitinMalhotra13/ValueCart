
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, ArrowLeft } from 'lucide-react';
import { formatIndianCurrency } from '@/lib/utils';
import { useSharedCart } from '@/hooks/use-shared-cart';
import { ShopHeader } from '@/components/shop/header';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Product } from '@/lib/types';

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useSharedCart();

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <ShopHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to shop
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="relative h-96 overflow-hidden rounded-lg md:h-[500px]">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                data-ai-hint={product.imageHint}
              />
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-1 text-sm font-medium text-primary">{product.category}</p>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-primary">{formatIndianCurrency(product.price)}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.round(product.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-muted-foreground/50 text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.rating} / 5.0)</span>
                </div>
              </div>
              <div>
                <h2 className="mb-2 text-lg font-semibold">Description</h2>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
               <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{product.specifications}</p>
                </CardContent>
              </Card>
              <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
