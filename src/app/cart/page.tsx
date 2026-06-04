'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Minus, Plus, Trash2, ArrowLeft, Truck, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, totalItems, loading, clearCart } = useCart();
  const items = cart?.contents?.nodes || [];

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your bag is empty</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Looks like you haven&apos;t added anything to your bag yet. Start shopping to fill it up!
        </p>
        <Link
          href="/collections/all"
          className="px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-300"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in relative">
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Bag</h1>
            <p className="text-gray-500 mt-1">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 transition-colors">Clear all</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const imgSrc = item.variation?.node?.image?.sourceUrl || item.product.node.image?.sourceUrl;
              const varAttrs = item.variation?.node?.attributes?.nodes;
              return (
                <div key={item.key} className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-2xl">
                  <Link href={`/products/${item.product.node.slug}`} className="relative w-24 h-28 sm:w-32 sm:h-36 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {imgSrc ? (
                      <Image src={imgSrc} alt={item.product.node.name} fill className="object-cover" sizes="128px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><ShoppingBag size={24} /></div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/products/${item.product.node.slug}`} className="font-medium text-gray-900 hover:text-black transition-colors line-clamp-2">
                          {item.product.node.name}
                        </Link>
                        {varAttrs && varAttrs.length > 0 && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            {varAttrs.map(a => `${a.label || a.name.replace('pa_', '')}: ${a.value}`).join(' · ')}
                          </p>
                        )}
                      </div>
                      <button onClick={() => removeItem(item.key)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-all flex-shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-gray-200 rounded-full bg-white">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Minus size={14} /></button>
                        <span className="px-3 text-sm font-medium min-w-[32px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors"><Plus size={14} /></button>
                      </div>
                      <span className="text-base font-semibold">{formatPrice(item.total)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link href="/collections/all" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mt-4">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-gray-50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium text-emerald-600">{formatPrice(cart.shippingTotal) || 'Free'}</span>
                </div>
                {cart.totalTax && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="font-medium">{formatPrice(cart.totalTax)}</span>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-xl font-bold">{formatPrice(cart.total)}</span>
                </div>
              </div>
              <Link href="/checkout" className="block w-full text-center py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-300 mb-3">
                Proceed to Checkout
              </Link>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <Truck size={14} /><span>Free shipping on qualifying orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
