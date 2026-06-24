import type { ChangeEvent } from 'react';
import type { ProductForm, ProductView, Taxonomy } from './types';
import { SideBox } from './SideBox';

type Props = {
  form: ProductForm;
  setForm: (value: ProductForm | ((current: ProductForm) => ProductForm)) => void;
  categories: Taxonomy[];
  brands: Taxonomy[];
  uploadingImage: boolean;
  handleProductImage: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadingGallery: boolean;
handleGalleryImages: (event: ChangeEvent<HTMLInputElement>) => void;
  setView: (view: ProductView) => void;
  editingProductSlug: string;
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ProductSideBoxes({
  form,
  setForm,
  categories,
  brands,
  uploadingImage,
  uploadingGallery,
  handleProductImage,
  handleGalleryImages,
  setView,
  editingProductSlug,
}: Props)  {
  function update(patch: Partial<ProductForm>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function openPreview() {
    const slug = form.slug || editingProductSlug || makeSlug(form.name);

    if (!slug) {
      alert('Please enter product name first.');
      return;
    }

    window.open(`/shop/${slug}`, '_blank');
  }

  return (
    <aside className="wp-publish-side">
      <SideBox title="Publish">
        <button className="button-secondary" type="button" onClick={openPreview}>
          Preview
        </button>

        {/* <p>
          Status: <b>{form.status === 'draft' ? 'Draft' : 'Published'}</b>{' '}
          <button
            type="button"
            onClick={() => update({ status: form.status === 'draft' ? 'active' : 'draft' })}
          >
            Edit
          </button>
        </p>

        <p>
          Visibility: <b>Public</b> Edit
        </p>

        <p>Publish immediately Edit</p>

        <p>
          Catalog visibility: <b>Shop and search results</b> Edit
        </p> */}

        <button className="button-primary" type="submit">
          {editingProductSlug ? 'Update' : 'Publish'}
        </button>
      </SideBox>

      <SideBox title="Product image">
        <input
          type="file"
          accept="image/*"
          onChange={handleProductImage}
          disabled={uploadingImage}
        />

        <input
          value={form.image}
          onChange={(event) => update({ image: event.target.value })}
          placeholder="Image URL"
        />

        {form.image ? (
          <img className="sidebar-image-preview" src={form.image} alt="Preview" />
        ) : null}
      </SideBox>

      <SideBox title="Product gallery">
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleGalleryImages}
    disabled={uploadingGallery}
  />

  <textarea
    value={form.galleryInput}
    onChange={(event) => update({ galleryInput: event.target.value })}
    placeholder="Add product gallery image URLs, one per line"
    rows={4}
  />

  <small>Upload multiple images or paste image URLs one per line.</small>

  {form.galleryInput ? (
    <div className="gallery-preview-grid">
      {form.galleryInput
        .split(/\n|,/)
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url) => (
          <img
            key={url}
            className="gallery-image-preview"
            src={url}
            alt="Gallery preview"
          />
        ))}
    </div>
  ) : null}
</SideBox>

      <SideBox title="Product categories">
        <div className="checkbox-list">
          {categories.map((category) => (
            <label key={category.slug}>
              <input
                checked={form.categorySlug === category.slug}
                onChange={() => update({ categorySlug: category.slug })}
                type="checkbox"
              />
              {category.name}
            </label>
          ))}

          {!categories.length ? <span>No categories yet</span> : null}
        </div>

        <button type="button" onClick={() => setView('product-categories')}>
          + Add new category
        </button>
      </SideBox>

      <SideBox title="Product tags">
        <input
          value={form.tagInput}
          onChange={(event) => update({ tagInput: event.target.value })}
        />

        <small>Separate tags with commas</small>
      </SideBox>

      <SideBox title="Brands">
        <div className="checkbox-list">
          {brands.length ? (
            brands.map((brand) => (
              <label key={brand.slug}>
                <input
                  checked={form.brandSlugs.includes(brand.slug)}
                  onChange={(event) =>
                    update({
                      brandSlugs: event.target.checked
                        ? [...form.brandSlugs, brand.slug]
                        : form.brandSlugs.filter((slug) => slug !== brand.slug),
                    })
                  }
                  type="checkbox"
                />
                {brand.name}
              </label>
            ))
          ) : (
            <span>No brands yet</span>
          )}
        </div>

        <button type="button" onClick={() => setView('product-brands')}>
          + Add New Brand
        </button>
      </SideBox>

     
    </aside>
  );
}