import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import Button from '../../components/common/Button.jsx';
import ErrorBanner from '../../components/common/ErrorBanner.jsx';
import LoadingState from '../../components/common/LoadingState.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { orderApi } from '../../services/api.js';
import OrderDetail from './OrderDetail.jsx';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { data, error, loading } = useAsync(() => orderApi.get(orderId), [orderId]);

  return (
    <>
      <PageHeader
        title="Order Detail"
        description="Review customer information, products, quantities, and backend-calculated totals."
        actions={
          <Button as={Link} to="/orders" variant="secondary">
            <ArrowLeft size={18} aria-hidden="true" />
            Back to Orders
          </Button>
        }
      />
      <ErrorBanner error={error} />
      {loading ? <LoadingState label="Loading order detail" /> : <OrderDetail order={data?.data} />}
    </>
  );
}
