'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Heart, Truck, Shield, RotateCcw, Minus, Plus, Star, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import { formatPrice, stripHtml, cn } from '@/lib/utils';
import ProductCard from '@/components/ui/ProductCard';

const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', blue: '#3B82F6', red: '#EF4444',
  green: '#22C55E', yellow: '#EAB308', pink: '#EC4899', brown: '#92400E',
  beige: '#D2B48C', cream: '#FFFDD0', navy: '#1E3A5F', grey: '#6B7280',
  gray: '#6B7280', orange: '#F97316', purple: '#8B5CF6', camel: '#C19A6B',
};

interface Props {
  product: Product;
}

export default function ProductPageClient({ product }: Props) {
  const { addToCart, loading: cartLoading } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    // Initialize with default attributes from WP
    const defaults: Record<string, string> = {};
    product.defaultAttributes?.nodes?.forEach(da => {
      const key = da.name.replace('pa_', '');
      defaults[key] = da.value;
    });
    return defaults;
  });
  const [isWished, setIsWished] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // All images
  const allImages = [
    product.image,
    ...(product.galleryImages?.nodes || []),
  ].filter(img => img?.sourceUrl);

  // Get variation attributes from product-level attributes
  const variationAttributes = useMemo(() => {
    return (product.attributes?.nodes || []).filter(a => a.variation);
  }, [product.attributes]);

  // Non-variation attributes (display only)
  const displayAttributes = useMemo(() => {
    return (product.attributes?.nodes || []).filter(a => !a.variation);
  }, [product.attributes]);

  // Find matching variation based on selected attributes
  const selectedVariation = useMemo(() => {
    if (!product.variations?.nodes?.length) return null;

    return product.variations.nodes.find(v => {
      return v.attributes.nodes.every(va => {
        const key = va.name.replace('pa_', '');
        return selectedAttributes[key] === va.value;
      });
    });
  }, [product.variations, selectedAttributes]);

  // Update image when variation changes
  const variationImage = selectedVariation?.image?.sourceUrl;

  const handleAddToCart = async () => {
    setAddedToCart(false);

    // For variable products, we need a matching variation
    if (product.variations?.nodes?.length && !selectedVariation) {
      alert('Please select all options');
      return;
    }

    await addToCart(
      product.databaseId,
      quantity,
      selectedVariation?.databaseId
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const currentPrice = selectedVariation?.price || product.price;
  const currentRegularPrice = selectedVariation?.regularPrice || product.regularPrice;
  const currentSalePrice = selectedVariation?.salePrice || product.salePrice;
  const hasSale = currentSalePrice && currentSalePrice !== currentRegularPrice;

  const descriptionText = product.description ? stripHtml(product.description) : '';
  const shortDescText = product.shortDescription ? stripHtml(product.shortDescription) : '';
  const relatedProducts = product.related?.nodes || [];

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collections/all" className="hover:text-gray-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              {(variationImage || allImages[selectedImage]?.sourceUrl) && (
                <Image
                  src={variationImage || allImages[selectedImage]?.sourceUrl || ''}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-300"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}
              {hasSale && (
                <span className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-full">SALE</span>
              )}
              {product.stockStatus === 'OUT_OF_STOCK' && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-full">Out of Stock</span>
                </div>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                      selectedImage === i ? 'border-black' : 'border-transparent hover:border-gray-300'
                    )}
                  >
                    {img?.sourceUrl && <Image src={img.sourceUrl} alt="" fill className="object-cover" sizes="80px" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:py-4">
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.productCategories.nodes.map(cat => (
                <Link key={cat.slug} href={`/collections/${cat.slug}`} className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                  {cat.name}
                </Link>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <span className="text-sm text-gray-500">4.8 (reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className={cn(
                'text-2xl sm:text-3xl font-bold px-4 py-1 rounded-xl border',
                hasSale ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'
              )}>
                {formatPrice(currentPrice)}
              </span>
              {hasSale && (
                <span className="text-lg text-gray-400 line-through">{formatPrice(currentRegularPrice)}</span>
              )}
            </div>

            {/* Description */}
            {(shortDescText || descriptionText) && (
              <p className="text-gray-600 leading-relaxed mb-8">{shortDescText || descriptionText.slice(0, 300)}</p>
            )}

            {/* Display-only attributes (like Brand) */}
            {displayAttributes.length > 0 && (
              <div className="mb-6 space-y-2">
                {displayAttributes.map(attr => (
                  <div key={attr.name} className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-gray-700">{attr.label}:</span>
                    <span className="text-gray-500">{attr.options.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Variation Attribute Selectors */}
            {variationAttributes.map(attr => {
              const key = attr.name.replace('pa_', '');
              const isColor = key === 'color';

              return (
                <div key={attr.name} className="mb-6">
                  <label className="text-sm font-medium text-gray-900 mb-3 block">
                    {attr.label}: <span className="text-gray-500 capitalize">{selectedAttributes[key] || 'Select'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {attr.options.map(value => {
                      const isSelected = selectedAttributes[key] === value;
                      if (isColor) {
                        const bgColor = COLOR_MAP[value.toLowerCase()] || '#ccc';
                        return (
                          <button
                            key={value}
                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [key]: value }))}
                            title={value}
                            className={cn(
                              'w-10 h-10 rounded-full border-2 transition-all relative',
                              isSelected ? 'border-black scale-110 shadow-md' : 'border-gray-200 hover:border-gray-400'
                            )}
                            style={{ backgroundColor: bgColor }}
                          >
                            {isSelected && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className={cn('w-2 h-2 rounded-full', bgColor === '#FFFFFF' || bgColor === '#FFFDD0' ? 'bg-black' : 'bg-white')} />
                              </span>
                            )}
                          </button>
                        );
                      }

                      return (
                        <button
                          key={value}
                          onClick={() => setSelectedAttributes(prev => ({ ...prev, [key]: value }))}
                          className={cn(
                            'px-5 py-2.5 text-sm font-medium rounded-full border-2 transition-all capitalize',
                            isSelected ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400 text-gray-700'
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Stock Status */}
            {selectedVariation && (
              <div className="mb-4">
                <span className={cn(
                  'text-xs font-medium px-3 py-1 rounded-full',
                  selectedVariation.stockStatus === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                )}>
                  {selectedVariation.stockStatus === 'IN_STOCK' ? '✓ In Stock' : '✕ Out of Stock'}
                </span>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-full">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 rounded-full transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 text-sm font-semibold min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 rounded-full transition-colors">
                  <Plus size={16} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading || product.stockStatus === 'OUT_OF_STOCK'}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium rounded-full transition-all duration-300',
                  addedToCart
                    ? 'bg-emerald-500 text-white'
                    : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl hover:shadow-black/10 disabled:opacity-50'
                )}
              >
                {cartLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Adding...</>
                ) : addedToCart ? (
                  '✓ Added to Bag!'
                ) : (
                  <><ShoppingBag size={18} /> Add to Bag</>
                )}
              </button>

              <button
                onClick={() => setIsWished(!isWished)}
                className={cn(
                  'w-12 h-12 rounded-full border flex items-center justify-center transition-all',
                  isWished ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:border-gray-400'
                )}
              >
                <Heart size={18} fill={isWished ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="border-t border-gray-100 pt-6 space-y-3">
              {[
                { icon: Truck, text: 'Free shipping on qualifying orders' },
                { icon: Shield, text: 'Secure checkout with SSL encryption' },
                { icon: RotateCcw, text: '30-day return & exchange policy' },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-500">
                  <Icon size={16} className="text-gray-400 flex-shrink-0" />{text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="mt-16 pt-16 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Product Details</h2>
            <div className="prose prose-sm max-w-3xl text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-16 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
