import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

const Layout = () => (
  <div className="flex min-h-screen bg-paper text-ink">
    <Sidebar />
    <main className="min-w-0 flex-1">
      <Outlet />
    </main>
  </div>
);

export default Layout;
