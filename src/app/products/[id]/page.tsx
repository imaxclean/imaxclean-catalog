import { notFound } from 'next/navigation';

// Product detail page has been removed per requirements.
// Visiting any product URL will return a 404.
export default async function ProductDetailsPage() {
  notFound();
}
