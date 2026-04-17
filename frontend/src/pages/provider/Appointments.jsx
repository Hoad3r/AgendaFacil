import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Check, X, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const tabs = [
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

  useEffect(() => {
    api
      .get('/appointments')
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === 'all' ? appointments : appointments.filter((a) => a.status === tab);

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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Gerenciar Agendamentos</h1>
        <p className="text-sm text-slate-500 mt-1">Acompanhe e gerencie todos os seus agendamentos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-6">
        {tabs.map((t) => {
          const count = t.id === 'all' ? appointments.length : appointments.filter((a) => a.status === t.id).length;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-400">Nenhum agendamento nesta categoria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const dt = parseISO(appt.dateTime.replace('Z', ''));
            return (
              <div
                key={appt.id}
                className={`rounded-xl border p-5 ${
                  appt.status === 'PENDING'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {appt.client?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{appt.client?.name}</h3>
                        <Badge value={appt.status} />
                      </div>
                      <p className="text-sm text-slate-600">{appt.service?.name}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(dt, "dd/MM/yyyy 'às' HH:mm")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {appt.service?.duration} min
                        </span>
                        <span>R$ {Number(appt.service?.price).toFixed(2)}</span>
                        {appt.client?.phone && <span>{appt.client.phone}</span>}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-slate-400 italic mt-1">"{appt.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {appt.status === 'PENDING' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          loading={updating === appt.id + 'CONFIRMED'}
                          onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />Confirmar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={updating === appt.id + 'CANCELLED'}
                          onClick={() => updateStatus(appt.id, 'CANCELLED')}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />Cancelar
                        </Button>
                      </>
                    )}
                    {appt.status === 'CONFIRMED' && (
                      <>
                        <Button
                          size="sm"
                          loading={updating === appt.id + 'COMPLETED'}
                          onClick={() => updateStatus(appt.id, 'COMPLETED')}
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />Concluir
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={updating === appt.id + 'CANCELLED'}
                          onClick={() => updateStatus(appt.id, 'CANCELLED')}
                        >
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
