import { Search } from 'lucide-react';

export default function TopNavbar() {
  return (
    <header className="topbar">
      <div>
        <h1>Inventory Management</h1>
        <p>Products, customers, orders, and stock control</p>
      </div>
      <div className="topbar-status">
        <Search size={18} aria-hidden="true" />
        <span>Production dashboard</span>
      </div>
    </header>
  );
}
