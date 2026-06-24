import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { ProductDataTab, ProductForm, ProductView, Taxonomy } from './types';
import { EditorBox } from './EditorBox';
import { ProductDataBox } from './ProductDataBox';
import { ProductSideBoxes } from './ProductSideBoxes';
import { ProductDetailsBox } from './ProductDetailsBox';

type Props = {
  editingProductSlug: string;
  form: ProductForm;
  setForm: (value: ProductForm | ((current: ProductForm) => ProductForm)) => void;
  categories: Taxonomy[];
  brands: Taxonomy[];
  uploadingImage: boolean;
  uploadingGallery: boolean;
  saveProduct: (event: FormEvent<HTMLFormElement>) => void;
  handleProductImage: (event: ChangeEvent<HTMLInputElement>) => void;
  handleGalleryImages: (event: ChangeEvent<HTMLInputElement>) => void;
  setView: (view: ProductView) => void;
};

export function ProductEditScreen({
  editingProductSlug,
  form,
  setForm,
  categories,
  brands,
  uploadingImage,
  uploadingGallery,
  saveProduct,
  handleProductImage,
  handleGalleryImages,
  setView,
}: Props) {
  const [activeTab, setActiveTab] = useState<ProductDataTab>('general');

  function update(patch: Partial<ProductForm>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  if (!form) {
    return null;
  }

  return (
    <section className="wp-editor-screen product-editor-screen">
      <h1>{editingProductSlug ? 'Edit product' : 'Add new product'}</h1>

      <form className="product-edit-grid" onSubmit={saveProduct}>
        <div className="product-edit-main">
          <input
            className="wp-title-input"
            value={form.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="Product name"
            required
          />

          <EditorBox title="Product description">
            <textarea
              value={form.description}
              onChange={(event) => update({ description: event.target.value })}
            />
          </EditorBox>

          <ProductDataBox
            productForm={form}
            setProductForm={setForm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

<ProductDetailsBox form={form} setForm={setForm} />

          <EditorBox title="Product short description">
            <textarea
              value={form.shortDescription}
              onChange={(event) => update({ shortDescription: event.target.value })}
            />
          </EditorBox>
        </div>

        <ProductSideBoxes
  form={form}
  setForm={setForm}
  categories={categories}
  brands={brands}
  uploadingImage={uploadingImage}
  uploadingGallery={uploadingGallery}
  handleProductImage={handleProductImage}
  handleGalleryImages={handleGalleryImages}
  setView={setView}
  editingProductSlug={editingProductSlug}
/>
      </form>
    </section>
  );
}