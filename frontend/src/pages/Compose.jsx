import { Send } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api from '../services/api.js';

const Compose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const defaults = location.state || {};
  const [form, setForm] = useState({
    to: defaults.to || '',
    subject: defaults.subject || '',
    body: defaults.body || '',
    replyToMessageId: defaults.replyToMessageId || ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await api.post('/email/send', form);
      navigate('/sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title="Compose" />
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="rounded-md bg-white shadow-sm ring-1 ring-line">
          <div className="space-y-4 p-4 sm:p-6">
            <input
              type="text"
              value={form.to}
              onChange={(event) => setForm({ ...form, to: event.target.value })}
              placeholder="Recipient"
              className="h-11 w-full border-b border-line bg-transparent text-sm outline-none"
              required
            />
            <input
              type="text"
              value={form.subject}
              onChange={(event) => setForm({ ...form, subject: event.target.value })}
              placeholder="Subject"
              className="h-11 w-full border-b border-line bg-transparent text-sm outline-none"
              required
            />
            <textarea
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              placeholder="Write your email"
              className="min-h-[360px] w-full resize-y bg-transparent text-sm leading-6 outline-none"
              required
            />
            {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          </div>
          <div className="flex items-center justify-end border-t border-line px-4 py-3 sm:px-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? 'Sending' : 'Send'}
            </button>
          </div>
        </div>
      </form>
      <MobileNav />
    </div>
  );
};

export default Compose;
