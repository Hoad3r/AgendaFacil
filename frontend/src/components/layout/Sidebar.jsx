import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Calendar, Wrench, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/provider/establishment', icon: Building2, label: 'Estabelecimento' },
  { to: '/provider/services', icon: Wrench, label: 'Serviços' },
  { to: '/provider/schedule', icon: Calendar, label: 'Horários' },
  { to: '/provider/appointments', icon: Settings, label: 'Agendamentos' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r bg-card min-h-screen p-4 flex flex-col gap-1">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn('flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent')
          }
        >
          <Icon className="w-4 h-4" />
          {label}
        </NavLink>
      ))}
    </aside>
  );
}
