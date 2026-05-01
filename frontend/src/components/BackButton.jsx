import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ fallback = '/inbox' }) => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(fallback);
        }
      }}
      className="flex h-10 items-center gap-2 rounded-md bg-white px-3 text-sm font-semibold text-slate-600 ring-1 ring-line transition hover:text-ink"
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
};

export default BackButton;
