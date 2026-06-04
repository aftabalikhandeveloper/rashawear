'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  image: { sourceUrl: string; altText?: string };
  price: string | null;
}

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/search?q=' + encodeURIComponent(query));
        const data = await res.json();
        setResults(data.products || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-2xl max-h-[80vh] overflow-hidden animate-slide-down">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Search Input */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
            <Search size={20} className="text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-lg outline-none bg-transparent placeholder:text-gray-400"
            />
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Results */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No products found for &quot;{query}&quot;</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image?.sourceUrl && (
                        <Image
                          src={product.image.sourceUrl}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {query.length < 2 && (
              <div className="py-8">
                <p className="text-sm text-gray-400 text-center">Type at least 2 characters to search</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['Shirts', 'Hoodies', 'Bags', 'Accessories'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
