import { getProductBySlug, getProducts } from '@/lib/graphql';
import { notFound } from 'next/navigation';
import ProductPageClient from './ProductPageClient';

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await getProducts(50);
    return products.map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };
  return {
    title: `${product.name} - Rashawear`,
    description: product.shortDescription?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductPageClient product={product} />;
}
