import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Mail, Lock, User, Phone } from 'lucide-react';
import { signUp, signIn, sendVerificationEmail } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const ROLES = [
  { value: 'CLIENT', label: 'Sou cliente', description: 'Quero agendar serviços' },
  { value: 'PROVIDER', label: 'Sou prestador', description: 'Quero oferecer serviços' },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CLIENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  function handleGoogleRegister() {
    const api = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/api$/, '');
    const cb = encodeURIComponent(`${window.location.origin}/establishments`);
    window.location.href = `${api}/api/google-login?role=${form.role}&callbackURL=${cb}`;
  }

  async function handleResend() {
    setResending(true);
    setResendMessage('');
    const { error: err } = await sendVerificationEmail({ email: form.email, callbackURL: `${window.location.origin}/verify-email` });
    setResending(false);
    setResendMessage(err ? 'Erro ao reenviar. Tente novamente.' : 'Email reenviado! Verifique sua caixa de entrada.');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signUp.email({
      email: form.email,
      password: form.password,
      name: form.name,
      role: form.role,
      phone: form.phone || undefined,
    });
    setLoading(false);
    if (err) { setError(err.message || 'Erro ao criar conta'); return; }
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-5xl">📧</div>
          <h1 className="text-2xl font-bold">Verifique seu email</h1>
          <p className="text-muted-foreground">Enviamos um link de verificação para <strong>{form.email}</strong>. Clique no link para ativar sua conta.</p>
          <p className="text-sm text-muted-foreground">Não recebeu? Verifique a pasta de spam ou reenvie abaixo.</p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleResend} disabled={resending}>
              {resending ? 'Reenviando...' : 'Reenviar email de verificação'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/login')}>Ir para o Login</Button>
          </div>
          {resendMessage && (
            <p className={`text-sm ${resendMessage.startsWith('Erro') ? 'text-destructive' : 'text-green-600'}`}>
              {resendMessage}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-slate-950 flex-col justify-center px-16">
        <div className="flex items-center gap-3 mb-8">
          <CalendarCheck className="w-8 h-8 text-primary" />
          <span className="text-white font-bold text-2xl">AgendaFácil</span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
          Comece agora,<br />
          <span className="text-primary">é gratuito.</span>
        </h2>
        <p className="text-slate-400 text-lg">Crie sua conta e agende ou ofereça serviços em minutos.</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Criar conta</h1>
            <p className="text-muted-foreground mt-1">Preencha os dados abaixo para começar</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button key={r.value} type="button" onClick={() => setForm({ ...form, role: r.value })}
                className={`p-4 rounded-xl border text-left transition-all ${form.role === r.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}>
                <p className="font-semibold text-sm">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleGoogleRegister} type="button">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </Button>

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">ou</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" className="pl-9" placeholder="Seu nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="reg-email" type="email" className="pl-9" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="phone" type="tel" className="pl-9" placeholder="(11) 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="reg-password" type="password" className="pl-9" placeholder="Mínimo 8 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
