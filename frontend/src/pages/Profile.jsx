import { useState } from 'react';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function validate(form, changePassword) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Nome é obrigatório';
  if (changePassword) {
    if (!form.currentPassword) errors.currentPassword = 'Informe a senha atual';
    if (form.newPassword.length < 6) errors.newPassword = 'Mínimo 6 caracteres';
    if (form.newPassword !== form.confirmPassword) errors.confirmPassword = 'Senhas não coincidem';
  }
  return errors;
}

export default function Profile() {
  const { user, login, token } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changePassword, setChangePassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function field(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSave(e) {
    e.preventDefault();
    const errs = validate(form, changePassword);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (changePassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const { data } = await api.put('/auth/profile', payload);
      login(token, data.user);
      showToast('Perfil atualizado com sucesso!', 'success');
      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      setChangePassword(false);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  }

  const roleLabel = user?.role === 'PROVIDER' ? 'Prestador' : user?.role === 'ADMIN' ? 'Admin' : 'Cliente';
  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold text-foreground mb-6">Meu Perfil</h1>

      {/* Avatar card */}
      <div className="bg-card rounded-2xl border border-border p-6 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {initial}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{user?.name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {roleLabel}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Info section */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h3 className="font-semibold text-foreground border-b border-border pb-3">Informações pessoais</h3>
          <Input
            label="Nome completo"
            icon={User}
            value={form.name}
            onChange={(e) => field('name', e.target.value)}
            error={errors.name}
            placeholder="Seu nome"
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">E-mail</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-muted-foreground" />
              </div>
              <input
                disabled
                value={user?.email || ''}
                className="block w-full rounded-lg border border-border bg-muted/50 px-3 py-2 pl-9 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">O e-mail não pode ser alterado</p>
          </div>
          <Input
            label="Telefone"
            icon={Phone}
            value={form.phone}
            onChange={(e) => field('phone', e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>

        {/* Password section */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-foreground">Alterar senha</h3>
            <button
              type="button"
              onClick={() => { setChangePassword(!changePassword); setErrors({}); }}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              {changePassword ? 'Cancelar' : 'Alterar'}
            </button>
          </div>
          {changePassword ? (
            <>
              <Input
                label="Senha atual"
                type="password"
                icon={Lock}
                value={form.currentPassword}
                onChange={(e) => field('currentPassword', e.target.value)}
                error={errors.currentPassword}
                placeholder="••••••••"
              />
              <Input
                label="Nova senha"
                type="password"
                icon={Lock}
                value={form.newPassword}
                onChange={(e) => field('newPassword', e.target.value)}
                error={errors.newPassword}
                placeholder="Mínimo 6 caracteres"
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                icon={Lock}
                value={form.confirmPassword}
                onChange={(e) => field('confirmPassword', e.target.value)}
                error={errors.confirmPassword}
                placeholder="Repita a nova senha"
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">••••••••••••</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </div>
  );
}
