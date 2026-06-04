'use client';

import React from 'react';
import { Search, ShoppingBag, Truck, Star } from 'lucide-react';

const STEPS = [
  {
    icon: Search,
    step: 'Step 1',
    title: 'Filter & Discover',
    description: 'Smart filtering and suggestions make it easy to find',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: ShoppingBag,
    step: 'Step 2',
    title: 'Add to bag',
    description: 'Easily select the correct items and add them to the cart',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: Truck,
    step: 'Step 3',
    title: 'Fast shipping',
    description: 'The carrier will confirm and ship quickly to you',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Star,
    step: 'Step 4',
    title: 'Enjoy the product',
    description: 'Have fun and enjoy your 5-star quality products',
    color: 'bg-emerald-50 text-emerald-600',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STEPS.map(({ icon: Icon, step, title, description, color }, i) => (
            <div key={i} className="text-center group">
              <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                <Icon size={28} />
              </div>
              <p className="text-xs font-medium text-gray-400 mb-1">{step}</p>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mx-auto">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
