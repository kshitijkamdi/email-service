import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, logout, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-slate-500">
        Loading
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user?.isAdmin && user?.approvalStatus === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md rounded-md bg-white p-6 text-center shadow-sm ring-1 ring-line">
          <p className="text-sm font-semibold uppercase tracking-normal text-accent">Approval pending</p>
          <h1 className="mt-3 text-2xl font-semibold text-ink">Your mailbox is waiting for admin approval</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            admin1@reykraft.indevs.in needs to approve this account before the inbox can be opened.
          </p>
          <button
            type="button"
            onClick={logout}
            className="mt-6 h-10 rounded-md bg-accent px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
