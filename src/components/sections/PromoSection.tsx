'use client';

import React from 'react';
import Link from 'next/link';

export default function PromoSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-200/20 rounded-full blur-3xl" />

          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Earn free money<br />
              <span className="text-amber-600">with Rashawear.</span>
            </h2>
            <p className="text-gray-600 mb-8">
              With Rashawear you will get free shipping & exclusive savings combo on your first order.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/collections/all"
                className="px-6 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-black/10"
              >
                Savings combo
              </Link>
              <Link
                href="/collections/all"
                className="px-6 py-3 bg-white text-gray-900 text-sm font-medium rounded-full border border-gray-200 hover:border-gray-300 transition-all"
              >
                Discover more
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
