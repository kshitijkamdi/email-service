import { LogOut, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PageHeader = ({ title, count, search, onSearchChange }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            {typeof count === 'number' ? (
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-line">
                {count}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500 md:hidden">{user?.email}</p>
        </div>

        <div className="flex items-center gap-3">
          {onSearchChange ? (
            <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-md bg-white px-3 text-sm ring-1 ring-line lg:w-80">
              <Search size={16} className="shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search mail"
                className="min-w-0 flex-1 bg-transparent outline-none"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-line transition hover:text-ink md:hidden"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
