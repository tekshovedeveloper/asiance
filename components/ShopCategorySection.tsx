import Link from 'next/link';
import {
  Baby,
  Gem,
  HeartHandshake,
  HeartPulse,
  House,
  Plane,
  Shirt,
  ShoppingBag,
  Sparkles,
  Utensils,
  type LucideIcon,
} from 'lucide-react';

type ShopCategory = {
  label: string;
  slug: string;
  icon: LucideIcon;
  highlighted?: boolean;
};

const categories: ShopCategory[] = [
  { label: 'Beauty', slug: 'beauty', icon: Sparkles },
  { label: 'Fashion', slug: 'fashion', icon: Shirt },
  { label: 'Jewelry', slug: 'jewelry', icon: Gem },
  { label: 'Wedding', slug: 'wedding', icon: HeartHandshake },
  { label: 'Baby & Kids', slug: 'baby-kids', icon: Baby },
  { label: 'Home', slug: 'home', icon: House },
  { label: 'Travel', slug: 'travel', icon: Plane },
  { label: 'Food', slug: 'food', icon: Utensils },
  { label: 'Wellness', slug: 'wellness', icon: HeartPulse },
  { label: 'Sale', slug: 'sale', icon: ShoppingBag, highlighted: true },
];

export function ShopCategorySection() {
  return (
    <section className="shop-category-section" aria-labelledby="shop-category-title">
      <h2 id="shop-category-title">Shop by category</h2>
      <div className="shop-category-list">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              href={`/shop?category=${category.slug}`}
              className={`shop-category-item${category.highlighted ? ' is-highlighted' : ''}`}
              key={category.slug}
            >
              <span className="shop-category-item__icon" aria-hidden="true">
                <Icon size={34} strokeWidth={1.45} />
              </span>
              <span>{category.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
