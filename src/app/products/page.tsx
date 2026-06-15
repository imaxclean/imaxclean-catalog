import { redirect } from 'next/navigation';

// The catalog page now lives on the homepage.
// Redirect any legacy /products links to the home page.
export default function ProductsPage() {
  redirect('/');
}
