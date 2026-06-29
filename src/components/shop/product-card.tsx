
'use client';

import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { type Product } from '@/lib/types';
import { cn, formatIndianCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useSharedCart } from '@/hooks/use-shared-cart';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useSharedCart();

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault(); // prevent link navigation when clicking button
    addToCart(product);
  };

  return (
    <Link href={`/products/${product.id}`} className="group">
      <Card className={cn('flex flex-col overflow-hidden rounded-lg shadow-sm h-full', className)}>
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              data-ai-hint={product.imageHint}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <CardTitle className="mb-1 text-base font-semibold">{product.name}</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-primary">{formatIndianCurrency(product.price)}</p>
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{product.rating}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button onClick={handleAddToCart} className="w-full" size="sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
