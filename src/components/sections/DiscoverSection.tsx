'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShoppingBag, Tag, Gift } from 'lucide-react';

const CARDS = [
  {
    title: 'Explore new arrivals',
    heading: 'Shop the latest from top brands',
    href: '/collections/all',
    gradient: 'from-amber-100 to-orange-100',
    icon: Sparkles,
    iconColor: 'text-amber-600 bg-amber-50',
  },
  {
    title: "Men's Collection",
    heading: 'Up to 50% off for men',
    href: '/collections/men',
    gradient: 'from-blue-100 to-indigo-100',
    icon: ShoppingBag,
    iconColor: 'text-blue-600 bg-blue-50',
  },
  {
    title: "Women's Collection",
    heading: 'Trending styles for women',
    href: '/collections/women',
    gradient: 'from-pink-100 to-rose-100',
    icon: Tag,
    iconColor: 'text-pink-600 bg-pink-50',
  },
  {
    title: 'Accessories',
    heading: 'Complete your look',
    href: '/collections/accessories-2',
    gradient: 'from-emerald-100 to-teal-100',
    icon: Gift,
    iconColor: 'text-emerald-600 bg-emerald-50',
  },
];

export default function DiscoverSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Discover more. <span className="font-normal text-gray-500">Good things are waiting for you</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                href={card.href}
                className={`group relative bg-gradient-to-br ${card.gradient} rounded-2xl p-6 sm:p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`w-10 h-10 rounded-xl ${card.iconColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <p className="text-xs font-medium text-gray-600 mb-2">{card.title}</p>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">{card.heading}</h3>
                <span className="inline-block mt-4 text-xs font-medium text-gray-600 group-hover:text-black transition-colors">
                  Show me all →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
