'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Truck, Shield, ChevronLeft, Loader2, MapPin, CreditCard, Phone, Mail, User, Home, Building2, FileText } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice, cn } from '@/lib/utils';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  customerNote: string;
  shipToDifferent: boolean;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingState: string;
  shippingPostcode: string;
  shippingCountry: string;
}

const INITIAL_FORM: FormData = {
  firstName: '', lastName: '', email: '', phone: '',
  address1: '', address2: '', city: '', state: '', postcode: '', country: 'PK',
  customerNote: '', shipToDifferent: false,
  shippingFirstName: '', shippingLastName: '', shippingAddress1: '', shippingAddress2: '',
  shippingCity: '', shippingState: '', shippingPostcode: '', shippingCountry: 'PK',
};

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  const items = cart?.contents?.nodes || [];

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    const required: (keyof FormData)[] = ['firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'postcode'];
    for (const f of required) {
      if (!form[f]) {
        setError(`Please fill in ${f.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    const session = typeof window !== 'undefined' ? localStorage.getItem('woo_session_token') : null;
    if (!session) { setError('No cart session found. Please add items to cart.'); setSubmitting(false); return; }

    try {
      const billing = {
        firstName: form.firstName, lastName: form.lastName, address1: form.address1,
        address2: form.address2, city: form.city, state: form.state, postcode: form.postcode,
        country: form.country, email: form.email, phone: form.phone,
      };

      const shipping = form.shipToDifferent ? {
        firstName: form.shippingFirstName || form.firstName,
        lastName: form.shippingLastName || form.lastName,
        address1: form.shippingAddress1, address2: form.shippingAddress2,
        city: form.shippingCity, state: form.shippingState,
        postcode: form.shippingPostcode, country: form.shippingCountry || 'PK',
      } : undefined;

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-woo-session': session },
        body: JSON.stringify({ billing, shipping, paymentMethod, customerNote: form.customerNote }),
      });

      const data = await res.json();

      if (data.error) { setError(data.error); setSubmitting(false); return; }

      if (data.order) {
        // Save order for confirmation page
        localStorage.setItem('last_order', JSON.stringify(data.order));

        // Save to order history for tracking
        const history = JSON.parse(localStorage.getItem('order_history') || '[]');
        history.unshift({
          orderNumber: data.order.orderNumber,
          databaseId: data.order.databaseId,
          email: form.email,
          date: data.order.date || new Date().toISOString(),
          status: data.order.status,
          total: data.order.total,
        });
        localStorage.setItem('order_history', JSON.stringify(history.slice(0, 20)));

        // Clear the WooCommerce session & local cart
        localStorage.removeItem('woo_session_token');
        await clearCart();

        router.push('/order-confirmation');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
        <ShoppingBag size={48} className="text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-gray-500 mb-6">Add some items before checking out.</p>
        <Link href="/collections/all" className="px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  const InputField = ({ icon: Icon, label, field, type = 'text', required = true, placeholder, half = false }: {
    icon: React.ElementType; label: string; field: keyof FormData; type?: string; required?: boolean; placeholder?: string; half?: boolean;
  }) => (
    <div className={half ? 'col-span-1' : 'col-span-2'}>
      <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
        <Icon size={12} /> {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={form[field] as string}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:bg-white transition-all"
        required={required}
      />
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
            <Link href="/" className="hover:text-gray-600">Home</Link><span>/</span>
            <Link href="/cart" className="hover:text-gray-600">Cart</Link><span>/</span>
            <span className="text-gray-900">Checkout</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          {/* Steps */}
          <div className="flex items-center gap-4 mt-4">
            <button onClick={() => setStep(1)} className={cn('flex items-center gap-2 text-sm font-medium', step === 1 ? 'text-black' : 'text-gray-400')}>
              <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', step === 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500')}>1</span>
              Information
            </button>
            <div className="w-8 h-px bg-gray-300" />
            <button onClick={() => { if (validateStep1()) setStep(2); }} className={cn('flex items-center gap-2 text-sm font-medium', step === 2 ? 'text-black' : 'text-gray-400')}>
              <span className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold', step === 2 ? 'bg-black text-white' : 'bg-gray-200 text-gray-500')}>2</span>
              Payment & Review
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-6">
                {/* Contact */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><User size={18} /> Contact Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField icon={User} label="First Name" field="firstName" placeholder="Ahmad" half />
                    <InputField icon={User} label="Last Name" field="lastName" placeholder="Khan" half />
                    <InputField icon={Mail} label="Email" field="email" type="email" placeholder="ahmad@example.com" half />
                    <InputField icon={Phone} label="Phone" field="phone" type="tel" placeholder="+92 300 1234567" half />
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} /> Billing Address</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField icon={Home} label="Address Line 1" field="address1" placeholder="Street address" />
                    <InputField icon={Home} label="Address Line 2" field="address2" placeholder="Apt, suite, unit (optional)" required={false} />
                    <InputField icon={Building2} label="City" field="city" placeholder="Lahore" half />
                    <InputField icon={Building2} label="State / Province" field="state" placeholder="Punjab" half />
                    <InputField icon={FileText} label="Postal Code" field="postcode" placeholder="54000" half />
                    <div className="col-span-1">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <MapPin size={12} /> Country <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={form.country}
                        onChange={(e) => updateField('country', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:bg-white transition-all"
                      >
                        <option value="PK">Pakistan</option>
                        <option value="AE">UAE</option>
                        <option value="SA">Saudi Arabia</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ship to different address */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.shipToDifferent}
                      onChange={(e) => updateField('shipToDifferent', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-900">Ship to a different address?</span>
                  </label>

                  {form.shipToDifferent && (
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                      <InputField icon={User} label="First Name" field="shippingFirstName" half />
                      <InputField icon={User} label="Last Name" field="shippingLastName" half />
                      <InputField icon={Home} label="Address Line 1" field="shippingAddress1" />
                      <InputField icon={Home} label="Address Line 2" field="shippingAddress2" required={false} />
                      <InputField icon={Building2} label="City" field="shippingCity" half />
                      <InputField icon={Building2} label="State" field="shippingState" half />
                      <InputField icon={FileText} label="Postal Code" field="shippingPostcode" half />
                      <div className="col-span-1">
                        <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Country</label>
                        <select value={form.shippingCountry} onChange={(e) => updateField('shippingCountry', e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:bg-white transition-all">
                          <option value="PK">Pakistan</option><option value="AE">UAE</option><option value="SA">Saudi Arabia</option><option value="US">United States</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order notes */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5"><FileText size={12} /> Order Notes (optional)</label>
                  <textarea
                    value={form.customerNote}
                    onChange={(e) => updateField('customerNote', e.target.value)}
                    rows={3}
                    placeholder="Notes about your order, e.g. special notes for delivery..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:bg-white transition-all resize-none"
                  />
                </div>

                <button
                  onClick={() => { if (validateStep1()) setStep(2); }}
                  className="w-full py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Delivery info summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Truck size={18} /> Delivery Details</h2>
                    <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                    <p className="font-medium text-gray-900">{form.firstName} {form.lastName}</p>
                    <p>{form.address1}{form.address2 ? `, ${form.address2}` : ''}</p>
                    <p>{form.city}, {form.state} {form.postcode}</p>
                    <p>{form.email} · {form.phone}</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={18} /> Payment Method</h2>
                  <div className="space-y-3">
                    <label className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Cash on Delivery (COD)</p>
                        <p className="text-xs text-gray-500">Pay when you receive your order</p>
                      </div>
                      <span className="text-2xl">💵</span>
                    </label>
                    <label className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                      paymentMethod === 'bacs' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <input type="radio" name="payment" value="bacs" checked={paymentMethod === 'bacs'} onChange={() => setPaymentMethod('bacs')} className="w-4 h-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Bank Transfer</p>
                        <p className="text-xs text-gray-500">Direct bank transfer payment</p>
                      </div>
                      <span className="text-2xl">🏦</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="flex items-center gap-2 px-6 py-3.5 border border-gray-200 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all disabled:opacity-60"
                  >
                    {submitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>Place Order · {formatPrice(cart?.total)}</>}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-400 pt-2">
                  <span className="flex items-center gap-1"><Shield size={12} /> Secure Checkout</span>
                  <span className="flex items-center gap-1"><Truck size={12} /> Fast Delivery</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-gray-50 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const imgSrc = item.variation?.node?.image?.sourceUrl || item.product.node.image?.sourceUrl;
                  return (
                    <div key={item.key} className="flex gap-3 p-2 rounded-lg">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        {imgSrc && <Image src={imgSrc} alt={item.product.node.name} fill className="object-cover" sizes="56px" />}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{item.quantity}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product.node.name}</p>
                        {item.variation?.node?.attributes?.nodes && (
                          <p className="text-xs text-gray-400">{item.variation.node.attributes.nodes.map(a => a.value).join(' / ')}</p>
                        )}
                      </div>
                      <span className="text-sm font-medium">{formatPrice(item.total)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{formatPrice(cart?.subtotal)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span className="text-emerald-600">{formatPrice(cart?.shippingTotal) || 'Free'}</span></div>
                {cart?.totalTax && <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>{formatPrice(cart.totalTax)}</span></div>}
              </div>
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-bold">{formatPrice(cart?.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
