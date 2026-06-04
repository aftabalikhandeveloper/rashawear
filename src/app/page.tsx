import { getProducts, getProductCategories } from '@/lib/graphql';
import HeroSection from '@/components/sections/HeroSection';
import DiscoverSection from '@/components/sections/DiscoverSection';
import ProductGrid from '@/components/sections/ProductGrid';
import HowItWorks from '@/components/sections/HowItWorks';
import PromoSection from '@/components/sections/PromoSection';
import CategoryExplorer from '@/components/sections/CategoryExplorer';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import NewsletterSection from '@/components/sections/NewsletterSection';

export const revalidate = 60;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(20),
    getProductCategories(),
  ]);

  const newArrivals = products.slice(0, 5);
  const bestSellers = products.slice(3, 8);
  const featured = products.slice(0, 4);

  return (
    <>
      <HeroSection />
      <DiscoverSection />
      <ProductGrid
        title="New Arrivals."
        subtitle="Fresh styles just dropped"
        products={newArrivals}
        viewAllHref="/collections/all"
        columns={5}
      />
      <HowItWorks />
      <PromoSection />
      <CategoryExplorer categories={categories} />
      <ProductGrid
        title="Best Sellers."
        subtitle="Best selling of the month"
        products={bestSellers}
        viewAllHref="/collections/all"
        columns={5}
      />
      <FeaturedProducts
        title="Chosen by experts."
        subtitle="Featured of the week"
        products={featured}
      />
      <NewsletterSection />
    </>
  );
}
