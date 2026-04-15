import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { CalendarCheck, Mail, Lock } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      showToast(`Bem-vindo, ${data.user.name}!`, 'success');
      if (data.user.role === 'PROVIDER') navigate('/provider/dashboard');
      else if (data.user.role === 'ADMIN') navigate('/establishments');
      else navigate('/establishments');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
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
          Seus agendamentos,<br />
          <span className="text-indigo-400">simplificados.</span>
        </h2>
        <p className="text-slate-400 text-lg">
          Gerencie seus serviços e horários em um só lugar.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
            <p className="text-slate-500 mt-1">Entre na sua conta para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              label="Senha"
              type="password"
              icon={Lock}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" className="mt-2">
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link to="/register" className="text-indigo-600 font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
            <p className="font-semibold mb-2 text-slate-700">Contas de teste:</p>
            <p>Cliente: carlos@email.com / client123</p>
            <p>Prestador: joao@salao.com / provider123</p>
            <p>Admin: admin@agendafacil.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
