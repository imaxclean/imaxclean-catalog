'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, X, Package, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  sku?: string;
  price: number;
  category: string;
  images: string[];
  specs: { key: string; value: string }[];
  stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
  featured: boolean;
  rating: number;
}

interface CategorySearchClientProps {
  products: Product[];
  categoryName: string;
}

export default function CategorySearchClient({ products, categoryName }: CategorySearchClientProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isStuck, setIsStuck] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce effect (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Auto-scroll to results when searching from bottom
  useEffect(() => {
    if (!debouncedSearch) return;
    if (!resultsRef.current || !searchBarRef.current) return;

    const searchRect = searchBarRef.current.getBoundingClientRect();
    if (searchRect.bottom < 0) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [debouncedSearch]);

  // Track sticky state
  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;
      setIsStuck(searchBarRef.current.getBoundingClientRect().top <= 64);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return products;
    const q = debouncedSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) || false) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, debouncedSearch]);

  return (
    <div className="space-y-0">

      {/* ── Sticky Search Bar ── */}
      <div
        ref={searchBarRef}
        className={`sticky top-16 z-30 transition-all duration-300 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 ${
          isStuck
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-zinc-100 py-3'
            : 'bg-white py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="relative max-w-2xl">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                id="category-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search in ${categoryName}…`}
                className="w-full bg-white border border-zinc-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 focus:outline-none rounded-2xl pl-12 pr-36 py-3.5 text-sm font-medium shadow-md transition-all text-zinc-900 placeholder:text-zinc-400"
              />
              <Search className="absolute left-4 text-zinc-400 pointer-events-none" size={18} />

              {/* Right pill + clear */}
              <div className="absolute right-3 flex items-center gap-2">
                <AnimatePresence>
                  {debouncedSearch && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8, x: 6 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 6 }}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-primary-500/10 text-primary-500 text-[10px] font-bold rounded-full uppercase tracking-wider"
                    >
                      <SlidersHorizontal size={10} />
                      {filteredProducts.length} result{filteredProducts.length === 1 ? '' : 's'}
                    </motion.span>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => {
                        setSearch('');
                        inputRef.current?.focus();
                      }}
                      className="p-1.5 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X size={15} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Hint below when idle */}
            {!debouncedSearch && (
              <p className="mt-2 text-[11px] text-zinc-400">
                {products.length} product{products.length === 1 ? '' : 's'} in this category
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Products Grid ── */}
      <div ref={resultsRef} className="pt-8 pb-12">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="py-24 text-center rounded-3xl border-2 border-dashed border-zinc-200 max-w-lg mx-auto flex flex-col items-center justify-center space-y-5 bg-white shadow-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Package size={24} className="text-primary-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900">No Products Found</h3>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  No products matched &quot;{debouncedSearch}&quot;. Try a different keyword.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearch('');
                  inputRef.current?.focus();
                }}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.94, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.25, delay: i * 0.03 }}
                    className="h-full"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
