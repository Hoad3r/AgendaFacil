import { useNavigate } from 'react-router-dom';

const categories = [
  { id: 'SALON', label: 'Salão de Beleza', icon: '✂️', description: 'Cortes, colorações e tratamentos', color: 'from-pink-500 to-rose-500' },
  { id: 'PETSHOP', label: 'Pet Shop', icon: '🐾', description: 'Banho, tosa e veterinário', color: 'from-orange-500 to-amber-500' },
  { id: 'CLINIC', label: 'Clínica', icon: '🏥', description: 'Consultas e exames', color: 'from-teal-500 to-cyan-500' },
  { id: 'OTHER', label: 'Outros', icon: '⭐', description: 'Diversos serviços', color: 'from-purple-500 to-violet-500' },
];

const features = [
  { icon: '📅', title: 'Agendamento Fácil', desc: 'Escolha data e horário disponível em segundos' },
  { icon: '🔔', title: 'Confirmação Imediata', desc: 'Receba confirmação do prestador diretamente' },
  { icon: '📱', title: 'Acesse de Qualquer Lugar', desc: 'Funciona perfeitamente no celular e computador' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Agende seus<br />
            <span className="text-primary-300">serviços favoritos</span>
          </h1>
          <p className="text-xl text-primary-200 mb-10 max-w-2xl mx-auto">
            Encontre os melhores estabelecimentos da sua região e agende online em instantes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/establishments')}
              className="px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors text-lg shadow-lg"
            >
              Ver Estabelecimentos
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl border-2 border-primary-400 hover:bg-primary-500 transition-colors text-lg"
            >
              Cadastre seu Negócio
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Categorias</h2>
        <p className="text-center text-gray-500 mb-10">Encontre o serviço que você precisa</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/establishments?category=${cat.id}`)}
              className="group p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1 text-left"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{cat.label}</h3>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Por que usar o AgendaFácil?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-xl text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pronto para começar?</h2>
        <p className="text-gray-500 mb-8">Crie sua conta gratuitamente e agende agora mesmo.</p>
        <button
          onClick={() => navigate('/register')}
          className="px-10 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors text-lg shadow-lg"
        >
          Criar Conta Grátis
        </button>
      </section>
    </div>
  );
}
