'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { Product } from '@/lib/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(searchQuery));
      const data = await res.json();
      setResults(data.products || []);
    } catch {
      setResults([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Search Products</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="relative max-w-xl mx-auto"
          >
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full pr-24 py-4 bg-white rounded-full border border-gray-200 text-base outline-none focus:border-gray-400 focus:shadow-lg transition-all pl-14"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-gray-400" />
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-gray-500 mb-2">No products found for &quot;{query}&quot;</p>
            <p className="text-sm text-gray-400">Try searching with different keywords</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-6">{results.length} results for &quot;{query}&quot;</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">Start searching to discover products</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {['Shirts', 'Hoodies', 'Tee', 'Bags', 'Accessories'].map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    handleSearch(tag);
                  }}
                  className="px-5 py-2.5 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[40vh]">
          <Loader2 size={32} className="animate-spin text-gray-400" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
