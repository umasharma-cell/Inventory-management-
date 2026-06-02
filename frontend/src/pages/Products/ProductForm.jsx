import { useMemo, useState } from 'react';

import Button from '../../components/common/Button.jsx';

const initialState = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: '',
};

export default function ProductForm({ initialValues, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(() => ({ ...initialState, ...initialValues }));
  const [errors, setErrors] = useState({});

  const isEditing = useMemo(() => Boolean(initialValues?.id), [initialValues]);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors = {};
    if (!values.name.trim()) nextErrors.name = 'Product name is required';
    if (!values.sku.trim()) nextErrors.sku = 'SKU is required';
    if (Number(values.price) < 0 || values.price === '') nextErrors.price = 'Price must be 0 or more';
    if (
      values.quantity_in_stock === '' ||
      !Number.isInteger(Number(values.quantity_in_stock)) ||
      Number(values.quantity_in_stock) < 0
    ) {
      nextErrors.quantity_in_stock = 'Stock must be a whole number 0 or more';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      sku: values.sku.trim(),
      price: Number(values.price),
      quantity_in_stock: Number(values.quantity_in_stock),
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        <span>Name</span>
        <input value={values.name} onChange={(event) => updateField('name', event.target.value)} />
        {errors.name ? <small>{errors.name}</small> : null}
      </label>
      <label>
        <span>SKU</span>
        <input value={values.sku} onChange={(event) => updateField('sku', event.target.value)} />
        {errors.sku ? <small>{errors.sku}</small> : null}
      </label>
      <label>
        <span>Price</span>
        <input
          min="0"
          step="0.01"
          type="number"
          value={values.price}
          onChange={(event) => updateField('price', event.target.value)}
        />
        {errors.price ? <small>{errors.price}</small> : null}
      </label>
      <label>
        <span>Stock</span>
        <input
          min="0"
          step="1"
          type="number"
          value={values.quantity_in_stock}
          onChange={(event) => updateField('quantity_in_stock', event.target.value)}
        />
        {errors.quantity_in_stock ? <small>{errors.quantity_in_stock}</small> : null}
      </label>
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving' : isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
