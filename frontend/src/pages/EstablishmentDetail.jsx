import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Scissors, PawPrint, Stethoscope, Star, MapPin, Phone, Clock, ArrowLeft } from 'lucide-react';

const categoryIcons = { SALON: Scissors, PETSHOP: PawPrint, CLINIC: Stethoscope, OTHER: Star };
const categoryColors = {
  SALON: 'from-pink-600 to-rose-500',
  PETSHOP: 'from-orange-600 to-amber-500',
  CLINIC: 'from-teal-600 to-cyan-500',
  OTHER: 'from-violet-600 to-purple-500',
};
const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [est, setEst] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/establishments/${id}`)
      .then(({ data }) => setEst(data))
      .catch(() => navigate('/establishments'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!est) return null;

  function handleBook(serviceId) {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role === 'PROVIDER') return;
    navigate(`/booking/${est.id}/${serviceId}`);
  }

  const CategoryIcon = categoryIcons[est.category] || Star;
  const gradientColor = categoryColors[est.category] || 'from-violet-600 to-purple-500';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </button>

      {/* Hero card */}
      <div className={`bg-gradient-to-br ${gradientColor} rounded-2xl p-8 mb-6 text-white`}>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
            <CategoryIcon className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{est.name}</h1>
              <Badge value={est.category} className="bg-white/20 text-white border-0" />
            </div>
            {est.description && (
              <p className="text-white/80 mb-4">{est.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-white/80">
              {est.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {est.address}
                </span>
              )}
              {est.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {est.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Services */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Serviços</h2>
          {est.services?.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">Nenhum serviço cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {est.services?.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-slate-100 p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-slate-500 mt-0.5">{service.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration} min
                      </span>
                      <span className="font-semibold text-slate-900">
                        R$ {Number(service.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {user?.role !== 'PROVIDER' && (
                    <Button onClick={() => handleBook(service.id)} size="sm">
                      Agendar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Working Hours */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Horários</h2>
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            {est.workingHours?.length === 0 ? (
              <p className="text-slate-400 text-sm">Não informado</p>
            ) : (
              <div className="space-y-2">
                {est.workingHours?.map((wh) => (
                  <div key={wh.id} className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{dayLabels[wh.dayOfWeek]}</span>
                    <span className="text-slate-500">
                      {wh.startTime} – {wh.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
