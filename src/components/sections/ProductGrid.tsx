'use client';

import React from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';
import Link from 'next/link';

interface ProductGridProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  columns?: 2 | 3 | 4 | 5;
}

export default function ProductGrid({ title, subtitle, products, viewAllHref, columns = 4 }: ProductGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors group"
            >
              View all
              <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )}
        </div>

        {/* Product Grid */}
        <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6 lg:gap-8`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {viewAllHref && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              href={viewAllHref}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
            >
              View all →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
