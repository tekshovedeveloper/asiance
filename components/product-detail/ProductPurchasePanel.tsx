// 'use client';

// import { useMemo, useState } from 'react';
// import { AddToCartButton } from '@/components/cart/AddToCartButton';
// import styles from './ProductDetail.module.css';
// import type { ProductAttribute, ProductDetailProduct } from './types';

// type ProductPurchasePanelProps = {
//   product: ProductDetailProduct;
//   onPriceChange: (price: number) => void;
// };

// function normalizeAttributes(product: ProductDetailProduct): ProductAttribute[] {
//   if (!product.attributes || product.attributes.length === 0) {
//     return [];
//   }

//   return product.attributes
//     .map((attribute) => ({
//       name: attribute.name.toLowerCase(),
//       values: attribute.values || [],
//     }))
//     .filter((attribute) => attribute.name && attribute.values.length > 0);
// }

// function formatLabel(value: string) {
//   return value.charAt(0).toUpperCase() + value.slice(1);
// }

// function getPriceForSelection(
//     product: ProductDetailProduct,
//     selectedValues: Record<string, string>,
//   ) {
//     const selectedSize = selectedValues.size;
//     const selectedColor = selectedValues.color;
  
//     const matchedVariant = product.variants?.find((variant) => {
//       const sizeMatches = !variant.size || variant.size === selectedSize;
//       const colorMatches = !variant.color || variant.color === selectedColor;
  
//       return sizeMatches && colorMatches;
//     });
  
//     if (matchedVariant) {
//       return matchedVariant.salePrice ?? matchedVariant.price;
//     }
  
//     if (selectedSize === '50ml') return 350;
//     if (selectedSize === '100ml') return 400;
  
//     return product.salePrice ?? product.price;
//   }

// export function ProductPurchasePanel({
//   product,
//   onPriceChange,
// }: ProductPurchasePanelProps) {
//   const attributes = useMemo(() => normalizeAttributes(product), [product]);

//   const [activeAttributeName, setActiveAttributeName] = useState(
//     attributes[0]?.name ?? '',
//   );

//   const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() => {
//     return attributes.reduce<Record<string, string>>((result, attribute) => {
//       result[attribute.name] = attribute.values[0];
//       return result;
//     }, {});
//   });

//   const activeAttribute = attributes.find(
//     (attribute) => attribute.name === activeAttributeName,
//   );

//   function handleValueClick(attributeName: string, value: string) {
//     const nextSelectedValues = {
//       ...selectedValues,
//       [attributeName]: value,
//     };

//     setSelectedValues(nextSelectedValues);

//     const nextPrice = getPriceForSelection(product, nextSelectedValues);
//     onPriceChange(nextPrice);
//   }

//   return (
//     <aside className={styles.purchasePanel}>
//       {attributes.length > 0 ? (
//         <>
//           <div className={styles.attributeTabList}>
//             {attributes.map((attribute) => (
//               <button
//                 key={attribute.name}
//                 type="button"
//                 className={`${styles.attributeTabButton} ${
//                   activeAttributeName === attribute.name
//                     ? styles.attributeTabButtonActive
//                     : ''
//                 }`}
//                 onClick={() => setActiveAttributeName(attribute.name)}
//               >
//                 {formatLabel(attribute.name)}
//               </button>
//             ))}
//           </div>

//           {activeAttribute ? (
//             <div className={styles.attributeValueList}>
//               {activeAttribute.values.map((value) => (
//                 <button
//                   key={value}
//                   type="button"
//                   className={`${styles.attributeValueButton} ${
//                     selectedValues[activeAttribute.name] === value
//                       ? styles.attributeValueButtonActive
//                       : ''
//                   }`}
//                   onClick={() => handleValueClick(activeAttribute.name, value)}
//                 >
//                   {value}
//                 </button>
//               ))}
//             </div>
//           ) : null}

//           <div className={styles.divider} />
//         </>
//       ) : null}

//       <div className={styles.actions}>
//         <AddToCartButton product={product} />

//         <button type="button" className={styles.wishlistButton}>
//           add to wishlist
//         </button>
//       </div>
//     </aside>
//   );
// }





'use client';

import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import type { Product } from '@/lib/types';
import styles from './ProductDetail.module.css';
import type {
  ProductAttribute,
  ProductDetailProduct,
  ProductVariation,
} from './types';

type ProductPurchasePanelProps = {
  product: ProductDetailProduct;
  attributes: ProductAttribute[];
  selectedValues: Record<string, string>;
  setSelectedValues: Dispatch<SetStateAction<Record<string, string>>>;
  selectedVariation?: ProductVariation;
  selectedPrice: number;
  selectedImage?: string;
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function ProductPurchasePanel({
  product,
  attributes,
  selectedValues,
  setSelectedValues,
  selectedVariation,
  selectedPrice,
  selectedImage,
}: ProductPurchasePanelProps) {
  const [activeAttributeName, setActiveAttributeName] = useState(
    attributes[0]?.name ?? '',
  );

  const activeAttribute =
    attributes.find((attribute) => attribute.name === activeAttributeName) ??
    attributes[0];

  const isOutOfStock =
    selectedVariation?.stockStatus === 'outofstock' ||
    product.stockStatus === 'outofstock';

  function handleValueClick(attributeName: string, value: string) {
    setSelectedValues((current) => ({
      ...current,
      [attributeName]: value,
    }));
  }

  const cartProduct: Product = {
    ...(product as unknown as Product),
    id: String(product.id ?? product._id ?? ''),
    _id: String(product._id ?? product.id ?? ''),
    slug: product.slug ?? '',
    name: product.name,
    category: product.category ?? '',
    description: product.description ?? '',
    shortDescription: product.shortDescription ?? '',
    image: selectedImage || product.image,
    price: selectedPrice,
    salePrice: selectedPrice,
    stockStatus: product.stockStatus ?? 'instock',
    details: product.details,
    variations: product.variations as Product['variations'],
    attributes: product.attributes as Product['attributes'],
  };

  return (
    <aside className={styles.purchasePanel}>
      {attributes.length > 0 ? (
        <>
          <div className={styles.attributeTabList}>
            {attributes.map((attribute) => (
              <button
                key={attribute.name}
                type="button"
                className={`${styles.attributeTabButton} ${
                  activeAttributeName === attribute.name
                    ? styles.attributeTabButtonActive
                    : ''
                }`}
                onClick={() => setActiveAttributeName(attribute.name)}
              >
                {formatLabel(attribute.name)}
              </button>
            ))}
          </div>

          {activeAttribute ? (
            <div className={styles.attributeValueList}>
              {activeAttribute.values.map((value) => (
                <button
                  key={`${activeAttribute.name}-${value}`}
                  type="button"
                  className={`${styles.attributeValueButton} ${
                    selectedValues[activeAttribute.name] === value
                      ? styles.attributeValueButtonActive
                      : ''
                  }`}
                  onClick={() => handleValueClick(activeAttribute.name, value)}
                >
                  {value}
                </button>
              ))}
            </div>
          ) : null}

          {selectedVariation ? (
            <p className={isOutOfStock ? styles.stockOut : styles.stockIn}>
              {isOutOfStock ? 'Out of stock' : 'In stock'}
            </p>
          ) : null}

          <div className={styles.divider} />
        </>
      ) : null}

      <div className={styles.actions}>
        {isOutOfStock ? (
          <button type="button" className={styles.wishlistButton} disabled>
            out of stock
          </button>
        ) : (
          <AddToCartButton product={cartProduct} selectedValues={selectedValues} />
        )}

        <button type="button" className={styles.wishlistButton}>
          add to wishlist
        </button>
      </div>
    </aside>
  );
}