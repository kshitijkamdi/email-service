import { MailOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

const stripHtml = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const EmailList = ({ emails, emptyText, mode }) => {
  if (!emails.length) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center text-slate-500">
        <MailOpen size={34} className="mb-3 text-slate-400" />
        <p className="text-sm font-medium">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line bg-white">
      {emails.map((email) => (
        <Link
          key={email._id}
          to={`/email/${email._id}`}
          className="grid gap-2 px-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[220px_1fr_auto] sm:items-center sm:px-6"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{mode === 'sent' ? email.to : email.from}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-normal text-slate-400">{email.type}</p>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{email.subject}</p>
            <p className="mt-1 truncate text-sm text-slate-500">{stripHtml(email.body)}</p>
          </div>
          <time className="text-xs font-medium text-slate-400 sm:justify-self-end">{formatDate(email.createdAt)}</time>
        </Link>
      ))}
    </div>
  );
};

export default EmailList;
