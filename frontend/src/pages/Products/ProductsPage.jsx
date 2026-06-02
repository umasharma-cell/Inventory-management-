import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
import { productApi } from '../../services/api.js';
import ProductForm from './ProductForm.jsx';

export default function ProductsPage() {
  const { notify } = useNotifications();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [modalProduct, setModalProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  async function loadProducts(nextPage = page) {
    setLoading(true);
    setError(null);
    try {
      const response = await productApi.list({ page: nextPage, limit: 10, search });
      setProducts(response.data.items);
      setMeta(response.data.meta);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts(1);
    setPage(1);
  }, [search]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (modalProduct?.id) {
        await productApi.update(modalProduct.id, payload);
        notify('Product updated');
      } else {
        await productApi.create(payload);
        notify('Product created');
      }
      setModalProduct(null);
      await loadProducts(page);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await productApi.remove(productToDelete.id);
      notify('Product deleted');
      setProductToDelete(null);
      await loadProducts(page);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'sku', header: 'SKU' },
    { key: 'price', header: 'Price', render: (row) => `Rs ${Number(row.price).toLocaleString()}` },
    { key: 'quantity_in_stock', header: 'Stock' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" className="icon-btn" onClick={() => setModalProduct(row)}>
            <Edit size={16} aria-hidden="true" />
          </Button>
          <Button variant="danger" className="icon-btn" onClick={() => setProductToDelete(row)}>
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage catalog items, SKUs, pricing, and inventory levels."
        actions={
          <Button onClick={() => setModalProduct({})}>
            <Plus size={18} aria-hidden="true" />
            Add Product
          </Button>
        }
      />
      <div className="toolbar">
        <input
          placeholder="Search products by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <ErrorBanner error={error} />
      {loading ? (
        <LoadingState label="Loading products" />
      ) : products.length ? (
        <>
          <Table columns={columns} rows={products} getRowKey={(row) => row.id} />
          <Pagination
            meta={meta}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              loadProducts(nextPage);
            }}
          />
        </>
      ) : (
        <EmptyState title="No products found" description="Add a product to begin tracking stock." />
      )}
      <Modal
        open={modalProduct !== null}
        title={modalProduct?.id ? 'Edit Product' : 'Add Product'}
        onClose={() => setModalProduct(null)}
      >
        <ProductForm
          initialValues={modalProduct}
          submitting={submitting}
          onCancel={() => setModalProduct(null)}
          onSubmit={handleSubmit}
        />
      </Modal>
      <ConfirmDialog
        open={productToDelete !== null}
        title="Delete Product"
        message={
          productToDelete
            ? `Delete ${productToDelete.name}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Product"
        loading={deleting}
        onCancel={() => setProductToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
