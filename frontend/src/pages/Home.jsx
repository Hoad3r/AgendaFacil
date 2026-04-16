import { useNavigate } from 'react-router-dom';
import { Scissors, PawPrint, Stethoscope, Star, Calendar, Bell, Smartphone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const categories = [
  { id: 'SALON', label: 'Salão de Beleza', icon: Scissors, color: 'bg-pink-50 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 border-pink-100 dark:border-pink-900/50 hover:border-pink-300' },
  { id: 'PETSHOP', label: 'Pet Shop', icon: PawPrint, color: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/50 hover:border-green-300' },
  { id: 'CLINIC', label: 'Clínica', icon: Stethoscope, color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50 hover:border-amber-300' },
  { id: 'OTHER', label: 'Outros', icon: Star, color: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50 hover:border-purple-300' },
];

const features = [
  { icon: Calendar, title: 'Agendamento fácil', desc: 'Escolha data e horário disponível em segundos' },
  { icon: Bell, title: 'Confirmação imediata', desc: 'Receba confirmação por email automaticamente' },
  { icon: Smartphone, title: 'Acesse de qualquer lugar', desc: 'Funciona perfeitamente no celular e computador' },
];

const stats = [
  { value: '500+', label: 'Estabelecimentos' },
  { value: '10.000+', label: 'Agendamentos realizados' },
  { value: '4.8★', label: 'Avaliação média' },
];

export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  function handleSearch(e) {
    e.preventDefault();
    navigate(`/establishments${search ? `?q=${encodeURIComponent(search)}` : ''}`);
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Encontre e agende<br />
            <span className="text-primary">em segundos</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Salões, clínicas, pet shops e muito mais perto de você.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9 h-11 text-base"
                placeholder="Buscar estabelecimento ou serviço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-11 px-6">Buscar</Button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-900 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-3 gap-4 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl md:text-3xl font-bold text-primary">{s.value}</p>
                <p className="text-xs md:text-sm text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-2">Categorias</h2>
        <p className="text-center text-muted-foreground mb-10">Encontre o serviço que você precisa</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/establishments?category=${cat.id}`)}
                className={`group p-5 rounded-2xl border transition-all text-left ${cat.color}`}
              >
                <Icon className="w-6 h-6 mb-3" />
                <p className="font-semibold text-sm">{cat.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">Por que usar o AgendaFácil?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-card border rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">Pronto para começar?</h2>
          <p className="text-primary-foreground/80 mb-8">Crie sua conta gratuitamente e agende agora mesmo.</p>
          <Button variant="secondary" size="lg" onClick={() => navigate('/register')}>
            Criar Conta Grátis
          </Button>
        </div>
      </section>
    </div>
  );
}
