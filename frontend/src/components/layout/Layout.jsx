import { Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';
import { CalendarCheck } from 'lucide-react';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Col 1: Logo + tagline */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarCheck className="w-5 h-5 text-indigo-400" />
                <span className="text-white font-bold">AgendaFácil</span>
              </div>
              <p className="text-sm">Agendamentos online simples e rápidos.</p>
            </div>
            {/* Col 2: Links */}
            <div>
              <p className="text-white text-sm font-semibold mb-3">Links úteis</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/establishments" className="hover:text-white transition-colors">Estabelecimentos</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Cadastrar negócio</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              </ul>
            </div>
            {/* Col 3: Info */}
            <div>
              <p className="text-white text-sm font-semibold mb-3">Sobre</p>
              <p className="text-sm">© 2026 AgendaFácil</p>
              <p className="text-sm mt-1">Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
