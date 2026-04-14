import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Menu, X, LogOut, User, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const providerLink = user?.role === 'PROVIDER' || user?.role === 'ADMIN'
    ? { to: '/provider/dashboard', label: 'Painel' }
    : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <CalendarCheck className="w-5 h-5 text-primary" />
          <span>AgendaFácil</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/establishments">Estabelecimentos</Link>
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-appointments">Meus Agendamentos</Link>
            </Button>
          )}
          {providerLink && (
            <Button variant="ghost" size="sm" asChild>
              <Link to={providerLink.to}>{providerLink.label}</Link>
            </Button>
          )}
        </nav>

        {/* Actions desktop */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profile"><User className="w-4 h-4 mr-1" />{user?.name?.split(' ')[0]}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-1" />Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/login">Entrar</Link></Button>
              <Button size="sm" asChild><Link to="/register">Cadastrar</Link></Button>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 flex flex-col gap-2">
          <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
            <Link to="/establishments">Estabelecimentos</Link>
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link to="/my-appointments"><CalendarDays className="w-4 h-4 mr-2" />Meus Agendamentos</Link>
            </Button>
          )}
          {providerLink && (
            <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link to={providerLink.to}>{providerLink.label}</Link>
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/profile"><User className="w-4 h-4 mr-2" />Perfil</Link>
              </Button>
              <Button variant="outline" className="justify-start" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button className="justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/register">Cadastrar</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
