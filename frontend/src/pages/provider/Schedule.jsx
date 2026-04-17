import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

const days = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

function defaultHours() {
  return days.map((d) => ({
    dayOfWeek: d.value,
    active: d.value >= 1 && d.value <= 5,
    startTime: '08:00',
    endTime: '18:00',
  }));
}

export default function ProviderSchedule() {
  const { showToast } = useToast();
  const [establishments, setEstablishments] = useState([]);
  const [selectedEst, setSelectedEst] = useState('');
  const [hours, setHours] = useState(defaultHours());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/establishments/my').then(({ data }) => {
      setEstablishments(data);
      if (data.length > 0) setSelectedEst(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedEst) return;
    setLoading(true);
    api
      .get(`/establishments/${selectedEst}/working-hours`)
      .then(({ data }) => {
        const base = defaultHours();
        data.forEach((wh) => {
          const idx = base.findIndex((h) => h.dayOfWeek === wh.dayOfWeek);
          if (idx >= 0) {
            base[idx] = { ...base[idx], active: true, startTime: wh.startTime, endTime: wh.endTime };
          }
        });
        if (data.length > 0) {
          base.forEach((h) => {
            if (!data.find((wh) => wh.dayOfWeek === h.dayOfWeek)) h.active = false;
          });
        }
        setHours(base);
      })
      .finally(() => setLoading(false));
  }, [selectedEst]);

  function update(dayOfWeek, field, value) {
    setHours((prev) =>
      prev.map((h) => (h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h))
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = hours
        .filter((h) => h.active)
        .map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }));
      await api.post(`/establishments/${selectedEst}/working-hours`, payload);
      showToast('Horários salvos com sucesso!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Horários de Funcionamento</h1>
      <p className="text-slate-500 mb-6">Configure os dias e horários em que você atende</p>

      {establishments.length > 1 && (
        <Select
          label="Estabelecimento"
          value={selectedEst}
          onChange={(e) => setSelectedEst(e.target.value)}
          className="mb-6"
        >
          {establishments.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {hours.map((h, idx) => (
            <div
              key={h.dayOfWeek}
              className={`flex items-center gap-4 px-6 py-4 ${idx < hours.length - 1 ? 'border-b border-slate-100' : ''}`}
            >
              <label className="flex items-center gap-3 w-40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={h.active}
                  onChange={(e) => update(h.dayOfWeek, 'active', e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className={`text-sm font-medium ${h.active ? 'text-slate-900' : 'text-slate-400'}`}>
                  {days[h.dayOfWeek].label}
                </span>
              </label>

              {h.active ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="time"
                    value={h.startTime}
                    onChange={(e) => update(h.dayOfWeek, 'startTime', e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-slate-400 text-sm">até</span>
                  <input
                    type="time"
                    value={h.endTime}
                    onChange={(e) => update(h.dayOfWeek, 'endTime', e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <span className="text-sm text-slate-400 flex-1">Fechado</span>
              )}
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleSave} loading={saving} disabled={!selectedEst || loading} size="lg">
        Salvar Horários
      </Button>
    </div>
  );
}
