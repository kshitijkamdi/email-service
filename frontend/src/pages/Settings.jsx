import { ChevronRight, Copy, LogOut, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton.jsx';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const Settings = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const addresses = user?.addresses?.length ? user.addresses : [{ email: user?.email, isPrimary: true }];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const createAddress = async () => {
    setCreating(true);
    setNotice('');
    setError('');

    try {
      const { data } = await api.post('/email-addresses/generate');
      localStorage.setItem('mini-mail-selected-address', data.address.email);
      await refreshUser();
      setNotice(`${data.address.email} created`);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const copyAddress = async (email) => {
    await navigator.clipboard.writeText(email);
    setNotice(`${email} copied`);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title="Settings" actions={<BackButton />} showAccountMenu={false} />

      <section className="px-4 py-6 sm:px-6">
        {error ? <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {notice ? <div className="mb-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-accent">{notice}</div> : null}

        <div className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-line">
          <div className="border-b border-line px-4 py-4">
            <p className="truncate text-sm font-semibold text-ink">{user?.email}</p>
          </div>

          <div className="border-b border-line px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Your email IDs</h2>
                <p className="mt-1 text-xs text-slate-500">Switch between these from Inbox or Compose.</p>
              </div>
              <button
                type="button"
                onClick={createAddress}
                disabled={creating}
                className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Plus size={16} />
                {creating ? 'Creating' : 'Quick ID'}
              </button>
            </div>

            <div className="mt-4 divide-y divide-line rounded-md ring-1 ring-line">
              {addresses.map((address) => (
                <div key={address.email} className="flex min-h-12 items-center gap-3 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{address.email}</p>
                    {address.isPrimary ? <p className="text-xs text-slate-500">Main email ID</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyAddress(address.email)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-50 hover:text-ink"
                    aria-label={`Copy ${address.email}`}
                    title="Copy"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>
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
