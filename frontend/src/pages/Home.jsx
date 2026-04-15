import { useNavigate } from 'react-router-dom';
import { Scissors, PawPrint, Stethoscope, Star, Calendar, Bell, Smartphone } from 'lucide-react';

const categories = [
  { id: 'SALON', label: 'Salão de Beleza', icon: Scissors, description: 'Cortes, colorações e tratamentos' },
  { id: 'PETSHOP', label: 'Pet Shop', icon: PawPrint, description: 'Banho, tosa e veterinário' },
  { id: 'CLINIC', label: 'Clínica', icon: Stethoscope, description: 'Consultas e exames' },
  { id: 'OTHER', label: 'Outros', icon: Star, description: 'Diversos serviços' },
];

const features = [
  { icon: Calendar, title: 'Agendamento Fácil', desc: 'Escolha data e horário disponível em segundos' },
  { icon: Bell, title: 'Confirmação Imediata', desc: 'Receba confirmação do prestador diretamente' },
  { icon: Smartphone, title: 'Acesse de Qualquer Lugar', desc: 'Funciona perfeitamente no celular e computador' },
];

const stats = [
  { value: '500+', label: 'Estabelecimentos' },
  { value: '10.000+', label: 'Agendamentos realizados' },
  { value: '4.8★', label: 'Avaliação média' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-900 text-white py-28">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Agende seus<br />
            <span className="text-indigo-400">serviços favoritos</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Encontre os melhores estabelecimentos da sua região e agende online em instantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/establishments')}
              className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-lg"
            >
              Ver Estabelecimentos
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 border border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-lg"
            >
              Cadastre seu Negócio
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-3 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-indigo-600">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-semibold text-center text-slate-900 mb-3">Categorias</h2>
        <p className="text-center text-slate-500 mb-10">Encontre o serviço que você precisa</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => navigate(`/establishments?category=${cat.id}`)}
                className="group p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">{cat.label}</h3>
                <p className="text-sm text-slate-500">{cat.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center text-slate-900 mb-12">Por que usar o AgendaFácil?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-xl text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Pronto para começar?</h2>
          <p className="text-indigo-200 mb-8">Crie sua conta gratuitamente e agende agora mesmo.</p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-lg shadow-lg"
          >
            Criar Conta Grátis
          </button>
        </div>
      </section>
    </div>
  );
}
