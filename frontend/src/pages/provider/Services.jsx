import { useState, useEffect } from 'react';
import { Plus, Pencil } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';

const emptyForm = { name: '', description: '', duration: 60, price: '', active: true };

export default function ProviderServices() {
  const { showToast } = useToast();
  const [establishments, setEstablishments] = useState([]);
  const [selectedEst, setSelectedEst] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
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
      .get(`/establishments/${selectedEst}/services`, { params: { all: true } })
      .then(({ data }) => setServices(data))
      .finally(() => setLoading(false));
  }, [selectedEst]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(service) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
      active: service.active,
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/services/${editing.id}`, form);
        setServices((prev) => prev.map((s) => (s.id === editing.id ? data : s)));
        showToast('Serviço atualizado!', 'success');
      } else {
        const { data } = await api.post(`/establishments/${selectedEst}/services`, form);
        setServices((prev) => [...prev, data]);
        showToast('Serviço criado!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service) {
    try {
      const { data } = await api.put(`/services/${service.id}`, { active: !service.active });
      setServices((prev) => prev.map((s) => (s.id === service.id ? data : s)));
    } catch {
      showToast('Erro ao atualizar', 'error');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Serviços</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie os serviços oferecidos pelo seu estabelecimento</p>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedEst}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Adicionar Serviço
        </button>
      </div>

      {establishments.length > 1 && (
        <Select
          label="Estabelecimento"
          value={selectedEst}
          onChange={(e) => setSelectedEst(e.target.value)}
          className="mb-6 max-w-xs"
        >
          {establishments.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </Select>
      )}

      {establishments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">Você não tem estabelecimentos cadastrados ainda.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-400">Nenhum serviço ainda</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Serviço</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Duração</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Preço</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr key={s.id} className={!s.active ? 'opacity-60' : ''}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{s.duration} min</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      R$ {Number(s.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(s)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          s.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Descrição (opcional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duração (minutos)"
              type="number"
              min={15}
              step={15}
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
              required
            />
            <Input
              label="Preço (R$)"
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
