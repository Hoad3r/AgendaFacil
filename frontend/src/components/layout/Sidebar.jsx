import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarCheck, LayoutDashboard, Store, Wrench,
  Clock, Calendar, LogOut,
} from 'lucide-react';

const links = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/establishment', label: 'Estabelecimento', icon: Store },
  { to: '/provider/services', label: 'Serviços', icon: Wrench },
  { to: '/provider/schedule', label: 'Horários', icon: Clock },
  { to: '/provider/appointments', label: 'Agendamentos', icon: Calendar },
];

const roleLabel = { PROVIDER: 'Prestador', ADMIN: 'Admin' };

export default function Sidebar({ onClose = () => {} }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-700">
        <CalendarCheck className="w-6 h-6 text-indigo-400" />
        <span className="text-white font-bold text-lg">AgendaFácil</span>
      </div>

      {/* Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
        <p className="text-xs text-slate-400 mb-3">{roleLabel[user?.role] || user?.role}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
