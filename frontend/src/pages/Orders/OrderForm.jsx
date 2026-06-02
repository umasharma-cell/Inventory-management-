import { Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import Button from '../../components/common/Button.jsx';

const emptyItem = { product_id: '', quantity: 1 };

export default function OrderForm({ customers, products, onSubmit, onCancel, submitting }) {
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [errors, setErrors] = useState({});

  const productById = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product])),
    [products],
  );

  const previewTotal = items.reduce((sum, item) => {
    const product = productById[item.product_id];
    return sum + (product ? Number(product.price) * Number(item.quantity || 0) : 0);
  }, 0);

  function updateItem(index, field, value) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    setErrors({});
  }

  function validate() {
    const nextErrors = {};
    if (!customerId) nextErrors.customer_id = 'Select a customer';
    items.forEach((item, index) => {
      if (!item.product_id) nextErrors[`product_${index}`] = 'Select a product';
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
        nextErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
      }
      const product = productById[item.product_id];
      if (product && Number(item.quantity) > product.quantity_in_stock) {
        nextErrors[`quantity_${index}`] = `Only ${product.quantity_in_stock} in stock`;
      }
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      customer_id: customerId,
      items: items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      })),
    });
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <label>
        <span>Customer</span>
        <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option value={customer.id} key={customer.id}>
              {customer.full_name}
            </option>
          ))}
        </select>
        {errors.customer_id ? <small>{errors.customer_id}</small> : null}
      </label>

      <div className="order-items">
        {items.map((item, index) => (
          <div className="order-item-row" key={index}>
            <label>
              <span>Product</span>
              <select
                value={item.product_id}
                onChange={(event) => updateItem(index, 'product_id', event.target.value)}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option value={product.id} key={product.id}>
                    {product.name} ({product.quantity_in_stock} in stock)
                  </option>
                ))}
              </select>
              {errors[`product_${index}`] ? <small>{errors[`product_${index}`]}</small> : null}
            </label>
            <label>
              <span>Quantity</span>
              <input
                min="1"
                step="1"
                type="number"
                value={item.quantity}
                onChange={(event) => updateItem(index, 'quantity', event.target.value)}
              />
              {errors[`quantity_${index}`] ? <small>{errors[`quantity_${index}`]}</small> : null}
            </label>
            <Button
              variant="danger"
              className="icon-btn order-remove"
              disabled={items.length === 1}
              onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
            >
              <Trash2 size={16} aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="secondary" onClick={() => setItems((current) => [...current, { ...emptyItem }])}>
        <Plus size={16} aria-hidden="true" />
        Add Item
      </Button>

      <div className="total-preview">
        <span>Live total preview</span>
        <strong>₹{previewTotal.toLocaleString()}</strong>
      </div>

      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Creating' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
}
