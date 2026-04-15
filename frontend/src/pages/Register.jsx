import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { CalendarCheck, User, Store, Mail, Phone, Lock } from 'lucide-react';

export default function Register() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.token, data.user);
      showToast('Conta criada com sucesso!', 'success');
      if (data.user.role === 'PROVIDER') navigate('/provider/dashboard');
      else navigate('/establishments');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <CalendarCheck className="w-8 h-8 text-indigo-400" />
          <span className="text-white font-bold text-2xl">AgendaFácil</span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
          Comece a agendar<br />
          <span className="text-indigo-400">hoje mesmo.</span>
        </h2>
        <p className="text-slate-400 text-lg">
          Crie sua conta gratuitamente e acesse os melhores serviços da sua região.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Criar conta</h1>
            <p className="text-slate-500 mt-1">Comece a usar o AgendaFácil</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'CLIENT' })}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                form.role === 'CLIENT'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <User className="w-4 h-4" />
              Sou Cliente
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, role: 'PROVIDER' })}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                form.role === 'PROVIDER'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Store className="w-4 h-4" />
              Sou Prestador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              icon={User}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
              required
            />
            <Input
              label="E-mail"
              type="email"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="seu@email.com"
              required
            />
            <Input
              label="Telefone"
              type="tel"
              icon={Phone}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
            <Input
              label="Senha"
              type="password"
              icon={Lock}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              required
            />

            {form.role === 'PROVIDER' && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm text-indigo-700">
                Após o cadastro, você poderá criar seu estabelecimento e configurar seus serviços.
              </div>
            )}

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Criar conta
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
