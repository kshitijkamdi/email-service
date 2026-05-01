import { ShieldCheck, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import api from '../services/api.js';

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));

const Mailboxes = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/admin/users', {
          params: { page, limit: 50, q: search || undefined }
        });
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [page, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete ${user.email} and all messages for that mailbox?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);
    setError('');

    try {
      await api.delete(`/admin/users/${user.id}`);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setPagination((current) => (current ? { ...current, total: Math.max(current.total - 1, 0) } : current));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title="Mailboxes" count={pagination?.total} search={search} onSearchChange={handleSearchChange} />

      {error ? <div className="m-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-6">{error}</div> : null}

      <section className="px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Registered email IDs</h2>
              <p className="text-xs text-slate-500">Oldest mailboxes appear first.</p>
            </div>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-sm text-slate-500">Loading</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-8 text-sm text-slate-500">No mailboxes found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Email ID</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold">Access</th>
                    <th className="w-20 px-4 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.map((user) => (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-3 font-medium text-ink">
                        <div className="flex min-w-[220px] flex-col">
                          <span className="break-all">{user.email}</span>
                          {user.isCurrentUser ? <span className="text-xs font-normal text-slate-500">Signed in now</span> : null}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-accent ring-1 ring-blue-100">
                            <ShieldCheck size={14} />
                            Admin
                          </span>
                        ) : (
                          <span className="text-slate-500">Mailbox</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={user.isCurrentUser || deletingId === user.id}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-red-600 ring-1 ring-transparent transition hover:bg-red-50 hover:ring-red-100 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent disabled:hover:ring-transparent"
                          aria-label={`Delete ${user.email}`}
                          title={user.isCurrentUser ? 'You cannot delete the signed-in admin mailbox' : `Delete ${user.email}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <Pagination pagination={pagination} onPageChange={setPage} />
      <MobileNav />
    </div>
  );
};

export default Mailboxes;

