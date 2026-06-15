import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getProducts, getCategories } from '@/lib/data';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getSession();

  // Redirect to login if user is not authenticated or not an admin
  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  // Fetch all necessary admin datasets on the server
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <AdminClient
      products={products}
      categories={categories}
    />
  );
}
