'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    badge: 'New Season Collection 🔥',
    title: 'Exclusive collection for everyone',
    subtitle: 'Discover premium fashion that speaks your style',
    cta: 'Explore Shop Now',
    href: '/collections/all',
    gradient: 'from-amber-50 to-orange-50',
    accent: 'bg-amber-100',
  },
  {
    badge: 'Men\'s Collection',
    title: 'Bold styles for modern men',
    subtitle: 'From tees to hoodies — outfit your confidence',
    cta: 'Shop Men',
    href: '/collections/men',
    gradient: 'from-blue-50 to-indigo-50',
    accent: 'bg-blue-100',
  },
  {
    badge: 'Women\'s Collection',
    title: 'Elegance meets comfort',
    subtitle: 'Find your perfect look for every occasion',
    cta: 'Shop Women',
    href: '/collections/women',
    gradient: 'from-pink-50 to-rose-50',
    accent: 'bg-pink-100',
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className={`relative bg-gradient-to-br ${slide.gradient} transition-colors duration-1000 overflow-hidden`}>
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/30 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative z-10">
        <div className="max-w-2xl">
          <span className={`inline-block px-4 py-1.5 ${slide.accent} text-sm font-medium rounded-full mb-6`}>
            {slide.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 transition-all duration-500">
            {slide.title}
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            {slide.subtitle}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={slide.href}
              className="px-8 py-3.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-0.5"
            >
              {slide.cta}
            </Link>
            <Link
              href="/search"
              className="px-8 py-3.5 bg-white text-gray-900 text-sm font-medium rounded-full border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:-translate-y-0.5"
            >
              Discover more
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
        <button
          onClick={() => setCurrent((current - 1 + SLIDES.length) % SLIDES.length)}
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-black' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => setCurrent((current + 1) % SLIDES.length)}
          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors shadow-sm"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
