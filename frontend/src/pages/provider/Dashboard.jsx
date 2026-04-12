import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isToday, parseISO, isThisWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import Badge from '../../components/ui/Badge';

function StatCard({ label, value, icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    blue: 'bg-blue-50 text-blue-700',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function ProviderDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/appointments')
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  }, []);

  const todayAppts = appointments.filter((a) =>
    a.dateTime && isToday(parseISO(a.dateTime.replace('Z', '')))
  );
  const weekAppts = appointments.filter((a) =>
    a.dateTime && isThisWeek(parseISO(a.dateTime.replace('Z', '')), { weekStartsOn: 1 })
  );
  const pending = appointments.filter((a) => a.status === 'PENDING');
  const revenue = appointments
    .filter((a) => a.status === 'COMPLETED')
    .reduce((acc, a) => acc + (a.service?.price || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Agendamentos hoje" value={todayAppts.length} icon="📅" color="primary" />
        <StatCard label="Esta semana" value={weekAppts.length} icon="📊" color="blue" />
        <StatCard label="Pendentes" value={pending.length} icon="⏳" color="yellow" />
        <StatCard label="Receita total" value={`R$ ${revenue.toFixed(2)}`} icon="💰" color="green" />
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        {[
          { to: '/provider/establishment', label: 'Estabelecimento', icon: '🏪', desc: 'Editar dados do seu negócio' },
          { to: '/provider/services', label: 'Gerenciar Serviços', icon: '🛠', desc: 'Adicionar ou editar serviços' },
          { to: '/provider/schedule', label: 'Horários', icon: '🕐', desc: 'Configurar dias e horários' },
          { to: '/provider/appointments', label: 'Agendamentos', icon: '📋', desc: 'Ver todos os agendamentos' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group"
          >
            <div className="text-3xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
              {item.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Today's appointments */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Agendamentos de Hoje</h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
          </div>
        ) : todayAppts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {todayAppts.map((appt) => {
              const dt = parseISO(appt.dateTime.replace('Z', ''));
              return (
                <div key={appt.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{appt.client?.name}</p>
                    <p className="text-sm text-gray-500">
                      {appt.service?.name} · {format(dt, 'HH:mm')}
                    </p>
                  </div>
                  <Badge value={appt.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
