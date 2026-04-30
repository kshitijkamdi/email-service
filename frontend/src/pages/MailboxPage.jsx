import { useEffect, useState } from 'react';
import EmailList from '../components/EmailList.jsx';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Pagination from '../components/Pagination.jsx';
import api from '../services/api.js';

const MailboxPage = ({ title, endpoint, mode }) => {
  const [emails, setEmails] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(endpoint, {
          params: { page, limit: 20, q: search || undefined }
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
  }, [endpoint, page, search]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title={title} count={pagination?.total} search={search} onSearchChange={handleSearchChange} />
      {error ? <div className="m-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-6">{error}</div> : null}
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
