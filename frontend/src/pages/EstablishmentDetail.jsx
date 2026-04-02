import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

const categoryIcons = { SALON: '✂️', PETSHOP: '🐾', CLINIC: '🏥', OTHER: '⭐' };
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!est) return null;

  function handleBook(serviceId) {
    if (!isAuthenticated) return navigate('/login');
    if (user?.role === 'PROVIDER') return;
    navigate(`/booking/${est.id}/${serviceId}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-3xl flex-shrink-0">
            {categoryIcons[est.category] || '⭐'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{est.name}</h1>
              <Badge value={est.category} />
            </div>
            {est.description && <p className="text-gray-500 mb-3">{est.description}</p>}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {est.address && <span className="flex items-center gap-1">📍 {est.address}</span>}
              {est.phone && <span className="flex items-center gap-1">📞 {est.phone}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Services */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Serviços</h2>
          {est.services?.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400">Nenhum serviço cadastrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {est.services?.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {service.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{service.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>⏱ {service.duration} min</span>
                      <span className="font-semibold text-gray-900">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Horários</h2>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            {est.workingHours?.length === 0 ? (
              <p className="text-gray-400 text-sm">Não informado</p>
            ) : (
              <div className="space-y-2">
                {est.workingHours?.map((wh) => (
                  <div key={wh.id} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{dayLabels[wh.dayOfWeek]}</span>
                    <span className="text-gray-500">
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
