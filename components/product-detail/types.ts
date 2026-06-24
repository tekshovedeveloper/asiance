export type ProductAttribute = {
  id?: string | number;
  name: string;
  values: string[];
  visible?: boolean;
  variation?: boolean;
};

export type ProductVariation = {
  id?: string | number;
  name?: string;
  attributes: Record<string, string>;
  sku?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  image?: string;
  enabled?: boolean;
};

export type ProductDetailProduct = {
  _id?: string;
  id?: string | number;
  slug?: string;
  name: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  image: string;
  images?: string[];
  price: number;
  salePrice?: number | null;
  color?: string;
  colors?: string[];
  size?: string;
  sizes?: string[];

  attributes?: ProductAttribute[];
  variations?: ProductVariation[];

  /* old fallback support */
  variants?: Array<{
    id?: string | number;
    size?: string;
    color?: string;
    price: number;
    salePrice?: number | null;
  }>;

  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';


  details?: Array<{
    title: string;
    description: string;
  }>;
};