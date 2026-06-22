'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Search, X, Layers, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

interface HomepageClientProps {
  categories: Category[];
  products: Product[];
}

export default function HomepageClient({ categories, products }: HomepageClientProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  const searchBarRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mouse drag-to-scroll state & handlers for categories list
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setHasMoved(false);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    if (Math.abs(x - startX) > 5) {
      setHasMoved(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleCategoryClick = (slug: string | null) => {
    if (hasMoved) return;
    setSelectedCategory(slug);
  };

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Scroll to results when search or category changes (if user is scrolled past search bar)
  useEffect(() => {
    if (!debouncedSearch && !selectedCategory) return;
    if (!resultsRef.current || !searchBarRef.current) return;

    const searchRect = searchBarRef.current.getBoundingClientRect();
    // Only auto-scroll if the user is scrolled past the search bar
    if (searchRect.bottom < 0) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [debouncedSearch, selectedCategory]);

  // Detect when search bar is in sticky mode (scrolled past original position)
  useEffect(() => {
    const handleScroll = () => {
      if (!searchBarRef.current) return;
      const rect = searchBarRef.current.getBoundingClientRect();
      // top-16 = 64px (header height), so it sticks at 64px from top
      setIsStuck(rect.top <= 64);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Group products by category and filter
  const searchLower = debouncedSearch.toLowerCase();

  // Pre-calculate counts of matching products for each category to show in badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(category => {
      counts[category.slug] = products.filter(product => {
        if (product.category !== category.slug) return false;
        if (!searchLower) return true;
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.sku?.toLowerCase().includes(searchLower) || false) ||
          product.description.toLowerCase().includes(searchLower)
        );
      }).length;
    });
    return counts;
  }, [categories, products, searchLower]);

  const categoryGroups = categories
    .filter(category => !selectedCategory || category.slug === selectedCategory)
    .map(category => {
      const matchedProducts = products.filter(product => {
        if (product.category !== category.slug) return false;
        if (!searchLower) return true;
        return (
          product.name.toLowerCase().includes(searchLower) ||
          (product.sku?.toLowerCase().includes(searchLower) || false) ||
          product.description.toLowerCase().includes(searchLower)
        );
      });
      return { category, products: matchedProducts };
    })
    .filter(group => group.products.length > 0);

  const totalFilteredCount = categoryGroups.reduce((acc, curr) => acc + curr.products.length, 0);
  const totalProducts = products.length;

  return (
    <div className="space-y-0 w-full max-w-full min-w-0">

      {/* ── Sticky Search Bar ── */}
      <div
        ref={searchBarRef}
        className={`sticky top-16 z-30 transition-all duration-300 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 w-auto max-w-[100vw] min-w-0 ${
          isStuck
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-zinc-100'
            : 'bg-white py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-2xl mx-auto w-full min-w-0">
            <div className="relative flex items-center w-full min-w-0">
              <input
                ref={inputRef}
                type="text"
                id="homepage-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, equipment or SKUs…"
                className="w-full bg-white border border-zinc-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 focus:outline-none rounded-2xl pl-12 pr-36 py-3.5 text-sm font-medium shadow-md transition-all text-zinc-900 placeholder:text-zinc-400"
              />
              <Search className="absolute left-4 text-zinc-400 pointer-events-none" size={18} />

              {/* Right side: result count pill + clear button */}
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
                      {totalFilteredCount} result{totalFilteredCount === 1 ? '' : 's'}
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

            {/* Category Filters */}
            <div
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
              className="mt-4 flex items-center gap-2 no-scrollbar pb-1 w-full max-w-full min-w-0 cursor-grab active:cursor-grabbing"
            >
              <button
                onClick={() => handleCategoryClick(null)}
                className={`relative px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 cursor-pointer z-10 flex items-center justify-center border ${
                  !selectedCategory ? 'border-transparent' : 'border-zinc-200/60'
                }`}
              >
                {!selectedCategory && (
                  <motion.span
                    layoutId="activeCategoryBg"
                    className="absolute inset-0 bg-primary-500 rounded-full -z-10 shadow-sm shadow-primary-500/20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className={!selectedCategory ? 'text-white' : 'text-zinc-600 hover:text-zinc-900 transition-colors'}>
                  All Products
                </span>
                <span className={`ml-1.5 inline-flex items-center justify-center rounded-full text-[9px] px-1.5 py-0.5 font-bold ${
                  !selectedCategory ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                }`}>
                  {totalProducts}
                </span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                const count = categoryCounts[cat.slug] || 0;

                return (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryClick(isSelected ? null : cat.slug)}
                    className={`relative px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer z-10 border ${
                      isSelected ? 'border-transparent' : 'border-zinc-200/60'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="activeCategoryBg"
                        className="absolute inset-0 bg-primary-500 rounded-full -z-10 shadow-sm shadow-primary-500/20"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className={isSelected ? 'text-white' : 'text-zinc-600 hover:text-zinc-900 transition-colors'}>
                      {cat.name}
                    </span>
                    <span className={`inline-flex items-center justify-center rounded-full text-[9px] px-1.5 py-0.5 font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Persistent Dynamic Hint text (fixed height to prevent layout shifts) */}
            <p className="mt-2 text-center text-[11px] text-zinc-400 min-h-[16px] leading-4">
              {debouncedSearch || selectedCategory ? (
                <span>
                  Showing {totalFilteredCount} product{totalFilteredCount === 1 ? '' : 's'}
                  {selectedCategory && ` in ${categories.find(c => c.slug === selectedCategory)?.name}`}
                  {debouncedSearch && ` matching "${debouncedSearch}"`}
                </span>
              ) : (
                <span>
                  Showing {totalProducts} products across {categories.length} categories
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Results Section ── */}
      <div ref={resultsRef} className="space-y-16 pt-8 pb-12">
        <AnimatePresence mode="popLayout">
          {categoryGroups.length === 0 ? (

            /* ── Empty / No Match State ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="py-20 text-center rounded-3xl border-2 border-dashed border-zinc-200 max-w-lg mx-auto flex flex-col items-center justify-center space-y-5 bg-white shadow-sm mt-8"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center">
                <Search size={24} className="text-primary-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900">No Matches Found</h3>
                <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                  No products matched the selected filters. Try adjusting your search query or category.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory(null);
                  inputRef.current?.focus();
                }}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </motion.div>

          ) : (
            categoryGroups.map(({ category, products: categoryProducts }, groupIndex) => {
              const displayProducts = categoryProducts.slice(0, 8);
              const hasMore = categoryProducts.length > 8;

              return (
                <motion.section
                  key={category._id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.4, delay: groupIndex * 0.05 }}
                  className="space-y-6"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-zinc-200">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                        <Layers size={12} />
                        <span>Category</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <h2 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                          {category.name}
                        </h2>
                        <Link
                          href={`/categories/${category.slug}`}
                          className="sm:hidden inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors group shrink-0"
                        >
                          <span>Show all</span>
                          <ArrowRight size={12} className="transform group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                      <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">
                        {category.description}
                      </p>
                    </div>

                    <Link
                      href={`/categories/${category.slug}`}
                      className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors self-start sm:self-auto group shrink-0"
                    >
                      <span>Show all products</span>
                      <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Products Grid */}
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {displayProducts.map((product, i) => (
                        <motion.div
                          key={product._id}
                          layout
                          initial={{ opacity: 0, scale: 0.94, y: 12 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, y: -12 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          className="h-full"
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>

                  {/* Mobile-only Show all products link */}
                  <div className="sm:hidden pt-2">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors group"
                    >
                      <span>Show all products</span>
                      <ArrowRight size={13} className="transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Show all button */}
                  {hasMore && (
                    <div className="pt-2 text-center">
                      <Link
                        href={`/categories/${category.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 hover:border-primary-500 hover:text-primary-500 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-sm text-zinc-600 cursor-pointer group"
                      >
                        Show all {categoryProducts.length} items in {category.name}
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  )}
                </motion.section>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
