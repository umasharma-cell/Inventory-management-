import { Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorBanner from '../../components/common/ErrorBanner.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Table from '../../components/common/Table.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { customerApi, orderApi, productApi } from '../../services/api.js';
import OrderForm from './OrderForm.jsx';

export default function OrdersPage() {
  const { notify } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  async function loadOrders(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const response = await orderApi.list({ page: nextPage, limit: 10 });
      setOrders(response.data.items);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadFormData() {
    const [customerResponse, productResponse] = await Promise.all([
      customerApi.list({ page: 1, limit: 100 }),
      productApi.list({ page: 1, limit: 100 }),
    ]);
    setCustomers(customerResponse.data.items);
    setProducts(productResponse.data.items);
  }

  useEffect(() => {
    loadOrders(1);
    loadFormData().catch((err) => setError(err));
  }, []);

  async function handleCreateOrder(payload) {
    setSubmitting(true);
    try {
      await orderApi.create(payload);
      notify('Order created');
      setFormOpen(false);
      await Promise.all([loadOrders(page), loadFormData()]);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await orderApi.remove(orderToDelete.id);
      notify('Order deleted');
      setOrderToDelete(null);
      await Promise.all([loadOrders(page), loadFormData()]);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: 'customer', header: 'Customer', render: (row) => row.customer.full_name },
    {
      key: 'created_at',
      header: 'Date',
      render: (row) => new Date(row.created_at).toLocaleDateString(),
    },
    { key: 'items', header: 'Items', render: (row) => row.items.length },
    {
      key: 'total_amount',
      header: 'Total',
      render: (row) => `Rs ${Number(row.total_amount).toLocaleString()}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Button as={Link} to={`/orders/${row.id}`} variant="ghost" className="icon-btn">
            <Eye size={16} aria-hidden="true" />
          </Button>
          <Button variant="danger" className="icon-btn" onClick={() => setOrderToDelete(row)}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        description="Create orders, inspect line items, and keep stock synchronized."
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Create Order
          </Button>
        }
      />
      <ErrorBanner error={error} />
      {loading ? (
        <LoadingState label="Loading orders" />
      ) : orders.length ? (
        <>
          <Table columns={columns} rows={orders} getRowKey={(row) => row.id} />
          <Pagination
            meta={meta}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              loadOrders(nextPage);
            }}
          />
        </>
      ) : (
        <EmptyState title="No orders found" description="Create an order after adding customers and products." />
      )}
      <Modal open={formOpen} title="Create Order" onClose={() => setFormOpen(false)}>
        <OrderForm
          customers={customers}
          products={products}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={handleCreateOrder}
        />
      </Modal>
      <ConfirmDialog
        open={orderToDelete !== null}
        title="Delete Order"
        message={
          orderToDelete
            ? `Delete order ${orderToDelete.id.slice(0, 8)}? Stock quantities will be restored.`
            : ''
        }
        confirmLabel="Delete Order"
        loading={deleting}
        onCancel={() => setOrderToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
