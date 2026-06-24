import { ChevronDown, ChevronUp, GripVertical, X } from 'lucide-react';
import type { ProductAttributeRow, ProductDataTab, ProductForm, ProductVariationRow } from './types';

type Props = {
  productForm: ProductForm;
  setProductForm: (value: ProductForm) => void;
  activeTab: ProductDataTab;
  setActiveTab: (value: ProductDataTab) => void;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function splitValues(values: string) {
  return values
    .split('|')
    .map((value) => value.trim())
    .filter(Boolean);
}

function makeCombinations(attributes: ProductAttributeRow[]) {
  const variationAttributes = attributes
    .filter((attribute) => attribute.variation && attribute.name.trim() && attribute.values.trim())
    .map((attribute) => ({
      name: attribute.name.trim(),
      values: splitValues(attribute.values),
    }));

  if (!variationAttributes.length) return [];

  return variationAttributes.reduce<Array<Record<string, string>>>(
    (acc, attribute) =>
      acc.flatMap((item) =>
        attribute.values.map((value) => ({
          ...item,
          [attribute.name]: value,
        })),
      ),
    [{}],
  );
}

export function ProductDataBox({ productForm, setProductForm, activeTab, setActiveTab }: Props) {
  if (!productForm) {
    return null;
  }

  const isVariable = productForm.type === 'variable';

  function addAttribute() {
    const attribute: ProductAttributeRow = {
      id: makeId(),
      name: '',
      values: '',
      visible: true,
      variation: isVariable,
      open: true,
    };

    setProductForm({
      ...productForm,
      productAttributes: [...productForm.productAttributes, attribute],
    });
  }

  function updateAttribute(id: string, patch: Partial<ProductAttributeRow>) {
    setProductForm({
      ...productForm,
      productAttributes: productForm.productAttributes.map((attribute) =>
        attribute.id === id ? { ...attribute, ...patch } : attribute,
      ),
    });
  }

  function removeAttribute(id: string) {
    setProductForm({
      ...productForm,
      productAttributes: productForm.productAttributes.filter((attribute) => attribute.id !== id),
    });
  }

  function saveAttributes() {
    setProductForm({
      ...productForm,
      productAttributes: productForm.productAttributes.map((attribute) => ({
        ...attribute,
        open: false,
      })),
    });
  }

  function generateVariations() {
    const combinations = makeCombinations(productForm.productAttributes);

    const variations: ProductVariationRow[] = combinations.map((attributes, index) => {
      const name = Object.values(attributes).join(' / ');

      return {
        id: makeId(),
        name: `#${index + 1} ${name}`,
        attributes,
        sku: '',
        regularPrice: '',
        salePrice: '',
        stock: '0',
        stockStatus: 'instock',
        image: '',
        enabled: true,
        open: index === 0,
      };
    });

    setProductForm({
      ...productForm,
      productVariations: variations,
    });
  }

  function updateVariation(id: string, patch: Partial<ProductVariationRow>) {
    setProductForm({
      ...productForm,
      productVariations: productForm.productVariations.map((variation) =>
        variation.id === id ? { ...variation, ...patch } : variation,
      ),
    });
  }

  function removeVariation(id: string) {
    setProductForm({
      ...productForm,
      productVariations: productForm.productVariations.filter((variation) => variation.id !== id),
    });
  }

  return (
    <div className="wp-product-data-box">
      <div className="product-data-head">
        <strong>Product data —</strong>

        <select
          value={productForm.type}
          onChange={(event) =>
            setProductForm({
              ...productForm,
              type: event.target.value as ProductForm['type'],
            })
          }
        >
          <option value="simple">Simple product</option>
          <option value="variable">Variable product</option>
          <option value="grouped">Grouped product</option>
          <option value="external">External/Affiliate product</option>
        </select>

        <label>
          <input
            checked={productForm.virtual}
            onChange={(event) => setProductForm({ ...productForm, virtual: event.target.checked })}
            type="checkbox"
          />{' '}
          Virtual
        </label>

        <label>
          <input
            checked={productForm.downloadable}
            onChange={(event) => setProductForm({ ...productForm, downloadable: event.target.checked })}
            type="checkbox"
          />{' '}
          Downloadable
        </label>
      </div>

      <div className="product-data-body">
        <nav>
          {[
            ['general', 'General'],
            ['inventory', 'Inventory'],
            ['shipping', 'Shipping'],
            ['linked', 'Linked Products'],
            ['attributes', 'Attributes'],
            ...(isVariable ? [['variations', 'Variations']] : []),
            ['advanced', 'Advanced'],
            ['more', 'Get more options'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={activeTab === key ? 'active' : ''}
              onClick={() => setActiveTab(key as ProductDataTab)}
              type="button"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="product-data-fields product-data-panel">
          {activeTab === 'general' ? (
            <div className="woo-fields">
              <label>
                Regular price (Rs)
                <input
                  value={productForm.regularPrice}
                  onChange={(event) => setProductForm({ ...productForm, regularPrice: event.target.value })}
                  type="number"
                />
              </label>

              <label>
                Sale price (Rs)
                <input
                  value={productForm.salePrice}
                  onChange={(event) => setProductForm({ ...productForm, salePrice: event.target.value })}
                  type="number"
                />
              </label>
            </div>
          ) : null}

          {activeTab === 'inventory' ? (
            <div className="woo-fields">
              <label>
                SKU
                <input
                  value={productForm.sku}
                  onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })}
                />
              </label>

              <label className="woo-checkbox-field">
                Stock management
                <span>
                  <input
                    checked={productForm.stockManagement}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        stockManagement: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />{' '}
                  Track stock quantity for this product
                </span>
              </label>

              {productForm.stockManagement ? (
                <label>
                  Stock quantity
                  <input
                    value={productForm.stock}
                    onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                    type="number"
                  />
                </label>
              ) : null}

              <label>
                Stock status
                <select
                  value={productForm.stockStatus}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      stockStatus: event.target.value as ProductForm['stockStatus'],
                    })
                  }
                >
                  <option value="instock">In stock</option>
                  <option value="outofstock">Out of stock</option>
                  <option value="onbackorder">On backorder</option>
                </select>
              </label>

              <label className="woo-checkbox-field">
                Sold individually
                <span>
                  <input
                    checked={productForm.soldIndividually}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        soldIndividually: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />{' '}
                  Limit purchases to 1 item per order
                </span>
              </label>
            </div>
          ) : null}

          {activeTab === 'shipping' ? (
            <div className="woo-fields">
              <label>
                Weight (kg)
                <input
                  value={productForm.weight}
                  onChange={(event) => setProductForm({ ...productForm, weight: event.target.value })}
                />
              </label>

              <label>
                Dimensions (cm)
                <div className="dimension-row">
                  <input
                    value={productForm.length}
                    onChange={(event) => setProductForm({ ...productForm, length: event.target.value })}
                    placeholder="Length"
                  />
                  <input
                    value={productForm.width}
                    onChange={(event) => setProductForm({ ...productForm, width: event.target.value })}
                    placeholder="Width"
                  />
                  <input
                    value={productForm.height}
                    onChange={(event) => setProductForm({ ...productForm, height: event.target.value })}
                    placeholder="Height"
                  />
                </div>
              </label>

              <label>
                Shipping class
                <select
                  value={productForm.shippingClass}
                  onChange={(event) => setProductForm({ ...productForm, shippingClass: event.target.value })}
                >
                  <option value="">No shipping class</option>
                </select>
              </label>
            </div>
          ) : null}

          {activeTab === 'linked' ? (
            <div className="woo-fields">
              <label>
                Upsells
                <input
                  value={productForm.upsells}
                  onChange={(event) => setProductForm({ ...productForm, upsells: event.target.value })}
                  placeholder="Search for a product..."
                />
              </label>

              <label>
                Cross-sells
                <input
                  value={productForm.crossSells}
                  onChange={(event) => setProductForm({ ...productForm, crossSells: event.target.value })}
                  placeholder="Search for a product..."
                />
              </label>
            </div>
          ) : null}

          {activeTab === 'attributes' ? (
            <div className="woo-attributes-panel">
              <div className="woo-help-line">
                <span />
                Add descriptive pieces of information that customers can use to search for this product on your store, such as “Material” or “Size”.
              </div>

              <div className="woo-attribute-actions">
                <button onClick={addAttribute} type="button">
                  Add new
                </button>

                <select>
                  <option>Add existing</option>
                </select>
              </div>

              <div className="woo-attribute-list">
                {productForm.productAttributes.map((attribute) => (
                  <div className="woo-attribute-item" key={attribute.id}>
                    <div className="woo-attribute-header">
                      <strong>{attribute.name || 'New attribute'}</strong>

                      <div>
                        <button className="woo-remove-link" onClick={() => removeAttribute(attribute.id)} type="button">
                          Remove
                        </button>

                        <button
                          className="woo-icon-button"
                          onClick={() => updateAttribute(attribute.id, { open: !attribute.open })}
                          type="button"
                        >
                          {attribute.open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {attribute.open ? (
  <div className="woo-attribute-edit">
    <div className="woo-attribute-row">
      <div className="woo-attribute-name-col">
        <label className="woo-attribute-label">Name:</label>

        <input
          className="woo-attribute-name-input"
          value={attribute.name}
          onChange={(event) => updateAttribute(attribute.id, { name: event.target.value })}
          placeholder="e.g. weight"
        />

        <label className="woo-attribute-checkbox">
          <input
            checked={attribute.visible}
            onChange={(event) => updateAttribute(attribute.id, { visible: event.target.checked })}
            type="checkbox"
          />
          <span>Visible on the product page</span>
        </label>

        {isVariable ? (
          <label className="woo-attribute-checkbox">
            <input
              checked={attribute.variation}
              onChange={(event) => updateAttribute(attribute.id, { variation: event.target.checked })}
              type="checkbox"
            />
            <span>Used for variations</span>
          </label>
        ) : null}
      </div>

      <div className="woo-attribute-value-col">
        <label className="woo-attribute-label">Value(s):</label>

        <textarea
          className="woo-attribute-value-textarea"
          value={attribute.values}
          onChange={(event) => updateAttribute(attribute.id, { values: event.target.value })}
          placeholder='Enter some descriptive text. Use "|" to separate different values.'
        />
      </div>
    </div>
  </div>
) : null}
                  </div>
                ))}
              </div>

              <button className="woo-save-attributes" onClick={saveAttributes} type="button">
                Save attributes
              </button>
            </div>
          ) : null}

          {activeTab === 'variations' ? (
            <div className="woo-variations-panel">
              {!isVariable ? (
                <p>Choose “Variable product” to enable variations.</p>
              ) : (
                <>
                  <div className="woo-variation-toolbar">
                    <select>
                      <option>Bulk actions</option>
                      <option>Set regular prices</option>
                      <option>Set sale prices</option>
                      <option>Set stock</option>
                    </select>

                    <button onClick={generateVariations} type="button">
                      Generate variations
                    </button>
                  </div>

                  {!productForm.productVariations.length ? (
                    <p className="woo-empty-variation">
                      Before you can add a variation you need to add some variation attributes on the Attributes tab.
                    </p>
                  ) : null}

                  {productForm.productVariations.map((variation) => (
                    <div className="woo-variation-item" key={variation.id}>
                      <div className="woo-variation-header">
                        <span>
                          <GripVertical size={14} /> {variation.name}
                        </span>

                        <div>
                          <button className="woo-remove-link" onClick={() => removeVariation(variation.id)} type="button">
                            Remove
                          </button>

                          <button
                            className="woo-icon-button"
                            onClick={() => updateVariation(variation.id, { open: !variation.open })}
                            type="button"
                          >
                            {variation.open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {variation.open ? (
                        <div className="woo-variation-edit">
                          <label className="woo-checkbox-field">
                            Enabled
                            <span>
                              <input
                                checked={variation.enabled}
                                onChange={(event) => updateVariation(variation.id, { enabled: event.target.checked })}
                                type="checkbox"
                              />{' '}
                              Enabled
                            </span>
                          </label>

                          <label>
                            Image URL
                            <input
                              value={variation.image}
                              onChange={(event) => updateVariation(variation.id, { image: event.target.value })}
                            />
                          </label>

                          <label>
                            SKU
                            <input
                              value={variation.sku}
                              onChange={(event) => updateVariation(variation.id, { sku: event.target.value })}
                            />
                          </label>

                          <label>
                            Regular price (Rs)
                            <input
                              value={variation.regularPrice}
                              onChange={(event) => updateVariation(variation.id, { regularPrice: event.target.value })}
                              type="number"
                            />
                          </label>

                          <label>
                            Sale price (Rs)
                            <input
                              value={variation.salePrice}
                              onChange={(event) => updateVariation(variation.id, { salePrice: event.target.value })}
                              type="number"
                            />
                          </label>

                          <label>
                            Stock quantity
                            <input
                              value={variation.stock}
                              onChange={(event) => updateVariation(variation.id, { stock: event.target.value })}
                              type="number"
                            />
                          </label>

                          <label>
                            Stock status
                            <select
                              value={variation.stockStatus}
                              onChange={(event) =>
                                updateVariation(variation.id, {
                                  stockStatus: event.target.value as ProductVariationRow['stockStatus'],
                                })
                              }
                            >
                              <option value="instock">In stock</option>
                              <option value="outofstock">Out of stock</option>
                              <option value="onbackorder">On backorder</option>
                            </select>
                          </label>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : null}

          {activeTab === 'advanced' ? (
            <div className="woo-fields">
              <label>
                Purchase note
                <textarea
                  value={productForm.purchaseNote}
                  onChange={(event) => setProductForm({ ...productForm, purchaseNote: event.target.value })}
                />
              </label>

              <label>
                Menu order
                <input
                  value={productForm.menuOrder}
                  onChange={(event) => setProductForm({ ...productForm, menuOrder: event.target.value })}
                  type="number"
                />
              </label>

              <label className="woo-checkbox-field">
                Enable reviews
                <span>
                  <input
                    checked={productForm.enableReviews}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        enableReviews: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                </span>
              </label>

              <label className="woo-checkbox-field">
                Available for POS
                <span>
                  <input
                    checked={productForm.availableForPos}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        availableForPos: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />
                </span>
              </label>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}