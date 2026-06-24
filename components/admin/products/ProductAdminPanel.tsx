'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/lib/api';
import { products as fallbackProducts } from '@/lib/mock-data';
import type { Product } from '@/lib/types';
import { AttributeScreen } from './AttributeScreen';
import { ProductAdminNotices } from './ProductAdminNotices';
import { ProductEditScreen } from './ProductEditScreen';
import { ProductListScreen } from './ProductListScreen';
import { ProductModuleNav } from './ProductModuleNav';
import { TaxonomyScreen } from './TaxonomyScreen';
import type { ProductDataTab } from './types';
import type { Attribute, AttributeForm, ProductForm, ProductListMode, ProductView, Taxonomy, TaxonomyForm } from './types';
import { commaList, emptyAttributeForm, emptyProductForm, emptyTaxonomyForm, fallbackCategories } from './utils';

type Props = {
  token: string;
  onChanged?: () => Promise<void> | void;
};

export function ProductAdminPanel({ token, onChanged }: Props) {
  const [activeView, setActiveView] = useState<ProductView>('product-list');
  const [status, setStatus] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [categories, setCategories] = useState<Taxonomy[]>(fallbackCategories);
  const [brands, setBrands] = useState<Taxonomy[]>([]);
  const [tags, setTags] = useState<Taxonomy[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [editingProductSlug, setEditingProductSlug] = useState('');
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [taxonomyForm, setTaxonomyForm] = useState<TaxonomyForm>(emptyTaxonomyForm);
  const [editingTaxonomySlug, setEditingTaxonomySlug] = useState('');
  const [attributeForm, setAttributeForm] = useState<AttributeForm>(emptyAttributeForm);
  const [editingAttributeSlug, setEditingAttributeSlug] = useState('');
  const [listMode, setListMode] = useState<ProductListMode>('all');
  const [allCount, setAllCount] = useState(0);
const [publishedCount, setPublishedCount] = useState(0);
const [trashCount, setTrashCount] = useState(0);
const [activeTab, setActiveTab] = useState<ProductDataTab>('general');

  useEffect(() => {
    void loadProducts(token);
  }, [token]);

  async function loadProducts(authToken = token, mode: ProductListMode = listMode) {
    try {
      const productStatusQuery =
        mode === 'trash'
          ? '&status=trash'
          : mode === 'published'
            ? '&status=published'
            : '';
  
      const [productResponse, categoryResponse, brandResponse, tagResponse, attributeResponse] = await Promise.all([
        fetch(`${API_URL}/shop/products?admin=true${productStatusQuery}`, {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
        }),
        fetch(`${API_URL}/shop/categories`),
        fetch(`${API_URL}/shop/brands`),
        fetch(`${API_URL}/shop/tags`),
        fetch(`${API_URL}/shop/attributes`),
      ]);
  
      if (!productResponse.ok) throw new Error('Products failed');
  
      setProducts(await productResponse.json());

const [allCountResponse, publishedCountResponse, trashCountResponse] = await Promise.all([
  fetch(`${API_URL}/shop/products?admin=true`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  }),
  fetch(`${API_URL}/shop/products?admin=true&status=published`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  }),
  fetch(`${API_URL}/shop/products?admin=true&status=trash`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  }),
]);

if (allCountResponse.ok) {
  const allProducts = await allCountResponse.json();
  setAllCount(allProducts.length);
}

if (publishedCountResponse.ok) {
  const publishedProducts = await publishedCountResponse.json();
  setPublishedCount(publishedProducts.length);
}

if (trashCountResponse.ok) {
  const trashProducts = await trashCountResponse.json();
  setTrashCount(trashProducts.length);
}


  
      if (categoryResponse.ok) setCategories(await categoryResponse.json());
      if (brandResponse.ok) setBrands(await brandResponse.json());
      if (tagResponse.ok) setTags(await tagResponse.json());
      if (attributeResponse.ok) setAttributes(await attributeResponse.json());
    } catch {
      setProducts(fallbackProducts);
      setCategories(fallbackCategories);
      setStatus('Showing fallback products. Start the API and seed MongoDB to use live admin data.');
    }
  }

  function authHeaders(authToken = token) {
    return {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
  }

  async function refreshAll() {
    await loadProducts();
    await onChanged?.();
  }

  async function uploadImageFile(file: File) {
    if (!token) {
      setStatus('Login as admin to upload images.');
      throw new Error('No token');
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/library/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      if (!data?.url) throw new Error('Invalid upload response');
      setStatus('Image uploaded successfully.');
      return data.url as string;
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImageFile(file);
      setProductForm((current) => ({ ...current, image: url }));
      setTaxonomyForm((current) => ({ ...current, image: url }));
    } catch {
      setStatus('Image upload failed. Check backend and admin login.');
    }
  }

  async function handleGalleryImages(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
  
    if (!files.length) return;
  
    setUploadingGallery(true);
  
    try {
      const uploadedUrls: string[] = [];
  
      for (const file of files) {
        const url = await uploadImageFile(file);
        uploadedUrls.push(url);
      }
  
      setProductForm((current) => {
        const existingUrls = current.galleryInput
          ? current.galleryInput
              .split(/\n|,/)
              .map((url) => url.trim())
              .filter(Boolean)
          : [];
  
        return {
          ...current,
          galleryInput: [...existingUrls, ...uploadedUrls].join('\n'),
        };
      });
  
      setStatus('Gallery images uploaded successfully.');
    } catch {
      setStatus('Gallery images could not be uploaded.');
    } finally {
      setUploadingGallery(false);
      input.value = '';
    }
  }



  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const productTags = product.tags ?? [];
      const productBrands = product.brands ?? [];
      const matchesSearch = q
        ? [product.name, product.sku, product.category, product.description, ...productTags, ...productBrands]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
        : true;
      const matchesCategory = categoryFilter ? product.categorySlug === categoryFilter || product.category === categoryFilter : true;
      const matchesStock = stockFilter ? (product.stockStatus ?? 'instock') === stockFilter : true;
      const matchesBrand = brandFilter ? productBrands.includes(brandFilter) : true;
      return matchesSearch && matchesCategory && matchesStock && matchesBrand;
    });
  }, [brandFilter, categoryFilter, products, searchTerm, stockFilter]);

  const selectedOnPage = filteredProducts.length > 0 && filteredProducts.every((product) => selectedProducts.includes(product.slug));

  function resetProductForm() {
    setEditingProductSlug('');
    setProductForm({ ...emptyProductForm, categorySlug: categories[0]?.slug ?? '' });
  }

  function resetTaxonomyForm() {
    setEditingTaxonomySlug('');
    setTaxonomyForm(emptyTaxonomyForm);
  }

  function openAddProduct() {
    resetProductForm();
    setActiveView('product-add');
  }

  function editProduct(product: Product) {
    setEditingProductSlug(product.slug);
    setProductForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku ?? '',
      regularPrice: String(product.price ?? ''),
      salePrice: product.salePrice ? String(product.salePrice) : '',
      stock: String(product.stock ?? 0),
      stockManagement: Boolean(product.stockManagement),
      stockStatus: product.stockStatus ?? 'instock',
      soldIndividually: Boolean(product.soldIndividually),
      weight: product.weight ?? '0',
      length: product.length ?? '',
      width: product.width ?? '',
      height: product.height ?? '',
      shippingClass: product.shippingClass ?? '',
      upsells: product.upsells ?? '',
      crossSells: product.crossSells ?? '',
      attributeName: product.attributeName ?? '',
      attributeValues: product.attributeValues ?? '',
      attributeVisible: product.attributeVisible ?? true,
      purchaseNote: product.purchaseNote ?? '',
      menuOrder: String(product.menuOrder ?? 0),
      enableReviews: product.enableReviews ?? true,
      availableForPos: product.availableForPos ?? true,
      categorySlug: product.categorySlug ?? categories.find((category) => category.name === product.category)?.slug ?? '',
      tagInput: (product.tags ?? []).join(', '),
      brandSlugs: product.brands ?? [],
      image: product.image ?? '',
      galleryInput: (product.images ?? []).join('\n'),
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      type: product.type ?? 'simple',
      virtual: Boolean(product.virtual),
      downloadable: Boolean(product.downloadable),
      status: product.status === 'draft' ? 'draft' : 'active',
      
      productAttributes: (product.attributes ?? []).map((attribute, index) => ({
        id: `${Date.now()}-${index}`,
        name: attribute.name,
        values: attribute.values.join(' | '),
        visible: attribute.visible,
        variation: attribute.variation,
        open: false,
      })),

      productVariations: (product.variations ?? []).map((variation, index) => ({
        id: variation.id ?? `${Date.now()}-${index}`,
        name: variation.name,
        attributes: variation.attributes ?? {},
        sku: variation.sku ?? '',
        regularPrice: variation.price ? String(variation.price) : '',
        salePrice: variation.salePrice ? String(variation.salePrice) : '',
        stock: variation.stock ? String(variation.stock) : '0',
        stockStatus: variation.stockStatus ?? 'instock',
        image: variation.image ?? '',
        enabled: variation.enabled ?? true,
        open: false,
      })),

      details: (product.details ?? []).map((detail, index) => ({
        id: `${Date.now()}-${index}`,
        title: detail.title,
        description: detail.description,
        open: index === 0,
      })),
    });
    setActiveView('product-add');
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save products.');
      return;
    }

    const galleryImages = productForm.galleryInput
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);

    const category = categories.find((item) => item.slug === productForm.categorySlug);
    const payload = {
      name: productForm.name,
      slug: productForm.slug || undefined,
      sku: productForm.sku,
      category: category?.name || productForm.categorySlug || 'Uncategorized',
      categorySlug: productForm.categorySlug || category?.slug,
      price: Number(productForm.regularPrice) || 0,
      salePrice: productForm.salePrice ? Number(productForm.salePrice) : undefined,
      stock: Number(productForm.stock) || 0,
      stockManagement: productForm.stockManagement,
      stockStatus: productForm.stockStatus,
      soldIndividually: productForm.soldIndividually,
      weight: productForm.weight,
      length: productForm.length,
      width: productForm.width,
      height: productForm.height,
      shippingClass: productForm.shippingClass,
      upsells: productForm.upsells,
      crossSells: productForm.crossSells,
      attributeName: productForm.attributeName,
      attributeValues: productForm.attributeValues,
      attributeVisible: productForm.attributeVisible,
      purchaseNote: productForm.purchaseNote,
      menuOrder: Number(productForm.menuOrder) || 0,
      enableReviews: productForm.enableReviews,
      availableForPos: productForm.availableForPos,
      type: productForm.type,
      virtual: productForm.virtual,
      downloadable: productForm.downloadable,
      image: productForm.image,
      images: galleryImages,
      tags: commaList(productForm.tagInput),
      brands: productForm.brandSlugs,
      description: productForm.description,
      shortDescription: productForm.shortDescription,
      status: productForm.status,

      attributes: productForm.productAttributes.map((attribute) => ({
        name: attribute.name,
        values: attribute.values
          .split('|')
          .map((value) => value.trim())
          .filter(Boolean),
        visible: attribute.visible,
        variation: attribute.variation,
      })),

      variations: productForm.productVariations.map((variation) => ({
        id: variation.id,
        name: variation.name,
        attributes: variation.attributes,
        sku: variation.sku,
        price: Number(variation.regularPrice) || 0,
        salePrice: variation.salePrice ? Number(variation.salePrice) : undefined,
        stock: Number(variation.stock) || 0,
        stockStatus: variation.stockStatus,
        image: variation.image,
        enabled: variation.enabled,
      })),


      details: productForm.details
      .map((detail) => ({
        title: detail.title.trim(),
        description: detail.description.trim(),
      }))
      .filter((detail) => detail.title || detail.description),

    };

    try {
      const response = await fetch(`${API_URL}/shop/products${editingProductSlug ? `/${editingProductSlug}` : ''}`, {
        method: editingProductSlug ? 'PATCH' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Save failed');
      setStatus(editingProductSlug ? 'Product updated.' : 'Product published.');
      resetProductForm();
      setActiveView('product-list');
      await refreshAll();
    } catch {
      setStatus('Product was not saved. Check admin login, API, and MongoDB connection.');
    }
  }

  async function deleteProduct(slug: string, confirmDelete = true) {
    if (confirmDelete && !window.confirm('Move this product to Trash?')) return false;
  
    try {
      const response = await fetch(`${API_URL}/shop/products/${slug}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
  
      if (!response.ok) throw new Error('Delete failed');
  
      setStatus('Product moved to Trash.');
      await loadProducts(token, listMode);
      return true;
    } catch {
      setStatus('Product was not moved to Trash. Check API connection.');
      return false;
    }
  }

  async function restoreProduct(slug: string) {
    if (!window.confirm('Restore this product?')) return;
  
    try {
      const response = await fetch(`${API_URL}/shop/products/${slug}/restore`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
  
      if (!response.ok) throw new Error('Restore failed');
  
      setStatus('Product restored.');
      await loadProducts(token, listMode);
    } catch {
      setStatus('Product was not restored. Check API connection.');
    }
  }
  
  async function permanentDeleteProduct(slug: string) {
    if (!window.confirm('Delete this product permanently? This cannot be undone.')) return;
  
    try {
      const response = await fetch(`${API_URL}/shop/products/${slug}/permanent`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
  
      if (!response.ok) throw new Error('Permanent delete failed');
  
      setStatus('Product deleted permanently.');
      await loadProducts(token, listMode);
    } catch {
      setStatus('Product was not deleted permanently. Check API connection.');
    }
  }
  
  function changeListMode(mode: ProductListMode) {
    setListMode(mode);
    setSelectedProducts([]);
    void loadProducts(token, mode);
  }

  async function applyBulkAction() {
    if (!selectedProducts.length) return;
  
    if (bulkAction === 'trash') {
      const ok = window.confirm(`Move ${selectedProducts.length} product(s) to Trash?`);
      if (!ok) return;
  
      await Promise.all(selectedProducts.map((slug) => deleteProduct(slug, false)));
  
      setSelectedProducts([]);
      setBulkAction('');
      setStatus('Selected products moved to Trash.');
      await loadProducts(token, listMode);
    }
  
    if (bulkAction === 'restore') {
      const ok = window.confirm(`Restore ${selectedProducts.length} product(s)?`);
      if (!ok) return;
  
      await Promise.all(
        selectedProducts.map((slug) =>
          fetch(`${API_URL}/shop/products/${slug}/restore`, {
            method: 'PATCH',
            headers: authHeaders(),
          }),
        ),
      );
  
      setSelectedProducts([]);
      setBulkAction('');
      setStatus('Selected products restored.');
      await loadProducts(token, listMode);
    }
  
    if (bulkAction === 'delete-permanent') {
      const ok = window.confirm(`Delete ${selectedProducts.length} product(s) permanently? This cannot be undone.`);
      if (!ok) return;
  
      await Promise.all(
        selectedProducts.map((slug) =>
          fetch(`${API_URL}/shop/products/${slug}/permanent`, {
            method: 'DELETE',
            headers: authHeaders(),
          }),
        ),
      );
  
      setSelectedProducts([]);
      setBulkAction('');
      setStatus('Selected products deleted permanently.');
      await loadProducts(token, listMode);
    }
  }

  function toggleSelection(slug: string) {
    setSelectedProducts((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  function togglePageSelection() {
    const slugs = filteredProducts.map((product) => product.slug);
    setSelectedProducts((current) =>
      selectedOnPage ? current.filter((slug) => !slugs.includes(slug)) : Array.from(new Set([...current, ...slugs])),
    );
  }

  async function saveTaxonomy(kind: 'categories' | 'brands' | 'tags', event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save terms.');
      return;
    }

    const payload = {
      name: taxonomyForm.name,
      slug: taxonomyForm.slug || undefined,
      parentSlug: taxonomyForm.parentSlug,
      description: taxonomyForm.description,
      image: taxonomyForm.image,
      displayType: taxonomyForm.displayType,
    };

    try {
      const response = await fetch(`${API_URL}/shop/${kind}${editingTaxonomySlug ? `/${editingTaxonomySlug}` : ''}`, {
        method: editingTaxonomySlug ? 'PATCH' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Taxonomy failed');
      setTaxonomyForm(emptyTaxonomyForm);
      setEditingTaxonomySlug('');
      setStatus('Saved.');
      await refreshAll();
    } catch {
      setStatus('Could not save. Check API connection.');
    }
  }

  async function deleteTaxonomy(kind: 'categories' | 'brands' | 'tags', slug: string) {
    if (!token) {
      setStatus('Login as admin to delete terms.');
      return;
    }

    if (!window.confirm('Delete this item? Products will remain, but this term is removed.')) return;

    try {
      await fetch(`${API_URL}/shop/${kind}/${slug}`, { method: 'DELETE', headers: authHeaders() });
      await refreshAll();
    } catch {
      setStatus('Could not delete term.');
    }
  }

  function editTaxonomy(item: Taxonomy) {
    setEditingTaxonomySlug(item.slug);
    setTaxonomyForm({
      name: item.name,
      slug: item.slug,
      parentSlug: item.parentSlug ?? '',
      description: item.description ?? '',
      image: item.image ?? '',
      displayType: item.displayType ?? 'default',
    });
  }

  async function saveAttribute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setStatus('Login as admin to save attributes.');
      return;
    }

    const payload = {
      name: attributeForm.name,
      slug: attributeForm.slug || undefined,
      enableArchives: attributeForm.enableArchives,
      sortOrder: attributeForm.sortOrder,
      terms: commaList(attributeForm.terms),
    };

    try {
      const response = await fetch(`${API_URL}/shop/attributes${editingAttributeSlug ? `/${editingAttributeSlug}` : ''}`, {
        method: editingAttributeSlug ? 'PATCH' : 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Attribute failed');
      setAttributeForm(emptyAttributeForm);
      setEditingAttributeSlug('');
      await refreshAll();
      setStatus('Attribute saved.');
    } catch {
      setStatus('Could not save attribute.');
    }
  }

  async function deleteAttribute(slug: string) {
    if (!token) {
      setStatus('Login as admin to delete attributes.');
      return;
    }

    if (!window.confirm('Delete this attribute?')) return;
    await fetch(`${API_URL}/shop/attributes/${slug}`, { method: 'DELETE', headers: authHeaders() });
    await refreshAll();
  }

  return (
    <section className="product-module-shell">
      <ProductModuleNav activeView={activeView} setView={setActiveView} openAddProduct={openAddProduct} />
      {/* <ProductAdminNotices status={status} /> */}

      {activeView === 'product-list' ? (
        <ProductListScreen
        listMode={listMode}
          products={products}
          filteredProducts={filteredProducts}
          categories={categories}
          brands={brands}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          stockFilter={stockFilter}
          setStockFilter={setStockFilter}
          brandFilter={brandFilter}
          setBrandFilter={setBrandFilter}
          bulkAction={bulkAction}
          setBulkAction={setBulkAction}
          selectedProducts={selectedProducts}
          selectedOnPage={selectedOnPage}
          allCount={allCount}
publishedCount={publishedCount}
trashCount={trashCount}
          handlers={{ editProduct, deleteProduct, applyBulkAction, toggleSelection, togglePageSelection, restoreProduct, permanentDeleteProduct, changeListMode, }}
        />
      ) : null}

{activeView === 'product-add' ? (
  <ProductEditScreen
  editingProductSlug={editingProductSlug}
  form={productForm}
  setForm={setProductForm}
  categories={categories}
  brands={brands}
  uploadingImage={uploadingImage}
  uploadingGallery={uploadingGallery}
  saveProduct={saveProduct}
  handleProductImage={handleProductImage}
  handleGalleryImages={handleGalleryImages}
  setView={setActiveView}
/>
) : null}

      {activeView === 'product-categories' ? (
        <TaxonomyScreen
          title="Product categories"
          button={editingTaxonomySlug ? 'Update category' : 'Add new category'}
          searchLabel="categories"
          items={categories}
          form={taxonomyForm}
          setForm={setTaxonomyForm}
          onSubmit={(event) => saveTaxonomy('categories', event)}
          onEdit={editTaxonomy}
          onDelete={(slug) => deleteTaxonomy('categories', slug)}
          showDisplayType
        />
      ) : null}

      {activeView === 'product-brands' ? (
        <TaxonomyScreen
          title="Brands"
          button={editingTaxonomySlug ? 'Update Brand' : 'Add New Brand'}
          searchLabel="brands"
          items={brands}
          form={taxonomyForm}
          setForm={setTaxonomyForm}
          onSubmit={(event) => saveTaxonomy('brands', event)}
          onEdit={editTaxonomy}
          onDelete={(slug) => deleteTaxonomy('brands', slug)}
        />
      ) : null}

      {activeView === 'product-tags' ? (
        <TaxonomyScreen
          title="Product tags"
          button={editingTaxonomySlug ? 'Update tag' : 'Add new tag'}
          searchLabel="tags"
          items={tags}
          form={taxonomyForm}
          setForm={setTaxonomyForm}
          onSubmit={(event) => saveTaxonomy('tags', event)}
          onEdit={editTaxonomy}
          onDelete={(slug) => deleteTaxonomy('tags', slug)}
          hideParent
        />
      ) : null}

      {activeView === 'product-attributes' ? (
        <AttributeScreen
          attributes={attributes}
          form={attributeForm}
          setForm={setAttributeForm}
          onSubmit={saveAttribute}
          onEdit={(item) => {
            setEditingAttributeSlug(item.slug);
            setAttributeForm({
              name: item.name,
              slug: item.slug,
              enableArchives: Boolean(item.enableArchives),
              sortOrder: item.sortOrder ?? 'menu_order',
              terms: item.terms?.join(', ') ?? '',
            });
          }}
          onDelete={deleteAttribute}
        />
      ) : null}
    </section>
  );
}
