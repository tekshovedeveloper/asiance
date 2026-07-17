'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ProductSortOption } from '@/lib/api';

const sortLabels: Record<ProductSortOption, string> = {
  default: 'Default sorting',
  popularity: 'Sort by popularity',
  rating: 'Sort by average rating',
  latest: 'Sort by latest',
  'price-asc': 'Sort by price: low to high',
  'price-desc': 'Sort by price: high to low',
};

const sortOptions = Object.entries(sortLabels) as Array<[ProductSortOption, string]>;

export function ShopSortSelect({ value }: { value: ProductSortOption }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateSort(nextSort: ProductSortOption) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextSort === 'default') {
      params.delete('sort');
    } else {
      params.set('sort', nextSort);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="shop-sort-control">
      <span>Sort</span>
      <select
        aria-label="Sort products"
        className="shop-sort-select"
        value={value}
        onChange={(event) => updateSort(event.target.value as ProductSortOption)}
      >
        {sortOptions.map(([optionValue, label]) => (
          <option value={optionValue} key={optionValue}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
