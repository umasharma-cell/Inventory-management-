export default function OrderDetail({ order }) {
  if (!order) return null;

  return (
    <div className="order-detail">
      <dl>
        <div>
          <dt>Customer</dt>
          <dd>{order.customer.full_name}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{new Date(order.created_at).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Total Amount</dt>
          <dd>₹{Number(order.total_amount).toLocaleString()}</dd>
        </div>
      </dl>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Unit Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product.name}</td>
                <td>{item.product.sku}</td>
                <td>{item.quantity}</td>
                <td>₹{Number(item.unit_price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
