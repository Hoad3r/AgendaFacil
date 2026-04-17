import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, CalendarX } from 'lucide-react';
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
  const past = appointments.filter(
    (a) => a.status === 'COMPLETED' || (!isFuture(parseISO(a.dateTime.replace('Z', ''))) && a.status !== 'CANCELLED')
  );
  const cancelled = appointments.filter((a) => a.status === 'CANCELLED');

  const tabs = [
    { id: 'upcoming', label: `Próximos (${upcoming.length})` },
    { id: 'past', label: `Passados (${past.length})` },
    { id: 'cancelled', label: `Cancelados (${cancelled.length})` },
  ];

  const shown = tab === 'upcoming' ? upcoming : tab === 'past' ? past : cancelled;

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
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Meus Agendamentos</h1>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-3">
          <CalendarX className="w-12 h-12 text-slate-300" />
          <p className="text-slate-500">Nenhum agendamento encontrado</p>
          <Link
            to="/establishments"
            className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-3 py-1.5 text-sm"
          >
            Ver estabelecimentos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((appt) => {
            const dt = parseISO(appt.dateTime.replace('Z', ''));
            const canCancel = ['PENDING', 'CONFIRMED'].includes(appt.status);
            return (
              <div key={appt.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{appt.service?.name}</h3>
                    <p className="text-sm text-slate-500">{appt.establishment?.name}</p>
                  </div>
                  <Badge value={appt.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(dt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(dt, 'HH:mm')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {appt.service?.duration} min
                  </span>
                  <span className="font-semibold text-slate-900">
                    R$ {Number(appt.service?.price).toFixed(2)}
                  </span>
                </div>
                {appt.notes && (
                  <p className="text-sm text-slate-400 italic mb-3">"{appt.notes}"</p>
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
        <p className="text-slate-600 mb-6">
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
