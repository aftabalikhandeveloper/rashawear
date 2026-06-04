'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, ArrowUpRight } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

interface FeaturedProductsProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

/**
 * Ciseco-style CollectionCard2 — "Chosen by experts" section
 * Layout: Large hero image (object-contain, gray bg) → 3-col thumbnail grid → info row
 */
function LargeProductCard({ product }: { product: Product }) {
  const allImages = [
    product.image,
    ...(product.galleryImages?.nodes || []),
  ].filter(img => img?.sourceUrl);

  const thumbnails = allImages.slice(1, 4); // up to 3 thumbnails

  const categoryName = product.productCategories?.nodes?.[0]?.name || '';

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
    >
      <div className="relative flex flex-col">
        {/* Main large image — aspect 8:5, object-contain on neutral bg */}
        <div className="relative bg-neutral-100 rounded-2xl overflow-hidden" style={{ aspectRatio: '8/5' }}>
          {allImages[0]?.sourceUrl && (
            <Image
              src={allImages[0].sourceUrl}
              alt={product.name}
              fill
              className="object-contain w-full h-full p-4 sm:p-6 group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
        </div>

        {/* 3-col thumbnail grid */}
        {thumbnails.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 mt-2.5">
            {thumbnails.map((img, i) => (
              <div
                key={i}
                className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden bg-neutral-100"
              >
                <Image
                  src={img.sourceUrl}
                  alt=""
                  fill
                  className="object-cover w-full h-full"
                  sizes="150px"
                />
              </div>
            ))}
            {/* Fill empty slots if < 3 thumbnails */}
            {Array.from({ length: Math.max(0, 3 - thumbnails.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="relative w-full h-24 sm:h-28 rounded-2xl bg-neutral-100"
              />
            ))}
          </div>
        )}
      </div>

      {/* Info row: name + desc/rating on left, price on right */}
      <div className="relative mt-5 flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg sm:text-xl text-gray-900 group-hover:text-black transition-colors truncate">
            {product.name}
          </h3>
          <div className="mt-2 flex items-center text-slate-500 text-sm">
            <span className="truncate">{categoryName}</span>
            <span className="h-5 mx-1.5 sm:mx-2 border-l border-slate-200" />
            <Star size={14} className="text-orange-400 flex-shrink-0" fill="currentColor" />
            <span className="ml-1 truncate">4.9 (reviews)</span>
          </div>
        </div>
        <span className={cn(
          'flex-shrink-0 ml-4 mt-0.5 sm:mt-1 text-sm font-semibold px-3 py-1.5 rounded-lg border',
          product.salePrice && product.salePrice !== product.regularPrice
            ? 'text-red-600 border-red-200 bg-red-50'
            : 'text-emerald-700 border-emerald-200 bg-emerald-50'
        )}>
          {formatPrice(product.price)}
        </span>
      </div>
    </Link>
  );
}

export default function FeaturedProducts({ title, subtitle, products }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector(':scope > *')?.clientWidth || 400;
    el.scrollBy({ left: dir === 'left' ? -cardWidth - 32 : cardWidth + 32, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with arrows on right */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {title.split('.')[0]}.{' '}
              {subtitle && <span className="font-normal text-gray-400">{subtitle}</span>}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={cn(
                'w-10 h-10 rounded-full border flex items-center justify-center transition-all',
                canScrollLeft
                  ? 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-300 cursor-default'
              )}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={cn(
                'w-10 h-10 rounded-full border flex items-center justify-center transition-all',
                canScrollRight
                  ? 'border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50'
                  : 'border-gray-200 text-gray-300 cursor-default'
              )}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Horizontal scrolling slider — 3 per view desktop, 1.5 on tablet, 1 on mobile */}
        <div
          ref={scrollRef}
          className="flex gap-6 sm:gap-8 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[85vw] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] snap-start"
            >
              <LargeProductCard product={product} />
            </div>
          ))}

          {/* "More items / Show me more" card */}
          <div className="flex-shrink-0 w-[85vw] sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] snap-start">
            <Link href="/collections/all" className="block relative group h-full">
              <div className="relative rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center" style={{ aspectRatio: '8/5' }}>
                <div className="flex flex-col items-center justify-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-semibold text-gray-700">More items</span>
                    <ArrowUpRight size={20} className="text-gray-500 rotate-45 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-sm text-gray-500 mt-1">Show me more</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
