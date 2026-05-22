import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Check, X, CheckCircle, Search, Filter } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonCard } from '@/components/ui/skeleton';

const STATUS_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'CONFIRMED', label: 'Confirmados' },
  { id: 'COMPLETED', label: 'Concluídos' },
  { id: 'CANCELLED', label: 'Cancelados' },
];

export default function ProviderAppointments() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [updating, setUpdating] = useState('');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    api.get('/appointments')
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      if (tab !== 'all' && a.status !== tab) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchClient = a.client?.name?.toLowerCase().includes(q);
        const matchService = a.service?.name?.toLowerCase().includes(q);
        if (!matchClient && !matchService) return false;
      }
      if (dateFilter) {
        const apptDate = format(parseISO(a.dateTime.replace('Z', '')), 'yyyy-MM-dd');
        if (apptDate !== dateFilter) return false;
      }
      return true;
    });
  }, [appointments, tab, search, dateFilter]);

  async function updateStatus(id, status) {
    setUpdating(id + status);
    try {
      const { data } = await api.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: data.status } : a)));
      showToast('Status atualizado!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao atualizar', 'error');
    } finally {
      setUpdating('');
    }
  }

  function clearFilters() {
    setSearch('');
    setDateFilter('');
    setTab('all');
  }

  const hasFilters = search || dateFilter || tab !== 'all';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Gerenciar Agendamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe e gerencie todos os seus agendamentos</p>
      </div>

      {/* Filters row */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por cliente ou serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-border bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-primary hover:text-primary/80 font-medium whitespace-nowrap"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
        {STATUS_TABS.map((t) => {
          const count = t.id === 'all' ? appointments.length : appointments.filter((a) => a.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground border border-border hover:border-border/80 hover:text-foreground'
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <p className="text-muted-foreground mb-2">Nenhum agendamento encontrado</p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-primary hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{filtered.length} agendamento{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</p>
          {filtered.map((appt) => {
            const dt = parseISO(appt.dateTime.replace('Z', ''));
            return (
              <div
                key={appt.id}
                className={`rounded-xl border p-5 transition-colors ${
                  appt.status === 'PENDING' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' : 'bg-card border-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {appt.client?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{appt.client?.name}</h3>
                        <Badge value={appt.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{appt.service?.name}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(dt, "dd/MM/yyyy 'às' HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.service?.duration} min
                        </span>
                        <span className="font-medium text-foreground">R$ {Number(appt.service?.price).toFixed(2)}</span>
                        {appt.client?.phone && <span>{appt.client.phone}</span>}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-muted-foreground italic mt-1">"{appt.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {appt.status === 'PENDING' && (
                      <>
                        <Button variant="default" size="sm" disabled={updating === appt.id + 'CONFIRMED'} onClick={() => updateStatus(appt.id, 'CONFIRMED')}>
                          <Check className="w-3.5 h-3.5 mr-1" />Confirmar
                        </Button>
                        <Button variant="destructive" size="sm" disabled={updating === appt.id + 'CANCELLED'} onClick={() => updateStatus(appt.id, 'CANCELLED')}>
                          <X className="w-3.5 h-3.5 mr-1" />Cancelar
                        </Button>
                      </>
                    )}
                    {appt.status === 'CONFIRMED' && (
                      <>
                        <Button size="sm" disabled={updating === appt.id + 'COMPLETED'} onClick={() => updateStatus(appt.id, 'COMPLETED')}>
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />Concluir
                        </Button>
                        <Button variant="destructive" size="sm" disabled={updating === appt.id + 'CANCELLED'} onClick={() => updateStatus(appt.id, 'CANCELLED')}>
                          <X className="w-3.5 h-3.5 mr-1" />Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
