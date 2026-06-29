
import { products } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import ProductDetailClient from './product-detail-client';

// In Next.js 15, params is a Promise
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  // We pass the product data to the Client Component
  return <ProductDetailClient product={product} />;
}

// Generate static params for static export
export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

