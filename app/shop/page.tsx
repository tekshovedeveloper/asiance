import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProductCard } from '@/components/ProductCard';
import { getProductCategories, getProducts, type ProductSortOption } from '@/lib/api';
import { ShopSortSelect } from '@/components/shop/ShopSortSelect';

const sortOptions = ['default', 'popularity', 'rating', 'latest', 'price-asc', 'price-desc'] as const;

type ShopSearchParams = {
  category?: string | string[];
  sort?: string | string[];
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parseSort(value?: string | string[]): ProductSortOption {
  const sort = firstParam(value);
  return sort && (sortOptions as readonly string[]).includes(sort) ? (sort as ProductSortOption) : 'default';
}

function shopHref(category: string | null, sort: ProductSortOption) {
  const params = new URLSearchParams();

  if (category) params.set('category', category);
  if (sort !== 'default') params.set('sort', sort);

  const query = params.toString();
  return query ? `/shop?${query}` : '/shop';
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<ShopSearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = firstParam(resolvedSearchParams.category) ?? '';
  const selectedSort = parseSort(resolvedSearchParams.sort);
  const [products, categories] = await Promise.all([
    getProducts({ category: selectedCategory || undefined, sort: selectedSort }),
    getProductCategories(),
  ]);
  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  return (
    <main>
      <SiteHeader active="Shop" />
      <section className="shop-hero">
        <div className="breadcrumb">shop / {activeCategory?.name ?? 'all the things'}</div>
        <h1>
          the <em>edit.</em>
        </h1>
        <p className="page-copy">Editorial product listing with generous imagery and quiet filters.</p>
      </section>
      <div className="shop-filter-toolbar">
        <div className="shop-category-pills" aria-label="Product categories">
          <Link className={`pill ${!selectedCategory ? 'active' : ''}`} href={shopHref(null, selectedSort)}>
            All
          </Link>
          {categories.map((category) => (
            <Link
              className={`pill ${selectedCategory === category.slug ? 'active' : ''}`}
              href={shopHref(category.slug, selectedSort)}
              key={category.slug}
            >
              {category.name}
            </Link>
          ))}
        </div>
        <ShopSortSelect value={selectedSort} />
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        {products.length ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard product={product} key={product.slug} />
            ))}
          </div>
        ) : (
          <div className="shop-empty-state">
            <p>No products found{activeCategory ? ` in ${activeCategory.name}` : ''}.</p>
            <Link className="text-link" href="/shop">View all products</Link>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}
