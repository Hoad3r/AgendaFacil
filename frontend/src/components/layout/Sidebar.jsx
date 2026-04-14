import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarCheck,
  LayoutDashboard,
  Store,
  Wrench,
  Clock,
  Calendar,
  LogOut,
} from 'lucide-react';

const links = [
  { to: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/provider/establishment', label: 'Estabelecimento', icon: Store },
  { to: '/provider/services', label: 'Serviços', icon: Wrench },
  { to: '/provider/schedule', label: 'Horários', icon: Clock },
  { to: '/provider/appointments', label: 'Agendamentos', icon: Calendar },
];

export default function Sidebar({ open, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const roleLabel =
    user?.role === 'PROVIDER' ? 'Prestador' : user?.role === 'ADMIN' ? 'Admin' : '';

  const sidebarContent = (
    <div className="flex flex-col h-full w-64 bg-slate-900 text-slate-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <CalendarCheck className="w-6 h-6 text-white flex-shrink-0" />
        <span className="text-white font-bold text-lg">AgendaFácil</span>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white rounded-lg'
                  : 'hover:bg-slate-800 rounded-lg'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400">{roleLabel}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Sair"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: always visible, rendered inline by ProviderLayout */}
      <div className="hidden md:flex h-full">{sidebarContent}</div>

      {/* Mobile: drawer with overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="relative z-50 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
