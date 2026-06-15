import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategories, getProducts } from '@/lib/data';
import { ChevronLeft, Layers } from 'lucide-react';
import CategorySearchClient from './CategorySearchClient';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await the route params as required in Next.js 15+
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Fetch category list to identify the current category details
  const categories = await getCategories();
  const currentCategory = categories.find((cat: any) => cat.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  // Fetch all products in this category (client component handles search + display)
  const products = await getProducts({ category: slug });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
      {/* Navigation Breadcrumb */}
      <div className="pt-6 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-fg/60 hover:text-primary-500 transition-colors"
        >
          <ChevronLeft size={14} />
          Back to Showcase
        </Link>
      </div>

      {/* Category Header */}
      <div className="space-y-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary-500 uppercase tracking-wider">
          <Layers size={13} />
          <span>Category</span>
        </div>
        <h1 className="text-3xl font-extrabold text-brand-fg leading-tight">
          {currentCategory.name}
        </h1>
        <p className="text-xs text-brand-fg/60 max-w-2xl leading-relaxed">
          {currentCategory.description}
        </p>
        <p className="text-[11px] text-brand-fg/40 font-semibold">
          {products.length} product{products.length === 1 ? '' : 's'} in this category
        </p>
      </div>

      {/* Client-side search + product grid */}
      <CategorySearchClient
        products={products}
        categoryName={currentCategory.name}
      />
    </div>
  );
}
