import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './components/Layout/AppLayout.jsx';
import CustomersPage from './pages/Customers/CustomersPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import OrdersPage from './pages/Orders/OrdersPage.jsx';
import ProductsPage from './pages/Products/ProductsPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/orders" element={<OrdersPage />} />
      </Route>
    </Routes>
  );
}
