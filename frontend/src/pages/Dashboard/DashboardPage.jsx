import { AlertTriangle, Boxes, ClipboardList, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import ErrorBanner from '../../components/common/ErrorBanner.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Table from '../../components/common/Table.jsx';
import { customerApi, orderApi, productApi } from '../../services/api.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const [products, customers, orders] = await Promise.all([
          productApi.list({ page: 1, limit: 100 }),
          customerApi.list({ page: 1, limit: 1 }),
          orderApi.list({ page: 1, limit: 1 }),
        ]);
        const lowStock = products.data.items.filter((product) => product.quantity_in_stock <= 5);
        setData({
          totalProducts: products.data.meta.total,
          totalCustomers: customers.data.meta.total,
          totalOrders: orders.data.meta.total,
          lowStock,
        });
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <LoadingState label="Loading dashboard" />;

  return (
    <>
      <ErrorBanner error={error} />
      {data ? (
        <>
          <section className="stats-grid">
            <StatCard label="Total Products" value={data.totalProducts} icon={Boxes} />
            <StatCard label="Total Customers" value={data.totalCustomers} icon={Users} />
            <StatCard label="Total Orders" value={data.totalOrders} icon={ClipboardList} />
            <StatCard
              label="Low Stock Products"
              value={data.lowStock.length}
              detail="5 units or fewer"
              icon={AlertTriangle}
            />
          </section>
          <section className="section-block">
            <div className="section-title">
              <h2>Low Stock Products</h2>
              <p>Items that need restocking attention.</p>
            </div>
            {data.lowStock.length ? (
              <Table
                rows={data.lowStock}
                getRowKey={(row) => row.id}
                columns={[
                  { key: 'name', header: 'Name' },
                  { key: 'sku', header: 'SKU' },
                  { key: 'quantity_in_stock', header: 'Stock' },
                ]}
              />
            ) : (
              <div className="empty-state">
                <strong>No low stock products</strong>
                <span>All tracked items are above the low-stock threshold.</span>
              </div>
            )}
          </section>
        </>
      ) : null}
    </>
  );
}
