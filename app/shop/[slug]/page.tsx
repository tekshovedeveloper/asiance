// import { SiteHeader } from '@/components/SiteHeader';
// import { SiteFooter } from '@/components/SiteFooter';
// import { ProductDetailClient } from '@/components/product-detail/ProductDetailClient';
// import { getProduct } from '@/lib/api';
// import styles from '@/components/product-detail/ProductDetail.module.css';

// export default async function ProductPage({
//   params,
// }: {
//   params: Promise<{ slug: string }>;
// }) {
//   const { slug } = await params;
//   const product = await getProduct(slug);

//   return (
//     <main className={styles.page}>
//       <SiteHeader active="Shop" />

//       <ProductDetailClient product={product} />

//       <SiteFooter />
//     </main>
//   );
// }





import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ProductDetailClient } from '@/components/product-detail/ProductDetailClient';
import { getProduct } from '@/lib/api';
import styles from '@/components/product-detail/ProductDetail.module.css';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  console.log('PRODUCT API RESPONSE FROM /shop/[slug]/page.tsx:', JSON.stringify(product, null, 2));

  if (!product) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <SiteHeader active="Shop" />

      <ProductDetailClient product={product} />

      <SiteFooter />
    </main>
  );
}