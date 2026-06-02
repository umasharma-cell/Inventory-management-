import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar.jsx';
import TopNavbar from './TopNavbar.jsx';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-shell">
        <TopNavbar />
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
