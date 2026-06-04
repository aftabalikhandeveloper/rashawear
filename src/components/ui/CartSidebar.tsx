'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalItems, loading } = useCart();

  if (!isCartOpen) return null;

  const items = cart?.contents?.nodes || [];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingBag size={20} />
            Shopping Bag
            <span className="text-sm font-normal text-gray-400">({totalItems})</span>
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-gray-400" />
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Your bag is empty</p>
              <p className="text-sm text-gray-400 mb-6">Looks like you haven&apos;t added anything yet.</p>
              <button onClick={() => setIsCartOpen(false)} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const imgSrc = item.variation?.node?.image?.sourceUrl || item.product.node.image?.sourceUrl;
                const varAttrs = item.variation?.node?.attributes?.nodes;
                return (
                  <div key={item.key} className="flex gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={item.product.node.name} fill className="object-cover" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><ShoppingBag size={24} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.node.name}</h3>
                      {varAttrs && varAttrs.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {varAttrs.map(a => `${a.label || a.name.replace('pa_', '')}: ${a.value}`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-semibold mt-1">{formatPrice(item.total)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-full bg-white">
                          <button onClick={() => updateQuantity(item.key, Math.max(0, item.quantity - 1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <Plus size={14} />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.key)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{formatPrice(cart?.subtotal)}</span>
            </div>
            {cart?.shippingTotal && cart.shippingTotal !== '₨\u00a00' && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-semibold">{formatPrice(cart.shippingTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold">{formatPrice(cart?.total)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping and taxes calculated at checkout.</p>
            <Link
              href="/cart"
              onClick={() => setIsCartOpen(false)}
              className="block w-full text-center py-3 bg-gray-100 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              View Bag
            </Link>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full text-center py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
