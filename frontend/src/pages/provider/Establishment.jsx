import { useState, useEffect } from 'react';
import {
  Plus, Store, Pencil, Trash2, MapPin, Phone, Wrench,
  Scissors, PawPrint, Stethoscope, Star,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NativeSelect from '@/components/ui/select';
import Modal from '../../components/ui/modal';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { value: 'SALON', label: 'Salão de Beleza' },
  { value: 'PETSHOP', label: 'Pet Shop' },
  { value: 'CLINIC', label: 'Clínica' },
  { value: 'OTHER', label: 'Outro' },
];

const categoryIcons = { SALON: Scissors, PETSHOP: PawPrint, CLINIC: Stethoscope, OTHER: Store };

const categoryColors = {
  SALON: 'bg-gradient-to-r from-pink-500 to-rose-400',
  PETSHOP: 'bg-gradient-to-r from-orange-500 to-amber-400',
  CLINIC: 'bg-gradient-to-r from-teal-500 to-cyan-400',
  OTHER: 'bg-gradient-to-r from-violet-500 to-purple-400',
};

const emptyForm = {
  name: '',
  description: '',
  category: 'SALON',
  address: '',
  phone: '',
  coverImage: '',
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
  const [uploadingCover, setUploadingCover] = useState(false);

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
      coverImage: est.coverImage || '',
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

  async function uploadImage(file) {
    const { data: sig } = await api.get('/upload/signature');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', sig.signature);
    formData.append('timestamp', sig.timestamp);
    formData.append('api_key', sig.apiKey);
    formData.append('folder', sig.folder);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.secure_url;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus Estabelecimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie as informações dos seus estabelecimentos</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Estabelecimento
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : establishments.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Nenhum estabelecimento cadastrado</p>
          <p className="text-muted-foreground text-sm mb-6">Crie seu estabelecimento para começar a receber agendamentos</p>
          <Button onClick={openCreate}>
            Criar Estabelecimento
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {establishments.map((est) => {
            const Icon = categoryIcons[est.category] || Store;
            return (
              <div key={est.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className={`h-1.5 ${categoryColors[est.category] || 'bg-muted'}`} />
                <div className="p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-lg font-semibold text-foreground">{est.name}</h2>
                        <Badge value={est.category} />
                      </div>
                      {est.description && <p className="text-sm text-muted-foreground mb-2">{est.description}</p>}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {est.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />{est.address}
                          </span>
                        )}
                        {est.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />{est.phone}
                          </span>
                        )}
                        {est._count?.services !== undefined && (
                          <span className="flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5" />{est._count.services} serviço{est._count.services !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEdit(est)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-accent transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteModal(est)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/20 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Estabelecimento' : 'Novo Estabelecimento'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-sm font-semibold text-foreground mb-3">Dados básicos</p>
          <Input
            label="Nome do estabelecimento"
            placeholder="Ex: Salão da Maria"
            value={form.name}
            onChange={(e) => field('name', e.target.value)}
            required
          />
          <Input
            label="Descrição (opcional)"
            placeholder="Ex: Cortes, coloração e tratamentos capilares"
            value={form.description}
            onChange={(e) => field('description', e.target.value)}
          />
          <NativeSelect
            label="Categoria"
            value={form.category}
            onChange={(e) => field('category', e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </NativeSelect>
          <Input
            label="Endereço (opcional)"
            placeholder="Ex: Rua das Flores, 123 - Centro"
            value={form.address}
            onChange={(e) => field('address', e.target.value)}
          />
          <Input
            label="Telefone (opcional)"
            placeholder="Ex: (11) 98765-4321"
            value={form.phone}
            onChange={(e) => field('phone', e.target.value)}
          />
          <div className="space-y-2">
            <Label>Foto de capa</Label>
            {form.coverImage && (
              <img src={form.coverImage} alt="Capa" className="h-32 w-full object-cover rounded-xl" />
            )}
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                id="coverImage"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    setUploadingCover(true);
                    const url = await uploadImage(file);
                    setForm((f) => ({ ...f, coverImage: url }));
                  } catch (err) {
                    console.error('Upload error:', err);
                  } finally {
                    setUploadingCover(false);
                  }
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('coverImage').click()} disabled={uploadingCover}>
                {uploadingCover ? 'Enviando...' : 'Escolher foto'}
              </Button>
              {form.coverImage && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}>
                  Remover
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Salvando...' : (editing ? 'Salvar Alterações' : 'Criar Estabelecimento')}
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
        <div className="bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-400 rounded-lg px-4 py-3 mb-4 text-sm">
          <p className="font-medium mb-1">
            Tem certeza que deseja excluir <strong>{deleteModal?.name}</strong>?
          </p>
          <p>
            Esta ação é irreversível e removerá todos os serviços e horários associados.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" disabled={deleting} onClick={handleDelete}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
