import type { ProductView } from './types';

const items: Array<{ view: ProductView; label: string }> = [
  { view: 'product-list', label: 'All Products' },
  { view: 'product-add', label: 'Add new product' },
  { view: 'product-brands', label: 'Brands' },
  { view: 'product-categories', label: 'Categories' },
  { view: 'product-tags', label: 'Tags' },
  { view: 'product-attributes', label: 'Attributes' },
];

export function ProductModuleNav({ activeView, setView, openAddProduct }: { activeView: ProductView; setView: (view: ProductView) => void; openAddProduct: () => void }) {
  return (
    <div className="product-module-nav">
      {items.map((item) => (
        <button
          key={item.view}
          className={activeView === item.view ? 'active' : ''}
          onClick={() => (item.view === 'product-add' ? openAddProduct() : setView(item.view))}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
