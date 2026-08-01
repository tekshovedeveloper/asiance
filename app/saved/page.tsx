import { RequireAuth } from '@/components/auth/RequireAuth';
import { SavedItemsClient } from '@/components/SavedItemsClient';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getNewsCategories, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const [products, categories] = await Promise.all([getProducts(), getNewsCategories()]);

  return (
    <main className="page-shell">
      <SiteHeader />
      <RequireAuth>
        <SavedItemsClient products={products} categories={categories} />
      </RequireAuth>
      <SiteFooter />
    </main>
  );
}
