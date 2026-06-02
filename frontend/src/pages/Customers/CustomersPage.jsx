import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import ErrorBanner from '../../components/common/ErrorBanner.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import Table from '../../components/common/Table.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { customerApi } from '../../services/api.js';
import CustomerForm from './CustomerForm.jsx';

export default function CustomersPage() {
  const { notify } = useNotifications();
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadCustomers(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const response = await customerApi.list({ page: nextPage, limit: 10 });
      setCustomers(response.data.items);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers(1);
  }, []);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      await customerApi.create(payload);
      notify('Customer created');
      setModalOpen(false);
      await loadCustomers(page);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(customer) {
    if (!window.confirm(`Delete ${customer.full_name}?`)) return;
    try {
      await customerApi.remove(customer.id);
      notify('Customer deleted');
      await loadCustomers(page);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  const columns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    {
      key: 'actions',
      header: 'Delete',
      render: (row) => (
        <Button variant="danger" className="icon-btn" onClick={() => handleDelete(row)}>
          <Trash2 size={16} aria-hidden="true" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Customers"
        description="Maintain customer records used by order workflows."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={18} aria-hidden="true" />
            Add Customer
          </Button>
        }
      />
      <ErrorBanner error={error} />
      {loading ? (
        <LoadingState label="Loading customers" />
      ) : customers.length ? (
        <>
          <Table columns={columns} rows={customers} getRowKey={(row) => row.id} />
          <Pagination
            meta={meta}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              loadCustomers(nextPage);
            }}
          />
        </>
      ) : (
        <EmptyState title="No customers found" description="Add customers before creating orders." />
      )}
      <Modal open={modalOpen} title="Add Customer" onClose={() => setModalOpen(false)}>
        <CustomerForm
          submitting={submitting}
          onCancel={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </>
  );
}
