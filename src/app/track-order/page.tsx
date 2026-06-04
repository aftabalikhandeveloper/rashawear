'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Package, Loader2, CheckCircle2, Clock, Truck, Star, Phone, Download, AlertCircle, ShoppingBag, XCircle, RotateCcw } from 'lucide-react';
import { WooOrder } from '@/lib/types';
import { formatPrice, cn } from '@/lib/utils';

interface OrderHistoryItem {
  orderNumber: string;
  databaseId: number;
  email: string;
  date: string;
  status: string;
  total: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string; step: number }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending Payment', step: 1 },
  processing: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Processing', step: 2 },
  'on-hold': { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'On Hold', step: 1 },
  completed: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Completed', step: 4 },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled', step: 0 },
  refunded: { icon: RotateCcw, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Refunded', step: 0 },
  failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Failed', step: 0 },
};

const TRACKING_STEPS = [
  { label: 'Order Placed', icon: ShoppingBag },
  { label: 'Confirmed', icon: CheckCircle2 },
  { label: 'Processing', icon: Package },
  { label: 'Shipped', icon: Truck },
  { label: 'Delivered', icon: Star },
];

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<WooOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    const history = localStorage.getItem('order_history');
    if (history) {
      try { setOrderHistory(JSON.parse(history)); } catch { /* ignore */ }
    }
  }, []);

  const handleTrack = async (trackNumber?: string, trackEmail?: string) => {
    const num = trackNumber || orderNumber;
    const em = trackEmail || email;
    if (!num || !em) {
      setError('Please enter both order number and email address.');
      return;
    }
    setError('');
    setLoading(true);
    setOrder(null);

    try {
      const res = await fetch('/api/track-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: num, email: em }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.order) {
        setOrder(data.order);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    try {
      const { generateOrderPDF } = await import('@/lib/generateOrderPDF');
      generateOrderPDF(order);
    } catch (e) {
      console.error('PDF generation failed', e);
    }
  };

  const statusKey = (order?.status || 'processing').replace('_', '-').toLowerCase();
  const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.processing;
  const activeStep = statusInfo.step;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6">
            <Search size={28} className="text-gray-700" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-500 mb-8">Enter your order number and billing email to check your order status.</p>

          {/* Search Form */}
          <div className="max-w-md mx-auto space-y-3">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Order number (e.g. 152)"
              className="w-full px-5 py-3.5 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:shadow-lg transition-all text-center"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Billing email address"
              className="w-full px-5 py-3.5 bg-white rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-400 focus:shadow-lg transition-all text-center"
            />
            <button
              onClick={() => handleTrack()}
              disabled={loading}
              className="w-full py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={16} /> Track Order</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Order Result */}
        {order && (
          <div className="space-y-6">
            {/* Status Badge + Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', statusInfo.bg)}>
                    <statusInfo.icon size={22} className={statusInfo.color} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Order #{order.orderNumber}</h2>
                    <p className={cn('text-sm font-medium', statusInfo.color)}>{statusInfo.label}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>

              {/* Progress Tracker */}
              {activeStep > 0 && (
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    {TRACKING_STEPS.map((step, i) => {
                      const isActive = i < activeStep;
                      const isCurrent = i === activeStep - 1;
                      const StepIcon = step.icon;
                      return (
                        <div key={i} className="flex flex-col items-center relative z-10">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                            isCurrent ? 'bg-black text-white scale-110 shadow-lg' :
                            isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'
                          )}>
                            {isActive && !isCurrent ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                          </div>
                          <span className={cn(
                            'text-[10px] sm:text-xs mt-2 font-medium text-center leading-tight',
                            isActive ? 'text-gray-900' : 'text-gray-400'
                          )}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress line */}
                  <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-100 -z-0">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, ((activeStep - 1) / (TRACKING_STEPS.length - 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                <p className="text-xs text-gray-400 mb-2 font-medium">ORDER INFO</p>
                <p><span className="text-gray-500">Date:</span> {order.date ? new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                <p><span className="text-gray-500">Payment:</span> {order.paymentMethodTitle || 'COD'}</p>
                <p><span className="text-gray-500">Total:</span> <span className="font-bold text-emerald-600">{formatPrice(order.total)}</span></p>
              </div>
              {order.billing && (
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                  <p className="text-xs text-gray-400 mb-2 font-medium">SHIPPING TO</p>
                  <p className="font-medium">{order.billing.firstName} {order.billing.lastName}</p>
                  <p>{order.billing.address1}</p>
                  <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
                  <p className="flex items-center gap-1"><Phone size={12} /> {order.billing.phone}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {order.lineItems?.nodes?.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.product?.node?.image?.sourceUrl && (
                        <Image src={item.product.node.image.sourceUrl} alt={item.product.node.name} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product?.node?.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Order History (from localStorage) */}
        {!order && !loading && orderHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Recent Orders</h2>
            <div className="space-y-3">
              {orderHistory.map((hist, i) => {
                const histStatus = STATUS_CONFIG[(hist.status || 'processing').replace('_', '-').toLowerCase()] || STATUS_CONFIG.processing;
                const HistIcon = histStatus.icon;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setOrderNumber(String(hist.databaseId || hist.orderNumber));
                      setEmail(hist.email);
                      handleTrack(String(hist.databaseId || hist.orderNumber), hist.email);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', histStatus.bg)}>
                      <HistIcon size={18} className={histStatus.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Order #{hist.orderNumber || hist.databaseId}</p>
                      <p className="text-xs text-gray-400">
                        {hist.date ? new Date(hist.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} · {hist.email}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatPrice(hist.total)}</p>
                      <p className={cn('text-xs font-medium capitalize', histStatus.color)}>
                        {histStatus.label}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state when no order and no history */}
        {!order && !loading && !error && orderHistory.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Package size={32} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Enter your order number above to check status</p>
          </div>
        )}
      </div>
    </div>
  );
}
