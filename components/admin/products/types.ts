import type { ChangeEvent, FormEvent } from 'react';
import type { Product } from '@/lib/types';

export type ProductView =
  | 'product-list'
  | 'product-trash'
  | 'product-add'
  | 'product-brands'
  | 'product-categories'
  | 'product-tags'
  | 'product-attributes';

export type ProductListMode = 'all' | 'published' | 'trash';


export type ProductDataTab =
  | 'general'
  | 'inventory'
  | 'shipping'
  | 'linked'
  | 'attributes'
  | 'variations'
  | 'advanced';

export type Taxonomy = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentSlug?: string;
  image?: string;
  displayType?: string;
  count?: number;
};

export type Attribute = {
  _id?: string;
  name: string;
  slug: string;
  enableArchives?: boolean;
  sortOrder?: string;
  terms?: string[];
};

export type ProductDetailRow = {
  id: string;
  title: string;
  description: string;
  open: boolean;
};

export type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  stockManagement: boolean;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  soldIndividually: boolean;
  weight: string;
  length: string;
  width: string;
  height: string;
  shippingClass: string;
  upsells: string;
  crossSells: string;
  attributeName: string;
  attributeValues: string;
  attributeVisible: boolean;
  purchaseNote: string;
  menuOrder: string;
  enableReviews: boolean;
  availableForPos: boolean;
  categorySlug: string;
  tagInput: string;
  brandSlugs: string[];
  image: string;
  galleryInput: string;
  shortDescription: string;
  description: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  virtual: boolean;
  downloadable: boolean;
  status: 'active' | 'draft';
  productAttributes: ProductAttributeRow[];
  productVariations: ProductVariationRow[];
  details: ProductDetailRow[];
};

export type TaxonomyForm = {
  name: string;
  slug: string;
  parentSlug: string;
  description: string;
  image: string;
  displayType: string;
};

export type AttributeForm = {
  name: string;
  slug: string;
  enableArchives: boolean;
  sortOrder: string;
  terms: string;
};



export type ProductAttributeRow = {
  id: string;
  name: string;
  values: string;
  visible: boolean;
  variation: boolean;
  open: boolean;
};

export type ProductVariationRow = {
  id: string;
  name: string;
  attributes: Record<string, string>;
  sku: string;
  regularPrice: string;
  salePrice: string;
  stock: string;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  image: string;
  enabled: boolean;
  open: boolean;
};



export type ProductEditHandlers = {
  setProductForm: (value: ProductForm | ((current: ProductForm) => ProductForm)) => void;
  saveProduct: (event: FormEvent<HTMLFormElement>) => void;

  handleProductImage: (event: ChangeEvent<HTMLInputElement>) => void;
  handleGalleryImages: (event: ChangeEvent<HTMLInputElement>) => void;

  setView: (view: ProductView) => void;

  restoreProduct: (slug: string) => Promise<void>;
  permanentDeleteProduct: (slug: string) => Promise<void>;
  changeListMode: (mode: ProductListMode) => void;
};



export type ProductListHandlers = {
  editProduct: (product: Product) => void;
  deleteProduct: (slug: string) => Promise<boolean>;
  restoreProduct: (slug: string) => Promise<void>;
  permanentDeleteProduct: (slug: string) => Promise<void>;
  applyBulkAction: () => Promise<void>;
  toggleSelection: (slug: string) => void;
  togglePageSelection: () => void;
  changeListMode: (mode: ProductListMode) => void;
};

