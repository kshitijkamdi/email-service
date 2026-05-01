import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmailList from '../components/EmailList.jsx';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

const MailboxPage = ({ title, endpoint, mode }) => {
  const { user } = useAuth();
  const addresses = user?.addresses?.length ? user.addresses : [{ email: user?.email }];
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAddress, setSelectedAddress] = useState(() => localStorage.getItem('mini-mail-selected-address') || user?.email || '');

  useEffect(() => {
    if (!addresses.some((address) => address.email === selectedAddress)) {
      setSelectedAddress(addresses[0]?.email || '');
    }
  }, [addresses, selectedAddress]);

  useEffect(() => {
    if (!selectedAddress) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(endpoint, {
          params: { page, limit: 20, q: search || undefined, address: selectedAddress }
        });
        setEmails(data.emails);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [endpoint, page, search, refreshKey, selectedAddress]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSyncReceived = async () => {
    setSyncing(true);
    setError('');
    setSyncNotice('');

    try {
      const { data } = await api.post('/email/sync-received', { address: selectedAddress });
      setSyncNotice(data.stored ? `${data.stored} new received email${data.stored === 1 ? '' : 's'} synced` : 'No new received emails found');
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddressChange = (email) => {
    localStorage.setItem('mini-mail-selected-address', email);
    setSelectedAddress(email);
    setPage(1);
  };

  const syncAction =
    mode === 'inbox' ? (
      <button
        type="button"
        onClick={handleSyncReceived}
        disabled={syncing}
        className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-slate-600 ring-1 ring-line transition hover:text-ink disabled:opacity-60"
      >
        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
        <span className="hidden sm:inline">{syncing ? 'Syncing' : 'Sync'}</span>
      </button>
    ) : null;

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader
        title={title}
        count={pagination?.total}
        search={search}
        onSearchChange={handleSearchChange}
        actions={syncAction}
        addressSwitcher={{
          addresses,
          value: selectedAddress,
          onChange: handleAddressChange,
          label: `Switch ${title.toLowerCase()} email ID`
        }}
      />
      {error ? <div className="m-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-6">{error}</div> : null}
      {syncNotice ? <div className="m-4 rounded-md bg-blue-50 px-4 py-3 text-sm text-accent sm:m-6">{syncNotice}</div> : null}
      {loading ? (
        <div className="px-4 py-8 text-sm text-slate-500 sm:px-6">Loading</div>
      ) : (
        <>
          <EmailList emails={emails} emptyText={`No ${title.toLowerCase()} messages`} mode={mode} />
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
      <MobileNav />
    </div>
  );
};

export default MailboxPage;
