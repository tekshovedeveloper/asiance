import type { Product } from '@/lib/types';
import { products as fallbackProducts } from '@/lib/mock-data';
import type { AttributeForm, ProductForm, Taxonomy, TaxonomyForm } from './types';

export const emptyProductForm: ProductForm = {
  name: '',
  slug: '',
  sku: '',
  regularPrice: '',
  salePrice: '',
  stock: '10',
  stockManagement: false,
  stockStatus: 'instock',
  soldIndividually: false,
  weight: '0',
  length: '',
  width: '',
  height: '',
  shippingClass: '',
  upsells: '',
  crossSells: '',
  attributeName: '',
  attributeValues: '',
  attributeVisible: true,
  purchaseNote: '',
  menuOrder: '0',
  enableReviews: true,
  availableForPos: true,
  categorySlug: '',
  tagInput: '',
  brandSlugs: [],
  image: '',
  galleryInput: '',
  shortDescription: '',
  description: '',
  type: 'simple',
  virtual: false,
  downloadable: false,
  status: 'active',
  productAttributes: [],
  productVariations: [],
  details: [],
};

export const emptyTaxonomyForm: TaxonomyForm = {
  name: '',
  slug: '',
  parentSlug: '',
  description: '',
  image: '',
  displayType: 'default',
};

export const emptyAttributeForm: AttributeForm = {
  name: '',
  slug: '',
  enableArchives: false,
  sortOrder: 'menu_order',
  terms: '',
};

export const fallbackCategories: Taxonomy[] = Array.from(
  new Map(fallbackProducts.map((product) => [product.category.toLowerCase().replace(/\s+/g, '-'), product.category])).entries(),
).map(([slug, name]) => ({
  name,
  slug,
  count: fallbackProducts.filter((product) => product.category === name).length,
}));

export function formatDate(value?: string) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return 'Published';
  const time = date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `Published ${date.toLocaleDateString('en-CA').replace(/-/g, '/')} at ${time}`;
}

export function money(value?: number) {
  return `Rs ${Number(value ?? 0).toLocaleString()}`;
}

export function commaList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export function productImage(product: Product) {
  return product.image || '/assets/placeholder-product.jpg';
}
