import { ArrowLeft, Reply } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MobileNav from '../components/MobileNav.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api from '../services/api.js';

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEmail = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`/email/${id}`);
        setEmail(data.email);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadEmail();
  }, [id]);

  const reply = () => {
    if (!email) return;
    navigate('/compose', {
      state: {
        to: email.from,
        subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
        body: `<p></p><blockquote>${email.body}</blockquote>`,
        replyToMessageId: email.messageId
      }
    });
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <PageHeader title="Message" />
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-md bg-white shadow-sm ring-1 ring-line">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-6">
            <Link to={email?.type === 'sent' ? '/sent' : '/inbox'} className="flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 ring-1 ring-line hover:text-ink">
              <ArrowLeft size={16} /> Back
            </Link>
            {email?.type === 'inbox' ? (
              <button
                type="button"
                onClick={reply}
                className="flex h-10 items-center gap-2 rounded-md bg-accent px-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Reply size={16} /> Reply
              </button>
            ) : null}
          </div>

          {loading ? <div className="p-6 text-sm text-slate-500">Loading</div> : null}
          {error ? <div className="m-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 sm:m-6">{error}</div> : null}
          {email ? (
            <article className="p-4 sm:p-6">
              <h1 className="text-2xl font-semibold tracking-normal text-ink">{email.subject}</h1>
              <dl className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-[96px_1fr]">
                <dt className="font-semibold text-slate-400">From</dt>
                <dd className="min-w-0 break-words">{email.from}</dd>
                <dt className="font-semibold text-slate-400">To</dt>
                <dd className="min-w-0 break-words">{email.to}</dd>
                <dt className="font-semibold text-slate-400">Date</dt>
                <dd>{formatDate(email.createdAt)}</dd>
                <dt className="font-semibold text-slate-400">Message ID</dt>
                <dd className="min-w-0 break-words font-mono text-xs">{email.messageId}</dd>
              </dl>
              <div className="mail-body mt-8 border-t border-line pt-6 text-sm leading-7 text-slate-800" dangerouslySetInnerHTML={{ __html: email.body }} />
            </article>
          ) : null}
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

export default EmailDetail;
