import { getProducts, getProductsByCategory, getProductCategories } from '@/lib/graphql';
import CollectionPageClient from './CollectionPageClient';

// Force dynamic rendering — no static generation for collections
export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const isAll = params.slug === 'all';
  const title = isAll
    ? 'All Products'
    : params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${title} - Rashawear`,
  };
}

export default async function CollectionPage({ params }: { params: { slug: string } }) {
  const isAll = params.slug === 'all';

  const [products, categories] = await Promise.all([
    isAll ? getProducts(50) : getProductsByCategory(params.slug, 50),
    getProductCategories(),
  ]);

  return (
    <CollectionPageClient
      products={products}
      categories={categories}
      currentSlug={params.slug}
    />
  );
}
