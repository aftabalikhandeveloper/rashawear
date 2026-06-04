'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

const CARD_GRADIENTS = [
  'from-amber-50 to-yellow-50',
  'from-blue-50 to-indigo-50',
  'from-pink-50 to-rose-50',
  'from-emerald-50 to-teal-50',
  'from-purple-50 to-violet-50',
  'from-orange-50 to-red-50',
];

const CARD_LABELS = [
  'Newest arrivals', 'Best sellers', 'Best sellers',
  'Top transparent', 'Best seasonal', 'Top rated',
];

// Decorative SVGs matching the Ciseco screenshot
function Decoration({ index }: { index: number }) {
  const decs = [
    // Diagonal stripes (like screenshot card 1)
    <svg key="0" viewBox="0 0 120 120" className="w-28 h-28 opacity-30">
      <line x1="30" y1="120" x2="70" y2="0" stroke="#ef4444" strokeWidth="3" />
      <line x1="50" y1="120" x2="90" y2="0" stroke="#3b82f6" strokeWidth="2.5" />
      <line x1="70" y1="120" x2="110" y2="0" stroke="#06b6d4" strokeWidth="2" />
    </svg>,
    // Wavy lines (like screenshot card 2)
    <svg key="1" viewBox="0 0 120 120" className="w-28 h-28 opacity-30">
      <path d="M10,100 Q30,60 50,80 Q70,100 90,60 Q110,20 120,40" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
      <path d="M10,80 Q30,40 50,60 Q70,80 90,40 Q110,0 120,20" fill="none" stroke="#ef4444" strokeWidth="2" />
      <path d="M10,60 Q30,20 50,40 Q70,60 90,20 Q110,-20 120,0" fill="none" stroke="#06b6d4" strokeWidth="2" />
    </svg>,
    // Circles (like screenshot card 3)
    <svg key="2" viewBox="0 0 120 120" className="w-28 h-28 opacity-30">
      <circle cx="70" cy="70" r="25" fill="none" stroke="#f97316" strokeWidth="2" />
      <circle cx="50" cy="50" r="18" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="4,4" />
      <circle cx="90" cy="40" r="12" fill="none" stroke="#22c55e" strokeWidth="2" />
      <circle cx="40" cy="90" r="8" fill="none" stroke="#8b5cf6" strokeWidth="2" />
    </svg>,
    // Curvy lines (like screenshot card 4)
    <svg key="3" viewBox="0 0 120 120" className="w-28 h-28 opacity-30">
      <path d="M10,110 C30,30 50,90 70,50 C90,10 100,80 120,30" fill="none" stroke="#22c55e" strokeWidth="2.5" />
      <path d="M0,100 C20,20 40,80 60,40 C80,0 90,70 110,20" fill="none" stroke="#86efac" strokeWidth="1.5" />
    </svg>,
    // Dots cluster (like screenshot card 5)
    <svg key="4" viewBox="0 0 120 120" className="w-28 h-28 opacity-30">
      <circle cx="50" cy="60" r="6" fill="#f59e0b" /><circle cx="70" cy="40" r="4" fill="#22c55e" />
      <circle cx="85" cy="65" r="5" fill="#ef4444" /><circle cx="60" cy="85" r="3.5" fill="#3b82f6" />
      <circle cx="40" cy="45" r="3" fill="#8b5cf6" /><circle cx="90" cy="85" r="4.5" fill="#f97316" />
      <circle cx="75" cy="80" r="2.5" fill="#06b6d4" />
    </svg>,
    // Diagonal bars (like screenshot card 6)
    <svg key="5" viewBox="0 0 120 120" className="w-28 h-28 opacity-30">
      <line x1="40" y1="120" x2="80" y2="0" stroke="#22c55e" strokeWidth="4" />
      <line x1="60" y1="120" x2="100" y2="0" stroke="#6b7280" strokeWidth="3" />
      <line x1="80" y1="120" x2="120" y2="0" stroke="#3b82f6" strokeWidth="3.5" />
    </svg>,
  ];
  return <div className="absolute bottom-0 right-0">{decs[index % decs.length]}</div>;
}

// Fallback emoji icons for categories without thumbnails
const FALLBACK_ICONS: Record<string, string> = {
  men: '👔', women: '👗', accessories: '👜', 'accessories-2': '⌚',
  'hoodies-men': '🧥', 'hoodies-women': '🧥', hoodies: '🧥',
  'shirts-men': '👕', 'shirts-women': '👚', shirts: '👕',
  sweater: '🧶', clothing: '🎽', jackets: '🧥', tshirts: '👕',
  decor: '🏠', music: '🎵', socks: '🧦',
};

interface CategoryExplorerProps {
  categories: ProductCategory[];
}

export default function CategoryExplorer({ categories }: CategoryExplorerProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Parent categories = those with children
  const parentCategories = categories.filter(
    c => !c.parent && c.slug !== 'uncategorized' && (c.children?.nodes?.length || 0) > 0
  );

  // Standalone top-level categories with products (no children)
  const standaloneCategories = categories.filter(
    c => !c.parent && c.slug !== 'uncategorized'
      && (!c.children?.nodes?.length)
      && c.count && c.count > 0
  );

  const allTabs = [...parentCategories, ...standaloneCategories];
  const [activeTab, setActiveTab] = useState(allTabs[0]?.slug || '');

  const activeParent = allTabs.find(c => c.slug === activeTab);
  const childCategories = activeParent?.children?.nodes || [];
  // If tab has no children, show standalone categories
  const displayCategories = childCategories.length > 0 ? childCategories : standaloneCategories;
  const visibleCategories = displayCategories.slice(0, 6);

  // Horizontal scroll handling for mobile tabs
  const checkScroll = () => {
    const el = tabsRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (el) el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' });
  };

  return (
    <section className="py-16 lg:py-24 bg-neutral-100/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-8">
          Start exploring.
        </h2>

        {/* Tabs — scrollable on mobile */}
        <div className="relative flex justify-center mb-10">
          {/* Scroll left button (mobile) */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center sm:hidden"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            ref={tabsRef}
            className="flex items-center gap-1 overflow-x-auto scrollbar-hide max-w-full px-2 sm:px-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-100"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allTabs.map((cat) => {
              const hasThumb = !!cat.image?.sourceUrl;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveTab(cat.slug)}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0',
                    activeTab === cat.slug
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {/* Category thumbnail from WP or fallback emoji */}
                  {hasThumb ? (
                    <span className="relative w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={cat.image!.sourceUrl}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        sizes="20px"
                      />
                    </span>
                  ) : (
                    <span className="text-sm leading-none">{FALLBACK_ICONS[cat.slug] || '🏷️'}</span>
                  )}
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Scroll right button (mobile) */}
          {canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center sm:hidden"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Category Cards Grid — 3 cols desktop, 2 on tablet, 1 on small mobile */}
        {visibleCategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleCategories.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                className={cn(
                  'group relative bg-gradient-to-br rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl min-h-[200px] flex flex-col justify-between',
                  CARD_GRADIENTS[i % CARD_GRADIENTS.length]
                )}
              >
                {/* Top: Icon + Arrow */}
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                    {cat.image?.sourceUrl ? (
                      <Image
                        src={cat.image.sourceUrl}
                        alt={cat.name}
                        width={32}
                        height={32}
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{FALLBACK_ICONS[cat.slug] || '🛍️'}</span>
                    )}
                  </div>
                  <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight size={14} className="text-gray-700" />
                  </div>
                </div>

                {/* Bottom: Info */}
                <div className="mt-8 relative z-10">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {CARD_LABELS[i % CARD_LABELS.length]}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">{cat.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {cat.count ? `${cat.count} products` : 'Browse collection'}
                  </p>
                </div>

                {/* Decorative SVG */}
                <Decoration index={i} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No subcategories found for this section.</p>
          </div>
        )}

        {/* Explore All */}
        <div className="text-center mt-10">
          <Link
            href="/collections/all"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:border-gray-400 hover:shadow-md transition-all duration-300 group"
          >
            Explore all collections
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
