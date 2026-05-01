import { ChevronRight, LogOut, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title="Settings" />

      <section className="px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-4 py-4">
            <p className="truncate text-sm font-semibold text-ink">{user?.email}</p>
          </div>

          {user?.isAdmin ? (
            <Link
              to="/mailboxes"
              className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-ink"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <Users size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block">Email IDs</span>
                <span className="block truncate text-xs font-medium text-slate-500">Manage registered mailboxes</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-ink"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <LogOut size={18} />
            </span>
            Logout
          </button>
        </div>
      </section>

      <MobileNav />
    </div>
  );
};

export default Settings;
