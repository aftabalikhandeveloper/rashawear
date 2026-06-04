'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Package, Truck, MapPin, Phone, Mail, ArrowRight, Download, Search, Loader2 } from 'lucide-react';
import { WooOrder } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<WooOrder | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('last_order');
    if (saved) {
      try { setOrder(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!order) return;
    setGenerating(true);
    try {
      const { generateOrderPDF } = await import('@/lib/generateOrderPDF');
      generateOrderPDF(order);
    } catch (e) {
      console.error('PDF generation failed', e);
      alert('Failed to generate PDF. Please try again.');
    }
    setGenerating(false);
  };

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <Package size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No order found</h1>
        <p className="text-gray-500 mb-6">It seems you haven&apos;t placed an order recently.</p>
        <Link href="/collections/all" className="px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_ease-in-out]">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">Thank you for your purchase. Your order has been received.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all disabled:opacity-60"
          >
            {generating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : (
              <><Download size={16} /> Download Invoice (PDF)</>
            )}
          </button>
          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
          >
            <Search size={16} /> Track Order
          </Link>
        </div>

        {/* Order Info Card */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Order Number</p>
              <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full capitalize">
                {(order.status || 'processing').replace(/_/g, ' ')}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Payment</p>
              <p className="text-sm font-medium text-gray-900">{order.paymentMethodTitle || 'COD'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Total</p>
              <p className="text-sm font-bold text-emerald-600">{formatPrice(order.total)}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package size={18} /> Order Items
          </h2>
          <div className="space-y-3">
            {order.lineItems?.nodes?.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {item.product?.node?.image?.sourceUrl && (
                    <Image src={item.product.node.image.sourceUrl} alt={item.product.node.name} fill className="object-cover" sizes="64px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.product?.node?.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>{formatPrice(order.shippingTotal) || 'Free'}</span>
            </div>
            {order.totalTax && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>{formatPrice(order.totalTax)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span className="text-emerald-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Details */}
        {order.billing && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck size={18} /> Delivery Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900 flex items-center gap-2"><MapPin size={14} /> Shipping Address</p>
                <p>{order.billing.firstName} {order.billing.lastName}</p>
                <p>{order.billing.address1}</p>
                <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
                <p>{order.billing.country}</p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="font-medium text-gray-900">Contact</p>
                <p className="flex items-center gap-2"><Mail size={14} /> {order.billing.email}</p>
                <p className="flex items-center gap-2"><Phone size={14} /> {order.billing.phone}</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/collections/all"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all group"
            >
              Continue Shopping
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/track-order"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-gray-200 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
            >
              <Search size={16} /> Track Another Order
            </Link>
          </div>
          <p className="text-xs text-gray-400">
            A confirmation email has been sent to {order.billing?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
