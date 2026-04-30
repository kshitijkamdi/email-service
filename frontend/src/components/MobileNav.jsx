import { Edit3, Inbox, Send } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navClass = ({ isActive }) =>
  [
    'flex flex-1 items-center justify-center gap-2 border-t px-2 py-3 text-xs font-semibold',
    isActive ? 'border-accent text-accent' : 'border-line text-slate-500'
  ].join(' ');

const MobileNav = () => (
  <div className="fixed inset-x-0 bottom-0 z-20 flex bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
    <NavLink to="/inbox" className={navClass}>
      <Inbox size={16} /> Inbox
    </NavLink>
    <NavLink to="/sent" className={navClass}>
      <Send size={16} /> Sent
    </NavLink>
    <NavLink to="/compose" className={navClass}>
      <Edit3 size={16} /> Compose
    </NavLink>
  </div>
);

export default MobileNav;
