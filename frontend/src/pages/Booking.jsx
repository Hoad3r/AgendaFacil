import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

export default function Booking() {
  const { establishmentId, serviceId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [est, setEst] = useState(null);
  const [service, setService] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    api.get(`/establishments/${establishmentId}`).then(({ data }) => {
      setEst(data);
      setService(data.services?.find((s) => s.id === serviceId));
    });
  }, [establishmentId, serviceId]);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    api
      .get(`/establishments/${establishmentId}/available-slots`, { params: { date, serviceId } })
      .then(({ data }) => setSlots(data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, establishmentId, serviceId]);

  async function handleConfirm() {
    if (!selectedSlot) return;
    setBooking(true);
    try {
      const dateTime = `${date}T${selectedSlot}:00`;
      await api.post('/appointments', { serviceId, establishmentId, dateTime, notes });
      showToast('Agendamento realizado com sucesso!', 'success');
      navigate('/my-appointments');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao agendar', 'error');
      setConfirmOpen(false);
    } finally {
      setBooking(false);
    }
  }

  if (!est || !service) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-1">
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Agendar Serviço</h1>

      {/* Service card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <p className="text-sm text-gray-500 mb-1">{est.name}</p>
        <h2 className="text-xl font-semibold text-gray-900">{service.name}</h2>
        {service.description && <p className="text-sm text-gray-500 mt-1">{service.description}</p>}
        <div className="flex gap-6 mt-3 text-sm">
          <span className="text-gray-500">⏱ {service.duration} min</span>
          <span className="font-semibold text-primary-700">R$ {Number(service.price).toFixed(2)}</span>
        </div>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Escolha a data</h3>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Time slots */}
      {date && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Horários disponíveis</h3>
          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Nenhum horário disponível para esta data
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSlot === slot
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-gray-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSlot && (
        <Button fullWidth size="lg" onClick={() => setConfirmOpen(true)}>
          Confirmar Agendamento para {selectedSlot}
        </Button>
      )}

      {/* Confirm Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar Agendamento">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Estabelecimento</span>
              <span className="font-medium">{est.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Serviço</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Data</span>
              <span className="font-medium">{format(parseISO(date), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Horário</span>
              <span className="font-medium">{selectedSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duração</span>
              <span className="font-medium">{service.duration} min</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-primary-700">R$ {Number(service.price).toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex: preferências, informações adicionais..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button fullWidth loading={booking} onClick={handleConfirm}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
