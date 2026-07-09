// 'use client';

// import { useMemo, useState } from 'react';
// import { ProductInfo } from './ProductInfo';
// import { ProductGallery } from './ProductGallery';
// import { ProductPurchasePanel } from './ProductPurchasePanel';
// import styles from './ProductDetail.module.css';
// import type { ProductDetailProduct } from './types';

// type ProductDetailClientProps = {
//   product: ProductDetailProduct;
// };

// function getVariationAttributes(product: ProductDetailProduct) {
//   return (product.attributes ?? []).filter(
//     (attribute) => attribute.variation !== false && attribute.values?.length > 0,
//   );
// }

// function getInitialSelectedValues(product: ProductDetailProduct) {
//   const selectedValues: Record<string, string> = {};

//   getVariationAttributes(product).forEach((attribute) => {
//     selectedValues[attribute.name] = attribute.values[0];
//   });

//   return selectedValues;
// }

// export function ProductDetailClient({ product }: ProductDetailClientProps) {
//   const variationAttributes = useMemo(() => getVariationAttributes(product), [product]);

//   const variations = useMemo(
//     () => (product.variations ?? []).filter((variation) => variation.enabled !== false),
//     [product],
//   );

//   const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() =>
//     getInitialSelectedValues(product),
//   );

//   const selectedVariation = useMemo(() => {
//     return variations.find((variation) =>
//       variationAttributes.every(
//         (attribute) => variation.attributes?.[attribute.name] === selectedValues[attribute.name],
//       ),
//     );
//   }, [selectedValues, variationAttributes, variations]);

//   const selectedPrice =
//     selectedVariation?.salePrice ??
//     selectedVariation?.price ??
//     product.salePrice ??
//     product.price;

//   const selectedImage = selectedVariation?.image || product.image;

//   return (
//     <section className={styles.wrapper}>
//       <ProductInfo product={product} selectedPrice={selectedPrice} />
//       <ProductGallery product={product} activeImage={selectedImage} />

//       <ProductPurchasePanel
//         product={product}
//         attributes={variationAttributes}
//         selectedValues={selectedValues}
//         setSelectedValues={setSelectedValues}
//         selectedVariation={selectedVariation}
//         selectedPrice={selectedPrice}
//         selectedImage={selectedImage}
//       />
//     </section>
//   );
// }




// 'use client';

// import { useMemo, useState } from 'react';
// import { ProductInfo } from './ProductInfo';
// import { ProductGallery } from './ProductGallery';
// import { ProductPurchasePanel } from './ProductPurchasePanel';
// import styles from './ProductDetail.module.css';
// import type { ProductDetailProduct } from './types';

// type ProductDetailClientProps = {
//   product: ProductDetailProduct;
// };

// function normalizeKey(value: string) {
//   return value.trim().toLowerCase();
// }

// function normalizeValue(value: string) {
//   return String(value).trim().toLowerCase();
// }

// function getVariationAttributes(product: ProductDetailProduct) {
//   return (product.attributes ?? []).filter(
//     (attribute) => attribute.variation !== false && attribute.values?.length > 0,
//   );
// }

// function getInitialSelectedValues(product: ProductDetailProduct) {
//   const selectedValues: Record<string, string> = {};

//   getVariationAttributes(product).forEach((attribute) => {
//     selectedValues[attribute.name] = attribute.values[0];
//   });

//   return selectedValues;
// }

// function variationMatchesSelection(
//   variationAttributes: Record<string, string>,
//   selectedValues: Record<string, string>,
// ) {
//   const normalizedVariationAttributes: Record<string, string> = {};

//   Object.entries(variationAttributes ?? {}).forEach(([key, value]) => {
//     normalizedVariationAttributes[normalizeKey(key)] = normalizeValue(value);
//   });

//   return Object.entries(selectedValues).every(([selectedKey, selectedValue]) => {
//     const normalizedSelectedKey = normalizeKey(selectedKey);
//     const normalizedSelectedValue = normalizeValue(selectedValue);

//     return normalizedVariationAttributes[normalizedSelectedKey] === normalizedSelectedValue;
//   });
// }

// export function ProductDetailClient({ product }: ProductDetailClientProps) {
//   const variationAttributes = useMemo(() => getVariationAttributes(product), [product]);

//   const variations = useMemo(
//     () => (product.variations ?? []).filter((variation) => variation.enabled !== false),
//     [product],
//   );

//   const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() =>
//     getInitialSelectedValues(product),
//   );

//   const selectedVariation = useMemo(() => {
//     return variations.find((variation) =>
//       variationMatchesSelection(variation.attributes ?? {}, selectedValues),
//     );
//   }, [selectedValues, variations]);

//   const selectedPrice =
//     selectedVariation?.salePrice ??
//     selectedVariation?.price ??
//     product.salePrice ??
//     product.price;

//   const selectedImage = selectedVariation?.image || product.image;

//   return (
//     <section className={styles.wrapper}>
//       <ProductInfo product={product} selectedPrice={selectedPrice} />

//       <ProductGallery product={product} activeImage={selectedImage} />

//       <ProductPurchasePanel
//         product={product}
//         attributes={variationAttributes}
//         selectedValues={selectedValues}
//         setSelectedValues={setSelectedValues}
//         selectedVariation={selectedVariation}
//         selectedPrice={selectedPrice}
//         selectedImage={selectedImage}
//       />
//     </section>
//   );
// }















'use client';

import { useMemo, useState } from 'react';
import { ProductInfo } from './ProductInfo';
import { ProductGallery } from './ProductGallery';
import { ProductPurchasePanel } from './ProductPurchasePanel';
import styles from './ProductDetail.module.css';
import { ProductDetailsAccordion } from './ProductDetailsAccordion';
import type { ProductDetailProduct } from './types';

type ProductDetailClientProps = {
  product: ProductDetailProduct;
};

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function getVariationAttributes(product: ProductDetailProduct) {
  return (product.attributes ?? []).filter(
    (attribute) => attribute.variation !== false && attribute.values?.length > 0,
  );
}

function getInitialSelectedValues(product: ProductDetailProduct) {
  const selectedValues: Record<string, string> = {};

  getVariationAttributes(product).forEach((attribute) => {
    selectedValues[attribute.name] = attribute.values[0];
  });

  return selectedValues;
}

function getAliasKeys(key: string) {
  const normalizedKey = normalize(key);

  const aliases: Record<string, string[]> = {
    weight: ['weight', 'size'],
    size: ['size', 'weight'],
    color: ['color', 'colour'],
    colour: ['colour', 'color'],
  };

  return aliases[normalizedKey] ?? [normalizedKey];
}

function variationMatchesSelection(
  variation: {
    name?: string;
    attributes?: Record<string, string>;
  },
  selectedValues: Record<string, string>,
) {
  const variationAttributes = variation.attributes ?? {};

  const normalizedVariationAttributes: Record<string, string> = {};

  Object.entries(variationAttributes).forEach(([key, value]) => {
    normalizedVariationAttributes[normalize(key)] = normalize(value);
  });

  const variationValues = Object.values(normalizedVariationAttributes);
  const variationName = normalize(variation.name);

  return Object.entries(selectedValues).every(([selectedKey, selectedValue]) => {
    const normalizedSelectedValue = normalize(selectedValue);
    const possibleKeys = getAliasKeys(selectedKey);

    const keyMatch = possibleKeys.some((key) => {
      return normalizedVariationAttributes[key] === normalizedSelectedValue;
    });

    if (keyMatch) {
      return true;
    }

    const valueMatch = variationValues.includes(normalizedSelectedValue);

    if (valueMatch) {
      return true;
    }

    return variationName.includes(normalizedSelectedValue);
  });
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const variationAttributes = useMemo(() => getVariationAttributes(product), [product]);

  const variations = useMemo(
    () => (product.variations ?? []).filter((variation) => variation.enabled !== false),
    [product],
  );

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() =>
    getInitialSelectedValues(product),
  );

  const selectedVariation = useMemo(() => {
    return variations.find((variation) =>
      variationMatchesSelection(variation, selectedValues),
    );
  }, [selectedValues, variations]);

  const selectedPrice =
    selectedVariation?.salePrice ??
    selectedVariation?.price ??
    product.salePrice ??
    product.price;

  const selectedImage = selectedVariation?.image || product.image;

  return (
    <>
      <section className={styles.wrapper}>
        <ProductInfo product={product} selectedPrice={selectedPrice} />
  
        <ProductGallery product={product} activeImage={selectedImage} />
  
        <ProductPurchasePanel
          product={product}
          attributes={variationAttributes}
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
          selectedVariation={selectedVariation}
          selectedPrice={selectedPrice}
          selectedImage={selectedImage}
        />
      </section>
  
      <ProductDetailsAccordion details={product.details} />
    </>
  );
}









