import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/lib/api';

export default async function ShopPage() {
  const products = await getProducts();
  const categories = ['All', ...Array.from(new Set(products.map((product) => product.category)))];

  return (
    <main>
      <SiteHeader active="Shop" />
      <section className="shop-hero">
        <div className="breadcrumb">shop / all the things</div>
        <h1>
          the <em>edit.</em>
        </h1>
        <p className="page-copy">Editorial product listing with generous imagery and quiet filters.</p>
      </section>
      <div className="shop-toolbar">
        {categories.map((category) => (
          <span className="pill" key={category}>
            {category}
          </span>
        ))}
      </div>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard product={product} key={product.slug} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
