import type { FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { Attribute, AttributeForm } from './types';

type Props = {
  attributes: Attribute[];
  form: AttributeForm;
  setForm: (value: AttributeForm) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onEdit: (item: Attribute) => void;
  onDelete: (slug: string) => void;
};

export function AttributeScreen({ attributes, form, setForm, onSubmit, onEdit, onDelete }: Props) {
  return (
    <section className="wp-category-screen product-taxonomy-screen">
      <h1>Attributes</h1>
      <div className="wp-category-grid">
        <form className="wp-category-form" onSubmit={onSubmit}>
          <h2>Add new attribute</h2>
          <p>Attributes let you define extra product data, such as size or color. You can use these attributes in the shop sidebar.</p>
          <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label>
          <label>Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} /></label>
          <label className="inline-check"><input checked={form.enableArchives} onChange={(event) => setForm({ ...form, enableArchives: event.target.checked })} type="checkbox" /> Enable Archives?</label>
          <label>
            Default sort order
            <select value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}>
              <option value="menu_order">Custom ordering</option>
              <option value="name">Name</option>
              <option value="name_num">Name (numeric)</option>
              <option value="id">Term ID</option>
            </select>
          </label>
          <label>Terms<input value={form.terms} onChange={(event) => setForm({ ...form, terms: event.target.value })} placeholder="Small, Medium, Large" /></label>
          <button type="submit">Add attribute</button>
        </form>

        <table className="wp-news-table taxonomy-table">
          <thead><tr><th>Name</th><th>Slug</th><th>Order by</th><th>Terms</th><th>Actions</th></tr></thead>
          <tbody>
            {attributes.length ? attributes.map((item) => (
              <tr key={item.slug}>
                <td>{item.name}</td>
                <td>{item.slug}</td>
                <td>{item.sortOrder ?? 'menu_order'}</td>
                <td>{item.terms?.join(', ') || '—'}</td>
                <td><button type="button" onClick={() => onEdit(item)}>Edit</button> <button type="button" onClick={() => onDelete(item.slug)}><Trash2 size={14} /> Delete</button></td>
              </tr>
            )) : <tr><td colSpan={5}>No attributes currently exist.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
