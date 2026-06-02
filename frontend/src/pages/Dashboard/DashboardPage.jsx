import { AlertTriangle, Boxes, ClipboardList, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import BarChart from '../../components/common/BarChart.jsx';
import ErrorBanner from '../../components/common/ErrorBanner.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import Table from '../../components/common/Table.jsx';
import { dashboardApi } from '../../services/api.js';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError(null);
      try {
        const response = await dashboardApi.summary();
        setData(response.data);
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
            <StatCard label="Total Products" value={data.total_products} icon={Boxes} />
            <StatCard label="Total Customers" value={data.total_customers} icon={Users} />
            <StatCard label="Total Orders" value={data.total_orders} icon={ClipboardList} />
            <StatCard
              label="Low Stock Products"
              value={data.low_stock_count}
              detail="5 units or fewer"
              icon={AlertTriangle}
            />
          </section>
          <BarChart
            title="Operational Snapshot"
            description="Current totals across core inventory workflows."
            data={[
              { label: 'Products', value: data.total_products },
              { label: 'Customers', value: data.total_customers },
              { label: 'Orders', value: data.total_orders },
              { label: 'Low Stock', value: data.low_stock_count },
            ]}
          />
          <section className="section-block">
            <div className="section-title">
              <h2>Low Stock Products</h2>
              <p>Items that need restocking attention.</p>
            </div>
            {data.low_stock_products.length ? (
              <Table
                rows={data.low_stock_products}
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
