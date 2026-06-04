'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Grid3X3, LayoutGrid, X } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { Product, ProductCategory } from '@/lib/types';
import { cn, getPriceNumber } from '@/lib/utils';

interface Props {
  products: Product[];
  categories: ProductCategory[];
  currentSlug: string;
}

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

export default function CollectionPageClient({ products, categories, currentSlug }: Props) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [gridCols, setGridCols] = useState<3 | 4>(4);
  const [showFilters, setShowFilters] = useState(false);

  const isAll = currentSlug === 'all';
  const pageTitle = isAll
    ? 'All Products'
    : currentSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Filter categories for sidebar
  const mainCategories = categories.filter(c =>
    c.count && c.count > 0 && c.slug !== 'uncategorized'
  );

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => getPriceNumber(a.price) - getPriceNumber(b.price));
      case 'price-high':
        return sorted.sort((a, b) => getPriceNumber(b.price) - getPriceNumber(a.price));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [products, sortBy]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-900">{pageTitle}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-500 mt-2">{sortedProducts.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-28">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-1">
                <Link
                  href="/collections/all"
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm transition-colors',
                    isAll ? 'bg-black text-white font-medium' : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  All Products
                </Link>
                {mainCategories.map(cat => (
                  <Link
                    key={cat.slug}
                    href={`/collections/${cat.slug}`}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-sm transition-colors',
                      currentSlug === cat.slug
                        ? 'bg-black text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {cat.name}
                    <span className="text-xs ml-1 opacity-60">({cat.count})</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-full hover:border-gray-300 transition-colors"
                >
                  <SlidersHorizontal size={14} />
                  Filters
                </button>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-sm bg-transparent border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Grid Toggle */}
              <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-full p-1">
                <button
                  onClick={() => setGridCols(3)}
                  className={cn(
                    'p-1.5 rounded-full transition-colors',
                    gridCols === 3 ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <Grid3X3 size={14} />
                </button>
                <button
                  onClick={() => setGridCols(4)}
                  className={cn(
                    'p-1.5 rounded-full transition-colors',
                    gridCols === 4 ? 'bg-black text-white' : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  <LayoutGrid size={14} />
                </button>
              </div>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden mb-6 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Categories</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/collections/all"
                    className={cn(
                      'px-3 py-1.5 text-xs rounded-full transition-colors',
                      isAll ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-600'
                    )}
                  >
                    All
                  </Link>
                  {mainCategories.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`/collections/${cat.slug}`}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full transition-colors',
                        currentSlug === cat.slug
                          ? 'bg-black text-white'
                          : 'bg-white border border-gray-200 text-gray-600'
                      )}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Product Grid */}
            {sortedProducts.length > 0 ? (
              <div className={cn(
                'grid gap-4 sm:gap-6',
                gridCols === 3
                  ? 'grid-cols-2 md:grid-cols-3'
                  : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
              )}>
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">No products found in this category.</p>
                <Link
                  href="/collections/all"
                  className="inline-flex items-center text-sm font-medium text-black hover:underline"
                >
                  Browse all products →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
