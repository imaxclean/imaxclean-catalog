import React from 'react';
import { getProducts, getCategories } from '@/lib/data';
import HomepageClient from './components/HomepageClient';

export default async function Home() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts()
  ]);

  return (
    // No padding-top — HomepageClient owns the sticky search bar which handles its own spacing
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
      <HomepageClient categories={categories} products={products} />
    </div>
  );
}
