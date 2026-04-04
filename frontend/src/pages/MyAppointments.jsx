import { useState, useEffect } from 'react';
import { format, parseISO, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function MyAppointments() {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('upcoming');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api
      .get('/appointments')
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter(
    (a) => ['PENDING', 'CONFIRMED'].includes(a.status) && isFuture(parseISO(a.dateTime.replace('Z', '')))
  );
  const history = appointments.filter(
    (a) => ['COMPLETED', 'CANCELLED'].includes(a.status) || !isFuture(parseISO(a.dateTime.replace('Z', '')))
  );

  const shown = tab === 'upcoming' ? upcoming : history;

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await api.patch(`/appointments/${cancelTarget.id}/status`, { status: 'CANCELLED' });
      setAppointments((prev) =>
        prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: 'CANCELLED' } : a))
      );
      showToast('Agendamento cancelado', 'success');
      setCancelTarget(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao cancelar', 'error');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Agendamentos</h1>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'upcoming', label: `Próximos (${upcoming.length})` },
          { id: 'history', label: `Histórico (${history.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-gray-500">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((appt) => {
            const dt = parseISO(appt.dateTime.replace('Z', ''));
            const canCancel = ['PENDING', 'CONFIRMED'].includes(appt.status);
            return (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{appt.service?.name}</h3>
                    <p className="text-sm text-gray-500">{appt.establishment?.name}</p>
                  </div>
                  <Badge value={appt.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span>📅 {format(dt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                  <span>🕐 {format(dt, 'HH:mm')}</span>
                  <span>⏱ {appt.service?.duration} min</span>
                  <span className="font-medium text-gray-900">R$ {Number(appt.service?.price).toFixed(2)}</span>
                </div>
                {appt.notes && (
                  <p className="text-sm text-gray-400 italic mb-3">"{appt.notes}"</p>
                )}
                {canCancel && (
                  <Button variant="danger" size="sm" onClick={() => setCancelTarget(appt)}>
                    Cancelar Agendamento
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancelar Agendamento" size="sm">
        <p className="text-gray-600 mb-6">
          Tem certeza que deseja cancelar o agendamento de{' '}
          <strong>{cancelTarget?.service?.name}</strong>?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setCancelTarget(null)}>
            Manter
          </Button>
          <Button variant="danger" fullWidth loading={cancelling} onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
