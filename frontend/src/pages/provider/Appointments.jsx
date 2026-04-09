import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gerenciar Agendamentos</h1>

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
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-400">Nenhum agendamento nesta categoria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => {
            const dt = parseISO(appt.dateTime.replace('Z', ''));
            return (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900">{appt.client?.name}</h3>
                      <Badge value={appt.status} />
                    </div>
                    <p className="text-sm text-gray-600">{appt.service?.name}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
                      <span>📅 {format(dt, "dd/MM/yyyy 'às' HH:mm")}</span>
                      <span>⏱ {appt.service?.duration} min</span>
                      <span>💰 R$ {Number(appt.service?.price).toFixed(2)}</span>
                      {appt.client?.phone && <span>📞 {appt.client.phone}</span>}
                    </div>
                    {appt.notes && (
                      <p className="text-xs text-gray-400 italic mt-1">"{appt.notes}"</p>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {appt.status === 'PENDING' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          loading={updating === appt.id + 'CONFIRMED'}
                          onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                        >
                          Confirmar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={updating === appt.id + 'CANCELLED'}
                          onClick={() => updateStatus(appt.id, 'CANCELLED')}
                        >
                          Cancelar
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
                          Concluir
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={updating === appt.id + 'CANCELLED'}
                          onClick={() => updateStatus(appt.id, 'CANCELLED')}
                        >
                          Cancelar
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
