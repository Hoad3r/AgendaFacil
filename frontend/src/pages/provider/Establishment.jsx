import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';

const CATEGORIES = [
  { value: 'SALON', label: 'Salão de Beleza' },
  { value: 'PETSHOP', label: 'Pet Shop' },
  { value: 'CLINIC', label: 'Clínica' },
  { value: 'OTHER', label: 'Outro' },
];

const emptyForm = {
  name: '',
  description: '',
  category: 'SALON',
  address: '',
  phone: '',
};

export default function ProviderEstablishment() {
  const { showToast } = useToast();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchEstablishments();
  }, []);

  async function fetchEstablishments() {
    setLoading(true);
    try {
      const { data } = await api.get('/establishments/my');
      setEstablishments(data);
    } catch {
      showToast('Erro ao carregar estabelecimentos', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(est) {
    setEditing(est);
    setForm({
      name: est.name,
      description: est.description || '',
      category: est.category,
      address: est.address || '',
      phone: est.phone || '',
    });
    setModalOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/establishments/${editing.id}`, form);
        setEstablishments((prev) => prev.map((e) => (e.id === editing.id ? data : e)));
        showToast('Estabelecimento atualizado!', 'success');
      } else {
        const { data } = await api.post('/establishments', form);
        setEstablishments((prev) => [...prev, data]);
        showToast('Estabelecimento criado!', 'success');
      }
      setModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await api.delete(`/establishments/${deleteModal.id}`);
      setEstablishments((prev) => prev.filter((e) => e.id !== deleteModal.id));
      showToast('Estabelecimento excluído!', 'success');
      setDeleteModal(null);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao excluir', 'error');
    } finally {
      setDeleting(false);
    }
  }

  function field(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Estabelecimentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as informações dos seus estabelecimentos</p>
        </div>
        <Button onClick={openCreate}>+ Novo Estabelecimento</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : establishments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-gray-700 font-medium mb-1">Nenhum estabelecimento cadastrado</p>
          <p className="text-gray-400 text-sm mb-6">Crie seu estabelecimento para começar a receber agendamentos</p>
          <Button onClick={openCreate}>Criar Estabelecimento</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {establishments.map((est) => (
            <div
              key={est.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-gray-900">{est.name}</h2>
                  <Badge value={est.category} />
                </div>
                {est.description && (
                  <p className="text-sm text-gray-600 mb-2">{est.description}</p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  {est.address && (
                    <span className="flex items-center gap-1">
                      <span>📍</span> {est.address}
                    </span>
                  )}
                  {est.phone && (
                    <span className="flex items-center gap-1">
                      <span>📞</span> {est.phone}
                    </span>
                  )}
                  {est._count?.services !== undefined && (
                    <span className="flex items-center gap-1">
                      <span>🛠</span> {est._count.services} serviço{est._count.services !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="secondary" size="sm" onClick={() => openEdit(est)}>
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteModal(est)}>
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nome do estabelecimento"
            value={form.name}
            onChange={(e) => field('name', e.target.value)}
            required
          />
          <Input
            label="Descrição (opcional)"
            value={form.description}
            onChange={(e) => field('description', e.target.value)}
          />
          <Select
            label="Categoria"
            value={form.category}
            onChange={(e) => field('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <Input
            label="Endereço (opcional)"
            value={form.address}
            onChange={(e) => field('address', e.target.value)}
          />
          <Input
            label="Telefone (opcional)"
            value={form.phone}
            onChange={(e) => field('phone', e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" fullWidth loading={saving}>
              {editing ? 'Salvar Alterações' : 'Criar Estabelecimento'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Excluir Estabelecimento"
      >
        <p className="text-gray-600 mb-2">
          Tem certeza que deseja excluir <strong>{deleteModal?.name}</strong>?
        </p>
        <p className="text-sm text-red-600 mb-6">
          Esta ação é irreversível e removerá todos os serviços e horários associados.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setDeleteModal(null)}>
            Cancelar
          </Button>
          <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
