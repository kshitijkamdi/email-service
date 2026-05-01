import { Edit3, Inbox, LogOut, Mail, Send, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  [
    'flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition',
    isActive ? 'bg-white text-accent shadow-sm ring-1 ring-line' : 'text-slate-600 hover:bg-white hover:text-ink'
  ].join(' ');

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden w-72 shrink-0 border-r border-line bg-slate-100/80 p-4 md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-white">
          <Mail size={20} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">MiniMail</p>
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
      </div>

      <nav className="space-y-1">
        <NavLink to="/inbox" className={linkClass}>
          <Inbox size={18} /> Inbox
        </NavLink>
        <NavLink to="/sent" className={linkClass}>
          <Send size={18} /> Sent
        </NavLink>
        <NavLink to="/compose" className={linkClass}>
          <Edit3 size={18} /> Compose
        </NavLink>
        {user?.isAdmin ? (
          <NavLink to="/mailboxes" className={linkClass}>
            <Users size={18} /> Mailboxes
          </NavLink>
        ) : null}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-ink"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
