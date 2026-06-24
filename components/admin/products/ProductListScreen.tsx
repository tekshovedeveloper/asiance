// import type { Product } from '@/lib/types';
// import { ChevronDown, ChevronUp, ImageIcon, Search, Star } from 'lucide-react';
// import type { ProductListHandlers, Taxonomy } from './types';
// import { formatDate, money, productImage } from './utils';

// type Props = {
//   products: Product[];
//   filteredProducts: Product[];
//   categories: Taxonomy[];
//   brands: Taxonomy[];
//   searchTerm: string;
//   setSearchTerm: (value: string) => void;
//   categoryFilter: string;
//   setCategoryFilter: (value: string) => void;
//   stockFilter: string;
//   setStockFilter: (value: string) => void;
//   brandFilter: string;
//   setBrandFilter: (value: string) => void;
//   bulkAction: string;
//   setBulkAction: (value: string) => void;
//   selectedProducts: string[];
//   selectedOnPage: boolean;
//   handlers: ProductListHandlers;
// };

// export function ProductListScreen({
//   products,
//   filteredProducts,
//   categories,
//   brands,
//   searchTerm,
//   setSearchTerm,
//   categoryFilter,
//   setCategoryFilter,
//   stockFilter,
//   setStockFilter,
//   brandFilter,
//   setBrandFilter,
//   bulkAction,
//   setBulkAction,
//   selectedProducts,
//   selectedOnPage,
//   handlers,
// }: Props) {
//   return (
//     <section className="wp-list-screen products-list-screen">
//       <h1>Products</h1>

//       <div className="wp-list-top">
//         <div className="wp-view-links">
//           <button className="active" type="button">
//             All <span>({products.length})</span>
//           </button>
//           <span>|</span>
//           <button type="button">
//             Published <span>({products.filter((product) => product.status !== 'draft').length})</span>
//           </button>
         
//         </div>

//         <div className="wp-search">
//           <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
//           <button type="button">
//             <Search size={15} />
//             Search products
//           </button>
//         </div>
//       </div>

//       <div className="wp-toolbar">
//         <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
//           <option value="">Bulk actions</option>
//           <option value="trash">Move to Trash</option>
//         </select>
//         <button onClick={() => void handlers.applyBulkAction()} type="button">
//           Apply
//         </button>
//         <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
//           <option value="">Select a category</option>
//           {categories.map((category) => (
//             <option key={category.slug} value={category.slug}>{category.name}</option>
//           ))}
//         </select>
//         <select>
//           <option>Filter by product type</option>
//           <option>Simple product</option>
//           <option>Variable product</option>
//         </select>
//         <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
//           <option value="">Filter by stock status</option>
//           <option value="instock">In stock</option>
//           <option value="outofstock">Out of stock</option>
//           <option value="onbackorder">On backorder</option>
//         </select>
//         <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
//           <option value="">Filter by brand</option>
//           {brands.map((brand) => (
//             <option key={brand.slug} value={brand.slug}>{brand.name}</option>
//           ))}
//         </select>
//         <button type="button">Filter</button>
//         <span className="wp-items-count">{filteredProducts.length} items</span>
//       </div>

//       <div className="wp-table-wrap">
//         <table className="wp-news-table wp-products-table">
//           <thead>
//             <tr>
//               <th className="check-column"><input checked={selectedOnPage} onChange={handlers.togglePageSelection} type="checkbox" /></th>
//               <th className="image-column"><ImageIcon size={16} /></th>
//               <th>Name <ChevronUp size={12} /></th>
//               <th>SKU <ChevronUp size={12} /></th>
//               <th>Stock</th>
//               <th>Price <ChevronUp size={12} /></th>
//               <th>Categories</th>
//               <th>Tags</th>
//               <th>Brands</th>
//               <th><Star size={18} /></th>
//               <th>Date <ChevronDown size={12} /></th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredProducts.map((product) => (
//               <tr key={product.slug}>
//                 <td className="check-column">
//                   <input checked={selectedProducts.includes(product.slug)} onChange={() => handlers.toggleSelection(product.slug)} type="checkbox" />
//                 </td>
//                 <td className="image-column"><img src={productImage(product)} alt="" /></td>
//                 <td className="title-column">
//                   <button onClick={() => handlers.editProduct(product)} type="button">{product.name}</button>
//                   <div className="row-links">
//                     <span>ID: {product._id?.slice(-5) ?? 'new'}</span><span>|</span>
//                     <button onClick={() => handlers.editProduct(product)} type="button">Edit</button><span>|</span>
//                     <button onClick={() => void handlers.deleteProduct(product.slug)} type="button">Trash</button><span>|</span>
//                     <button
//   onClick={() => window.open(`/shop/${product.slug}`, '_blank')}
//   type="button"
// >
//   View
// </button>
                    
//                   </div>
//                 </td>
//                 <td>{product.sku || '–'}</td>
//                 <td><strong className={product.stockStatus === 'outofstock' ? 'stock-bad' : 'stock-ok'}>{product.stockStatus === 'outofstock' ? 'Out of stock' : 'In stock'}</strong></td>
//                 <td>{money(product.salePrice ?? product.price)}</td>
//                 <td className="link-blue">{product.category}</td>
//                 <td>{product.tags?.length ? product.tags.join(', ') : '–'}</td>
//                 <td>{product.brands?.length ? product.brands.join(', ') : '–'}</td>
//                 <td><Star className="star-outline" size={24} /></td>
//                 <td>{formatDate(product.createdAt)}</td>
//               </tr>
//             ))}
//             {!filteredProducts.length ? <tr><td colSpan={11}>No products found.</td></tr> : null}
//           </tbody>
//         </table>
//       </div>
//     </section>
//   );
// }












import type { Product } from '@/lib/types';
import { ChevronDown, ChevronUp, ImageIcon, Search, Star } from 'lucide-react';
import type { ProductListHandlers, ProductListMode, Taxonomy } from './types';
import { formatDate, money, productImage } from './utils';

type Props = {
  listMode: ProductListMode;
  products: Product[];
  filteredProducts: Product[];
  categories: Taxonomy[];
  brands: Taxonomy[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  stockFilter: string;
  setStockFilter: (value: string) => void;
  brandFilter: string;
  setBrandFilter: (value: string) => void;
  bulkAction: string;
  setBulkAction: (value: string) => void;
  selectedProducts: string[];
  selectedOnPage: boolean;
  handlers: ProductListHandlers;
  allCount: number;
publishedCount: number;
trashCount: number;
};

export function ProductListScreen({
  listMode,
  products,
  filteredProducts,
  categories,
  brands,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  stockFilter,
  setStockFilter,
  brandFilter,
  setBrandFilter,
  bulkAction,
  setBulkAction,
  selectedProducts,
  selectedOnPage,
  handlers,
  allCount,
publishedCount,
trashCount,
}: Props) {
  const isTrash = listMode === 'trash';

  return (
    <section className="wp-list-screen products-list-screen">
      <h1>Products</h1>

      <div className="wp-list-top">
        <div className="wp-view-links">
        <button
  className={listMode === 'all' ? 'active' : ''}
  onClick={() => handlers.changeListMode('all')}
  type="button"
>
  All <span>({allCount})</span>
</button>

<span>|</span>

<button
  className={listMode === 'published' ? 'active' : ''}
  onClick={() => handlers.changeListMode('published')}
  type="button"
>
  Published <span>({publishedCount})</span>
</button>

<span>|</span>

<button
  className={listMode === 'trash' ? 'active trash-link' : 'trash-link'}
  onClick={() => handlers.changeListMode('trash')}
  type="button"
>
  Trash <span>({trashCount})</span>
</button>
        </div>

        <div className="wp-search">
          <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />

          <button type="button">
            <Search size={15} />
            Search products
          </button>
        </div>
      </div>

      <div className="wp-toolbar">
        <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)}>
          <option value="">Bulk actions</option>

          {isTrash ? (
            <>
              <option value="restore">Restore</option>
              <option value="delete-permanent">Delete permanently</option>
            </>
          ) : (
            <option value="trash">Move to Trash</option>
          )}
        </select>

        <button onClick={() => void handlers.applyBulkAction()} type="button">
          Apply
        </button>

        {!isTrash ? (
          <>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>

            <select>
              <option>Filter by product type</option>
              <option>Simple product</option>
              <option>Variable product</option>
            </select>

            <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)}>
              <option value="">Filter by stock status</option>
              <option value="instock">In stock</option>
              <option value="outofstock">Out of stock</option>
              <option value="onbackorder">On backorder</option>
            </select>

            <select value={brandFilter} onChange={(event) => setBrandFilter(event.target.value)}>
              <option value="">Filter by brand</option>
              {brands.map((brand) => (
                <option key={brand.slug} value={brand.slug}>
                  {brand.name}
                </option>
              ))}
            </select>

            <button type="button">Filter</button>
          </>
        ) : null}

        <span className="wp-items-count">{filteredProducts.length} items</span>
      </div>

      <div className="wp-table-wrap">
        <table className="wp-news-table wp-products-table">
          <thead>
            <tr>
              <th className="check-column">
                <input checked={selectedOnPage} onChange={handlers.togglePageSelection} type="checkbox" />
              </th>

              <th className="image-column">
                <ImageIcon size={16} />
              </th>

              <th>
                Name <ChevronUp size={12} />
              </th>

              <th>
                SKU <ChevronUp size={12} />
              </th>

              <th>Stock</th>

              <th>
                Price <ChevronUp size={12} />
              </th>

              <th>Categories</th>
              <th>Tags</th>
              <th>Brands</th>

              <th>
                <Star size={18} />
              </th>

              <th>
                Date <ChevronDown size={12} />
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.slug}>
                <td className="check-column">
                  <input
                    checked={selectedProducts.includes(product.slug)}
                    onChange={() => handlers.toggleSelection(product.slug)}
                    type="checkbox"
                  />
                </td>

                <td className="image-column">
                  <img src={productImage(product)} alt="" />
                </td>

                <td className="title-column">
                  {isTrash ? (
                    <strong>{product.name}</strong>
                  ) : (
                    <button onClick={() => handlers.editProduct(product)} type="button">
                      {product.name}
                    </button>
                  )}

                  <div className="row-links">
                    <span>ID: {product._id?.slice(-5) ?? 'new'}</span>
                    <span>|</span>

                    {isTrash ? (
                      <>
                        <button
                          className="restore-link"
                          onClick={() => void handlers.restoreProduct(product.slug)}
                          type="button"
                        >
                          Restore
                        </button>

                        <span>|</span>

                        <button
                          className="delete-permanent-link"
                          onClick={() => void handlers.permanentDeleteProduct(product.slug)}
                          type="button"
                        >
                          Delete Permanently
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handlers.editProduct(product)} type="button">
                          Edit
                        </button>

                        <span>|</span>

                        <button onClick={() => void handlers.deleteProduct(product.slug)} type="button">
                          Trash
                        </button>

                        <span>|</span>

                        <button onClick={() => window.open(`/shop/${product.slug}`, '_blank')} type="button">
                          View
                        </button>
                      </>
                    )}
                  </div>
                </td>

                <td>{product.sku || '–'}</td>

                <td>
                  <strong className={product.stockStatus === 'outofstock' ? 'stock-bad' : 'stock-ok'}>
                    {product.stockStatus === 'outofstock' ? 'Out of stock' : 'In stock'}
                  </strong>
                </td>

                <td>{money(product.salePrice ?? product.price)}</td>

                <td className="link-blue">{product.category}</td>

                <td>{product.tags?.length ? product.tags.join(', ') : '–'}</td>

                <td>{product.brands?.length ? product.brands.join(', ') : '–'}</td>

                <td>
                  <Star className="star-outline" size={24} />
                </td>

                <td>{isTrash ? 'Last Modified' : formatDate(product.createdAt)}</td>
              </tr>
            ))}

            {!filteredProducts.length ? (
              <tr>
                <td colSpan={11}>
                  {isTrash ? 'Trash is empty.' : 'No products found.'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}