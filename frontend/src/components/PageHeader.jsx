import { LogOut, Search, Settings, UserCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PageHeader = ({ title, count, search, onSearchChange, actions }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/95 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
            {typeof count === 'number' ? (
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-line">
                {count}
              </span>
            ) : null}
          </div>

          <div ref={accountRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setAccountOpen((current) => !current)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 ring-1 ring-line transition hover:text-ink"
              aria-label="Account menu"
              aria-expanded={accountOpen}
              title="Account"
            >
              <UserCircle size={22} />
            </button>

            {accountOpen ? (
              <div className="absolute right-0 top-12 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-line">
                <div className="border-b border-line px-4 py-3">
                  <p className="truncate text-sm font-semibold text-ink">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false);
                    navigate('/settings');
                  }}
                  className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                >
                  <Settings size={17} />
                  Settings
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 w-full items-center gap-3 px-4 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-ink"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            ) : null}
          </div>
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
          {actions}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
