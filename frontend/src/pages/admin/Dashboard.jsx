import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Users, Store, CalendarDays, DollarSign,
  CheckCircle, Clock, XCircle, AlertCircle,
  Scissors, PawPrint, Stethoscope, LayoutGrid,
} from 'lucide-react';
import api from '../../services/api';
import { Badge } from '@/components/ui/badge';
import { SkeletonStat, Skeleton } from '@/components/ui/skeleton';

const categoryIcons = { SALON: Scissors, PETSHOP: PawPrint, CLINIC: Stethoscope, OTHER: LayoutGrid };
const categoryLabels = { SALON: 'Salão', PETSHOP: 'Pet Shop', CLINIC: 'Clínica', OTHER: 'Outro' };

function StatCard({ label, value, icon: Icon, accent = 'indigo', sub }) {
  const accents = {
    indigo: 'border-l-indigo-500',
    emerald: 'border-l-emerald-500',
    amber: 'border-l-amber-500',
    blue: 'border-l-blue-500',
    rose: 'border-l-rose-500',
  };
  return (
    <div className={`bg-card rounded-xl border border-border border-l-4 ${accents[accent]} p-6`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    PENDING:   { label: 'Pendentes',   icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
    CONFIRMED: { label: 'Confirmados', icon: AlertCircle,  color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-950/20' },
    COMPLETED: { label: 'Concluídos',  icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    CANCELLED: { label: 'Cancelados',  icon: XCircle,      color: 'text-rose-600',    bg: 'bg-rose-50 dark:bg-rose-950/20' },
  };

  const roleConfig = {
    CLIENT:   { label: 'Clientes',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    PROVIDER: { label: 'Prestadores', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
    ADMIN:    { label: 'Admins',      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
        <p className="text-muted-foreground mt-1">Visão geral de toda a plataforma</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <><SkeletonStat /><SkeletonStat /><SkeletonStat /><SkeletonStat /></>
        ) : (
          <>
            <StatCard label="Usuários" value={stats.totalUsers} icon={Users} accent="indigo" />
            <StatCard label="Estabelecimentos" value={stats.totalEstablishments} icon={Store} accent="blue" />
            <StatCard label="Agendamentos" value={stats.totalAppointments} icon={CalendarDays} accent="amber" />
            <StatCard
              label="Receita da plataforma"
              value={`R$ ${stats.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              accent="emerald"
              sub="Soma de agendamentos concluídos"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Users by role */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Usuários por papel</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {stats.usersByRole.map(({ role, _count }) => {
                const cfg = roleConfig[role] || { label: role, color: 'bg-muted text-muted-foreground' };
                return (
                  <div key={role} className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-2xl font-bold text-foreground">{_count.id}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Appointments by status */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Agendamentos por status</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {['PENDING','CONFIRMED','COMPLETED','CANCELLED'].map((s) => {
                const cfg = statusConfig[s];
                const found = stats.appointmentsByStatus.find(x => x.status === s);
                const count = found?._count?.id ?? 0;
                const Icon = cfg.icon;
                return (
                  <div key={s} className={`flex items-center justify-between px-3 py-2 rounded-lg ${cfg.bg}`}>
                    <span className={`flex items-center gap-2 text-sm font-medium ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                      {cfg.label}
                    </span>
                    <span className={`text-xl font-bold ${cfg.color}`}>{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Establishments by category */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-semibold text-foreground mb-4">Estabelecimentos por categoria</h2>
          {loading ? (
            <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="space-y-3">
              {['SALON','PETSHOP','CLINIC','OTHER'].map((cat) => {
                const Icon = categoryIcons[cat];
                const count = stats.establishments.filter(e => e.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon className="w-4 h-4 text-primary" />
                      {categoryLabels[cat]}
                    </span>
                    <span className="text-xl font-bold text-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* All establishments */}
      <div className="bg-card rounded-2xl border border-border mb-8">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Todos os Estabelecimentos</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : stats.establishments.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">Nenhum estabelecimento cadastrado</p>
        ) : (
          <div className="divide-y divide-border">
            {stats.establishments.map((est) => {
              const Icon = categoryIcons[est.category] || LayoutGrid;
              return (
                <div key={est.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{est.name}</p>
                      <p className="text-xs text-muted-foreground">Dono: {est.owner.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0 text-sm text-muted-foreground">
                    <span>{est._count.services} serviço{est._count.services !== 1 ? 's' : ''}</span>
                    <span className="font-medium text-foreground">{est._count.appointments} agendamento{est._count.appointments !== 1 ? 's' : ''}</span>
                    <Badge value={est.category} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent appointments */}
      <div className="bg-card rounded-2xl border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Agendamentos Recentes (plataforma)</h2>
        </div>
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : stats.recentAppointments.length === 0 ? (
          <p className="text-center py-10 text-muted-foreground text-sm">Nenhum agendamento ainda</p>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentAppointments.map((appt) => {
              const dt = parseISO(appt.dateTime.replace('Z', ''));
              return (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {appt.client?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{appt.client?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {appt.service?.name} · {appt.establishment?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-sm">
                    <span className="text-muted-foreground hidden sm:block">
                      {format(dt, "dd/MM/yy 'às' HH:mm")}
                    </span>
                    <span className="font-medium text-foreground">
                      R$ {Number(appt.service?.price).toFixed(2)}
                    </span>
                    <Badge value={appt.status} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
