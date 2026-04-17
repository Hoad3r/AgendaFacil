import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const steps = ['Serviço', 'Horário', 'Confirmação'];

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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Determine current stepper step
  const currentStep = selectedSlot ? 2 : date ? 1 : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Agendar Serviço</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              i <= currentStep ? 'text-indigo-600' : 'text-slate-400'
            }`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                i < currentStep ? 'bg-indigo-600 text-white' :
                i === currentStep ? 'border-2 border-indigo-600 text-indigo-600' :
                'border-2 border-slate-300 text-slate-400'
              }`}>{i + 1}</span>
              {step}
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 ${i < currentStep ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Service card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <p className="text-sm text-slate-500 mb-1">{est.name}</p>
        <h2 className="text-xl font-semibold text-slate-900">{service.name}</h2>
        {service.description && (
          <p className="text-sm text-slate-500 mt-1">{service.description}</p>
        )}
        <div className="flex gap-6 mt-3 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-4 h-4" />
            {service.duration} min
          </span>
          <span className="font-semibold text-indigo-700">
            R$ {Number(service.price).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Date picker */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-indigo-600" />
          Escolha a data
        </h3>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Time slots */}
      {date && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Horários disponíveis
          </h3>
          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">
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
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200'
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
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirmar Agendamento para {selectedSlot}
        </Button>
      )}

      {/* Confirm Modal */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirmar Agendamento">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Estabelecimento</span>
              <span className="font-medium">{est.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Serviço</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Data</span>
              <span className="font-medium">{date ? format(parseISO(date), 'dd/MM/yyyy') : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Horário</span>
              <span className="font-medium">{selectedSlot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Duração</span>
              <span className="font-medium">{service.duration} min</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-indigo-700">R$ {Number(service.price).toFixed(2)}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex: preferências, informações adicionais..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
