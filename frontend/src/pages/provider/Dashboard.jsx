import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, parseISO, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, BarChart3, Clock, DollarSign, Store, Wrench, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

function StatCard({ label, value, icon: Icon, accent = 'indigo' }) {
  const accents = {
    indigo: 'border-l-indigo-500',
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500',
  };
  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${accents[accent]} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

const quickLinks = [
  { to: '/provider/establishment', label: 'Estabelecimento', icon: Store, desc: 'Editar dados do seu negócio' },
  { to: '/provider/services', label: 'Serviços', icon: Wrench, desc: 'Adicionar ou editar serviços' },
  { to: '/provider/schedule', label: 'Horários', icon: Clock, desc: 'Configurar dias e horários' },
  { to: '/provider/appointments', label: 'Agendamentos', icon: Calendar, desc: 'Ver todos os agendamentos' },
];

export default function ProviderDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/appointments')
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  }, []);

  const todayAppts = appointments.filter((a) =>
    a.dateTime && isToday(parseISO(a.dateTime.replace('Z', '')))
  );
  const weekAppts = appointments.filter((a) =>
    a.dateTime && isThisWeek(parseISO(a.dateTime.replace('Z', '')), { weekStartsOn: 1 })
  );
  const pending = appointments.filter((a) => a.status === 'PENDING');
  const revenue = appointments
    .filter((a) => a.status === 'COMPLETED')
    .reduce((acc, a) => acc + (a.service?.price || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Agendamentos hoje" value={todayAppts.length} icon={CalendarDays} accent="indigo" />
        <StatCard label="Esta semana" value={weekAppts.length} icon={BarChart3} accent="blue" />
        <StatCard label="Pendentes" value={pending.length} icon={Clock} accent="amber" />
        <StatCard label="Receita total" value={`R$ ${revenue.toFixed(2)}`} icon={DollarSign} accent="emerald" />
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group"
          >
            <item.icon className="w-6 h-6 text-indigo-600 mb-3" />
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm">
              {item.label}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Agendamentos de Hoje</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : todayAppts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-sm">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {todayAppts.map((appt) => {
              const dt = parseISO(appt.dateTime.replace('Z', ''));
              return (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                      {appt.client?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{appt.client?.name}</p>
                      <p className="text-sm text-slate-500">
                        {appt.service?.name} · {format(dt, 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge value={appt.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
