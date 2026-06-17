'use client';

import React from 'react';
import { Star, Layers } from 'lucide-react';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    sku?: string;
    quantity?: string;
    price: number;
    category: string;
    images: string[];
    specs: { key: string; value: string }[];
    stock: 'In Stock' | 'Low Stock' | 'Out of Stock';
    featured: boolean;
    rating: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
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
    <div className="group relative flex flex-col h-full rounded-2xl bg-white border border-zinc-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Product Image (DB Fetched) */}
      <div className="relative h-48 w-full bg-zinc-50 border-b border-zinc-100 flex items-center justify-center overflow-hidden">
        {product.images && product.images[0] && !product.images[0].endsWith('.svg') ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center select-none space-y-2">
            <span className="text-3xl">📦</span>
          </div>
        )}

        {/* Stock Badge */}
        <span className={`absolute top-4 left-4 border text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${stockColors[product.stock]}`}>
          {product.stock}
        </span>
      </div>

      {/* Product Details */}
      <div className="flex-1 p-5 flex flex-col">
        {/* Category */}
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-500 flex items-center gap-1">
          <Layers size={10} />
          {displayCategory}
        </span>

        {/* Title */}
        <h4 className="text-base font-bold text-zinc-900 mt-2 line-clamp-1">
          {product.name}
        </h4>

        {/* Quantity */}
        {product.quantity && (
          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">Quantity: {product.quantity}</span>
        )}

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed mt-2.5 line-clamp-2">
          {product.description}
        </p>

        {/* Specs snippet */}
        {product.specs && product.specs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2">
            {product.specs.slice(0, 2).map((spec, index) => (
              <div key={index} className="flex flex-col">
                <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider">{spec.key}</span>
                <span className="text-xs font-bold text-zinc-800 truncate">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & Rating */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Catalog Price</span>
            <span className="text-base font-extrabold text-zinc-900">
              {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} KWD
            </span>
          </div>

          <div className="flex items-center gap-0.5 bg-zinc-50 px-2 py-1 rounded-md text-xs font-bold">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span>{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
