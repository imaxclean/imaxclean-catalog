'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReviewForm from '../../components/ReviewForm';
import { Star, ShieldCheck, ChevronLeft, Info, Table, MessageSquare } from 'lucide-react';

interface ProductDetailsClientProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    sku: string;
    price: number;
    category: string;
    images: string[];
    specs: { key: string; value: string }[];
    stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
    featured: boolean;
    rating: number;
    reviews: {
      _id: string;
      user: string;
      rating: number;
      comment: string;
      createdAt: string;
    }[];
  };
  isLoggedIn: boolean;
}

type TabType = 'overview' | 'specs' | 'reviews';

export default function ProductDetailsClient({ product, isLoggedIn }: ProductDetailsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const stockColors = {
    'In Stock': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Low Stock': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Out of Stock': 'bg-red-500/10 text-red-500 border-red-500/20'
  };

  const displayCategory = product.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col">
      {/* Back button */}
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-fg/60 hover:text-primary-500 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Catalog
        </Link>
      </div>

      {/* Main product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Product Visual Container (Left Column) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="relative aspect-square rounded-2xl glassmorphism border flex items-center justify-center text-[10rem] select-none p-8 animate-float">
            {product.category === 'industrial-equipment' ? '🚜' : product.category === 'chemical-solutions' ? '🧪' : '🧹'}
            
            {/* Badges */}
            <span className={`absolute top-6 left-6 border text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${stockColors[product.stock]}`}>
              {product.stock}
            </span>
          </div>

          <div className="p-5 rounded-2xl glassmorphism space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-fg/40">Guaranteed Compliance</h3>
            <div className="flex items-center gap-3 text-xs text-brand-fg/70">
              <ShieldCheck className="text-primary-500 shrink-0" size={18} />
              <span>Full compliance with EN 1276 and ISO standards.</span>
            </div>
          </div>
        </div>

        {/* Product Details & Tabs (Right Column) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Header Info */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-full">
              {displayCategory}
            </span>
            <h1 className="text-3xl font-extrabold text-brand-fg leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-brand-fg/40 font-mono">SKU: {product.sku}</span>
              <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.03] px-2 py-0.5 rounded text-brand-fg/80">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span>{product.rating}</span>
                <span className="text-brand-fg/40 font-normal">({product.reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Pricing Action */}
          <div className="p-6 rounded-2xl glassmorphism">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-fg/40 uppercase tracking-wider font-semibold">B2B Base Price</span>
              <div className="text-2xl font-black text-brand-fg">
                ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="flex-1 flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-black/[0.08] dark:border-white/[0.08] gap-4">
              {[
                { id: 'overview', label: 'Overview', icon: <Info size={14} /> },
                { id: 'specs', label: 'Technical Specs', icon: <Table size={14} /> },
                { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={14} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`py-3 px-1 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-brand-fg/60 hover:text-brand-fg'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <div className="py-6 flex-1">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-brand-fg">Product Description</h3>
                  <p className="text-xs text-brand-fg/70 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-brand-fg">Technical Data Sheet</h3>
                  {product.specs && product.specs.length > 0 ? (
                    <div className="border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">
                      <table className="w-full text-xs text-left">
                        <tbody className="divide-y divide-black/10 dark:divide-white/10">
                          {product.specs.map((spec, index) => (
                            <tr key={index} className="odd:bg-black/[0.01] dark:odd:bg-white/[0.01]">
                              <td className="px-4 py-3 font-bold text-brand-fg/60 w-1/3 border-r border-black/10 dark:border-white/10">
                                {spec.key}
                              </td>
                              <td className="px-4 py-3 font-semibold text-brand-fg">
                                {spec.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-brand-fg/50 italic">No technical specifications listed for this product.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Reviews List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-brand-fg">Customer Reviews</h3>
                    {product.reviews && product.reviews.length > 0 ? (
                      <div className="space-y-4 divide-y divide-black/[0.04] dark:divide-white/[0.04]">
                        {product.reviews.map((rev) => (
                          <div key={rev._id} className="pt-4 first:pt-0 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-brand-fg">{rev.user}</span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={10}
                                    className={star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-brand-fg/20'}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-brand-fg/60 leading-relaxed">
                              {rev.comment}
                            </p>
                            <div className="text-[10px] text-brand-fg/40">
                              {(() => {
                                const parts = rev.createdAt.split('T')[0].split('-');
                                if (parts.length !== 3) return rev.createdAt;
                                const year = parts[0];
                                const monthIndex = parseInt(parts[1], 10) - 1;
                                const day = parseInt(parts[2], 10);
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                return `${months[monthIndex]} ${day}, ${year}`;
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-brand-fg/50 italic">No reviews yet. Be the first to review this product!</p>
                    )}
                  </div>

                  {/* Submit Review Form */}
                  <div className="pt-4">
                    <ReviewForm productId={product._id} isLoggedIn={isLoggedIn} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
