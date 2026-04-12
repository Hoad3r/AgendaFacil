import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  const providerLinks = [
    { to: '/provider/dashboard', label: 'Dashboard' },
    { to: '/provider/establishment', label: 'Estabelecimento' },
    { to: '/provider/services', label: 'Serviços' },
    { to: '/provider/schedule', label: 'Horários' },
    { to: '/provider/appointments', label: 'Agendamentos' },
  ];

  const adminLinks = [
    { to: '/establishments', label: 'Estabelecimentos' },
    { to: '/provider/dashboard', label: 'Dashboard' },
  ];

  const links =
    user?.role === 'PROVIDER' ? providerLinks : user?.role === 'ADMIN' ? adminLinks : clientLinks;

  function isActive(path) {
    return location.pathname === path;
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">AF</span>
            </div>
            <span className="font-bold text-lg text-gray-900">AgendaFácil</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated &&
              links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">
                    {user.role === 'PROVIDER' ? 'Prestador' : user.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {isAuthenticated ? (
            <>
              <div className="py-2 border-b border-gray-100 mb-2">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                Entrar
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm bg-primary-600 text-white rounded-lg">
                Cadastrar
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
