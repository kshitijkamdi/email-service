import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-line bg-white px-4 py-3 text-sm sm:px-6">
      <button
        type="button"
        disabled={pagination.page <= 1}
        onClick={() => onPageChange(pagination.page - 1)}
        className="flex h-9 items-center gap-2 rounded-md px-3 font-medium text-slate-600 ring-1 ring-line transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={16} /> Previous
      </button>
      <span className="font-medium text-slate-500">
        {pagination.page} / {pagination.pages}
      </span>
      <button
        type="button"
        disabled={pagination.page >= pagination.pages}
        onClick={() => onPageChange(pagination.page + 1)}
        className="flex h-9 items-center gap-2 rounded-md px-3 font-medium text-slate-600 ring-1 ring-line transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
