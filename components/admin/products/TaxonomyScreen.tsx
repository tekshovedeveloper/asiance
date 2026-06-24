import type { FormEvent } from 'react';
import { Box, ChevronUp } from 'lucide-react';
import type { Taxonomy, TaxonomyForm } from './types';

type Props = {
  title: string;
  button: string;
  searchLabel: string;
  items: Taxonomy[];
  form: TaxonomyForm;
  setForm: (value: TaxonomyForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (item: Taxonomy) => void;
  onDelete: (slug: string) => void;
  showDisplayType?: boolean;
  hideParent?: boolean;
};

export function TaxonomyScreen({ title, button, searchLabel, items, form, setForm, onSubmit, onEdit, onDelete, showDisplayType, hideParent }: Props) {
  return (
    <section className="wp-category-screen product-taxonomy-screen">
      <h1>{title}</h1>
      <div className="wp-category-grid">
        <form className="wp-category-form" onSubmit={onSubmit}>
          <h2>{button}</h2>
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <p>The name is how it appears on your site.</p>
          <label>Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
          <p>The “slug” is the URL-friendly version of the name.</p>
          {!hideParent ? (
            <label>
              Parent {title === 'Brands' ? 'Brand' : 'category'}
              <select value={form.parentSlug} onChange={(event) => setForm({ ...form, parentSlug: event.target.value })}>
                <option value="">None</option>
                {items.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
          ) : null}
          <label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          {showDisplayType ? (
            <label>
              Display type
              <select value={form.displayType} onChange={(event) => setForm({ ...form, displayType: event.target.value })}>
                <option value="default">Default</option>
                <option value="products">Products</option>
                <option value="subcategories">Subcategories</option>
                <option value="both">Both</option>
              </select>
            </label>
          ) : null}
          <label>Thumbnail<input type="text" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Image URL" /></label>
          <button type="submit">{button}</button>
        </form>

        <div>
          <div className="wp-search taxonomy-search"><input /><button type="button">Search {searchLabel}</button></div>
          <table className="wp-news-table taxonomy-table">
            <thead>
              <tr>
                <th className="check-column"><input type="checkbox" /></th>
                <th>Image</th>
                <th>Name <ChevronUp size={12} /></th>
                <th>Description <ChevronUp size={12} /></th>
                <th>Slug <ChevronUp size={12} /></th>
                <th>Count <ChevronUp size={12} /></th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((item) => (
                <tr key={item.slug}>
                  <td className="check-column"><input type="checkbox" /></td>
                  <td className="image-column">{item.image ? <img src={item.image} alt="" /> : <Box size={18} />}</td>
                  <td className="title-column">
                    <button type="button" onClick={() => onEdit(item)}>{item.name}</button>
                    <div className="row-links"><button type="button" onClick={() => onEdit(item)}>Edit</button><span>|</span><button type="button" onClick={() => onDelete(item.slug)}>Delete</button></div>
                  </td>
                  <td>{item.description || '—'}</td>
                  <td>{item.slug}</td>
                  <td>{item.count ?? 0}</td>
                </tr>
              )) : <tr><td colSpan={6}>No {searchLabel} found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
