import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CalendarCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/');
  }

  const clientLinks = [
    { to: '/establishments', label: 'Estabelecimentos' },
    { to: '/my-appointments', label: 'Meus Agendamentos' },
  ];

  const adminLinks = [
    { to: '/establishments', label: 'Estabelecimentos' },
    { to: '/my-appointments', label: 'Meus Agendamentos' },
  ];

  // Only show CLIENT/ADMIN links in the public navbar; PROVIDER uses ProviderLayout sidebar
  const links =
    user?.role === 'ADMIN' ? adminLinks : user?.role === 'CLIENT' ? clientLinks : clientLinks;

  function isActive(path) {
    return location.pathname === path;
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-slate-900 text-lg">AgendaFácil</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated &&
              (user?.role === 'CLIENT' || user?.role === 'ADMIN') &&
              links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium border-b-2 pb-0.5 transition-colors ${
                    isActive(link.to)
                      ? 'border-indigo-600 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 border-transparent hover:border-indigo-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                  {initial}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 py-2 border-b border-slate-100 mb-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {initial}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              {(user?.role === 'CLIENT' || user?.role === 'ADMIN') &&
                links.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to)
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
