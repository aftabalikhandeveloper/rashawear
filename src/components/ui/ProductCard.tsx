'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Eye, Heart, Star, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'featured';
}

export default function ProductCard({ product, className, variant = 'default' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const hasSale = product.salePrice && product.salePrice !== product.regularPrice;
  const secondImage = product.galleryImages?.nodes?.[0]?.sourceUrl;
  const isNew = true; // Could be determined by date or tag from WP

  // Get variation attributes (color swatches)
  const colorAttr = product.attributes?.nodes?.find(
    a => a.name === 'pa_color' && a.variation
  );
  const sizeAttr = product.attributes?.nodes?.find(
    a => a.name === 'pa_size' && a.variation
  );

  const COLOR_MAP: Record<string, string> = {
    black: '#000000', white: '#FFFFFF', blue: '#3B82F6', red: '#EF4444',
    green: '#22C55E', yellow: '#EAB308', pink: '#EC4899', brown: '#92400E',
    beige: '#D2B48C', cream: '#FFFDD0', navy: '#1E3A5F', grey: '#6B7280',
    gray: '#6B7280', orange: '#F97316', purple: '#8B5CF6', camel: '#C19A6B',
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    // For variable products, pick the first variation
    const firstVariation = product.variations?.nodes?.[0];
    await addToCart(product.databaseId, 1, firstVariation?.databaseId);
    setAdding(false);
  };

  // ────── FEATURED CARD VARIANT (Screenshot 3 style) ──────
  if (variant === 'featured') {
    const allImages = [
      product.image,
      ...(product.galleryImages?.nodes || []),
    ].filter(img => img?.sourceUrl);

    return (
      <div className={cn('group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-500', className)}>
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {allImages[0]?.sourceUrl && (
            <Image
              src={allImages[0].sourceUrl}
              alt={product.name}
              fill
              className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        {/* Thumbnail strip */}
        {allImages.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto">
            {allImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                <Image src={img.sourceUrl} alt="" fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="p-5 pt-3">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-black transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {product.productCategories?.nodes?.[0]?.name}
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Star size={12} className="text-amber-400" fill="currentColor" />
                <span>4.8</span>
              </div>
            </div>
            <span className={cn(
              'text-sm font-bold px-3 py-1 rounded-lg border',
              hasSale ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'
            )}>
              {formatPrice(product.price)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ────── DEFAULT CARD (Screenshot 2 style — Ciseco classic) ──────
  return (
    <div
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
        {product.image?.sourceUrl && (
          <>
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              fill
              className={cn(
                'object-cover transition-all duration-700',
                isHovered && secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {secondImage && (
              <Image
                src={secondImage}
                alt={product.name}
                fill
                className={cn(
                  'object-cover transition-all duration-700',
                  isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {hasSale && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-sm text-red-600 rounded-full shadow-sm">
              <Sparkles size={10} />
              Sale
            </span>
          )}
          {isNew && !hasSale && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-white/90 backdrop-blur-sm text-gray-800 rounded-full shadow-sm">
              <Sparkles size={10} />
              New in
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWished(!isWished);
          }}
          className={cn(
            'absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm',
            isWished ? 'bg-red-500 text-white scale-110' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white'
          )}
        >
          <Heart size={15} fill={isWished ? 'currentColor' : 'none'} />
        </button>

        {/* Quick Actions (on hover) */}
        <div className={cn(
          'absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300',
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-60"
          >
            <ShoppingBag size={14} />
            {adding ? 'Adding...' : 'Add to bag'}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <Eye size={14} />
          </Link>
        </div>
      </Link>

      {/* Color Swatches */}
      {colorAttr && colorAttr.options.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 px-1">
          {colorAttr.options.slice(0, 5).map(color => (
            <span
              key={color}
              title={color}
              className="w-4 h-4 rounded-full border border-gray-200 transition-transform hover:scale-125 cursor-pointer"
              style={{ backgroundColor: COLOR_MAP[color.toLowerCase()] || '#ccc' }}
            />
          ))}
          {colorAttr.options.length > 5 && (
            <span className="text-[10px] text-gray-400 ml-0.5">+{colorAttr.options.length - 5}</span>
          )}
        </div>
      )}

      {/* Product Info */}
      <div className="mt-2 px-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-black transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.productCategories?.nodes?.[0] && (
          <p className="text-xs text-gray-400 mt-0.5">
            {product.productCategories.nodes[0].name}
          </p>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-sm font-bold px-2.5 py-0.5 rounded-lg border',
              hasSale ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'
            )}>
              {formatPrice(product.price)}
            </span>
            {hasSale && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star size={11} className="text-amber-400" fill="currentColor" />
            <span>4.8</span>
          </div>
        </div>
        {/* Size pills for variable products */}
        {sizeAttr && sizeAttr.options.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {sizeAttr.options.map(size => (
              <span key={size} className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded uppercase">
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
