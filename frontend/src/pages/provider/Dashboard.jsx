import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, parseISO, isThisWeek, subDays, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, BarChart3, Clock, DollarSign, Store, Wrench, Calendar } from 'lucide-react';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import { SkeletonStat, Skeleton } from '@/components/ui/skeleton';

function StatCard({ label, value, icon: Icon, accent = 'indigo' }) {
  const accents = {
    indigo: 'border-l-indigo-500',
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    emerald: 'border-l-emerald-500',
  };
  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${accents[accent]} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function WeekChart({ appointments }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const count = appointments.filter((a) =>
      isSameDay(parseISO(a.dateTime.replace('Z', '')), date)
    ).length;
    return { label: format(date, 'EEE', { locale: ptBR }), count, isToday: isToday(date) };
  });

  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-semibold text-foreground mb-5">Agendamentos — últimos 7 dias</h2>
      <div className="flex items-end gap-2 h-32">
        {days.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground">{d.count > 0 ? d.count : ''}</span>
            <div className="w-full flex items-end" style={{ height: '80px' }}>
              <div
                className={`w-full rounded-t-md transition-all ${
                  d.isToday ? 'bg-primary' : 'bg-primary/20'
                }`}
                style={{ height: `${(d.count / max) * 80}px`, minHeight: d.count > 0 ? '4px' : '2px' }}
              />
            </div>
            <span className={`text-xs capitalize ${d.isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopServices({ appointments }) {
  const completed = appointments.filter((a) => a.status === 'COMPLETED');
  const counts = completed.reduce((acc, a) => {
    const name = a.service?.name || 'Desconhecido';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = sorted[0]?.[1] || 1;

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h2 className="font-semibold text-foreground mb-5">Serviços mais realizados</h2>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum serviço concluído ainda</p>
      ) : (
        <div className="space-y-3">
          {sorted.map(([name, count]) => (
            <div key={name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium truncate">{name}</span>
                <span className="text-muted-foreground ml-2 shrink-0">{count}x</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
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
    api.get('/appointments')
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
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat />
          </>
        ) : (
          <>
            <StatCard label="Agendamentos hoje" value={todayAppts.length} icon={CalendarDays} accent="indigo" />
            <StatCard label="Esta semana" value={weekAppts.length} icon={BarChart3} accent="blue" />
            <StatCard label="Pendentes" value={pending.length} icon={Clock} accent="amber" />
            <StatCard label="Receita total" value={`R$ ${revenue.toFixed(2)}`} icon={DollarSign} accent="emerald" />
          </>
        )}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-4 w-48 mb-5" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-4 w-48 mb-5" />
            <div className="space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <WeekChart appointments={appointments} />
          <TopServices appointments={appointments} />
        </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow group"
          >
            <item.icon className="w-6 h-6 text-primary mb-3" />
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
              {item.label}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="bg-card rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Agendamentos de Hoje</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : todayAppts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground text-sm">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todayAppts.map((appt) => {
              const dt = parseISO(appt.dateTime.replace('Z', ''));
              return (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {appt.client?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appt.client?.name}</p>
                      <p className="text-sm text-muted-foreground">
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
