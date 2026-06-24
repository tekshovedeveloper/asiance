import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { ProductDetailRow, ProductForm } from './types';

type Props = {
  form: ProductForm;
  setForm: (value: ProductForm | ((current: ProductForm) => ProductForm)) => void;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ProductDetailsBox({ form, setForm }: Props) {
  function addDetail() {
    setForm((current) => ({
      ...current,
      details: [
        ...current.details,
        {
          id: makeId(),
          title: '',
          description: '',
          open: true,
        },
      ],
    }));
  }

  function updateDetail(id: string, patch: Partial<ProductDetailRow>) {
    setForm((current) => ({
      ...current,
      details: current.details.map((detail) =>
        detail.id === id ? { ...detail, ...patch } : detail,
      ),
    }));
  }

  function removeDetail(id: string) {
    setForm((current) => ({
      ...current,
      details: current.details.filter((detail) => detail.id !== id),
    }));
  }

  return (
    <div className="wp-product-details-box">
      <div className="wp-product-details-head">
        <h2>Product details / FAQ</h2>

        <button type="button" onClick={addDetail}>
          Add detail
        </button>
      </div>

      <p className="wp-product-details-help">
        Add multiple accordion sections like product details, ingredients, return policy, size guide, and care instructions.
      </p>

      <div className="wp-product-details-list">
        {form.details.length ? (
          form.details.map((detail, index) => (
            <div className="wp-product-detail-item" key={detail.id}>
              <div className="wp-product-detail-header">
                <button
                  type="button"
                  onClick={() => updateDetail(detail.id, { open: !detail.open })}
                >
                  {detail.open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  <span>{detail.title || `Detail ${index + 1}`}</span>
                </button>

                <button
                  className="wp-product-detail-remove"
                  type="button"
                  onClick={() => removeDetail(detail.id)}
                >
                  <Trash2 size={15} />
                  Remove
                </button>
              </div>

              {detail.open ? (
                <div className="wp-product-detail-body">
                  <label>
                    Title
                    <input
                      value={detail.title}
                      onChange={(event) =>
                        updateDetail(detail.id, { title: event.target.value })
                      }
                      placeholder="Example: product details"
                    />
                  </label>

                  <label>
                    Description
                    <textarea
                      value={detail.description}
                      onChange={(event) =>
                        updateDetail(detail.id, { description: event.target.value })
                      }
                      placeholder="Write detail description here..."
                    />
                  </label>
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="wp-product-detail-empty">
            No details added yet. Click “Add detail” to create one.
          </div>
        )}
      </div>
    </div>
  );
}