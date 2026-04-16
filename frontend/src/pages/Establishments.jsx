import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Scissors, PawPrint, Stethoscope, Star, Search, MapPin } from 'lucide-react';
import api from '../services/api';
import Input from '../components/ui/Input';

const categoryIcons = { SALON: Scissors, PETSHOP: PawPrint, CLINIC: Stethoscope, OTHER: Star };
const categoryColors = {
  SALON: 'bg-gradient-to-r from-pink-500 to-rose-400',
  PETSHOP: 'bg-gradient-to-r from-orange-500 to-amber-400',
  CLINIC: 'bg-gradient-to-r from-teal-500 to-cyan-400',
  OTHER: 'bg-gradient-to-r from-violet-500 to-purple-400',
};

const categories = [
  { id: '', label: 'Todos', icon: null },
  { id: 'SALON', label: 'Salão', icon: Scissors },
  { id: 'PETSHOP', label: 'Pet Shop', icon: PawPrint },
  { id: 'CLINIC', label: 'Clínica', icon: Stethoscope },
  { id: 'OTHER', label: 'Outros', icon: Star },
];

export default function Establishments() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/establishments', { params: category ? { category } : {} })
      .then(({ data }) => setEstablishments(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = establishments.filter(
    (e) => !search || e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Estabelecimentos</h1>
        <p className="text-slate-500">
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSearchParams(cat.id ? { category: cat.id } : {})}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
        <div className="sm:ml-auto w-full sm:w-64">
          <Input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="[&_input]:rounded-xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Nenhum estabelecimento encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((est) => (
            <div
              key={est.id}
              onClick={() => navigate(`/establishments/${est.id}`)}
              className="bg-white rounded-2xl border border-slate-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              {/* Color stripe */}
              <div className={`h-1.5 ${categoryColors[est.category] || 'bg-slate-200'}`} />
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    {(() => { const Icon = categoryIcons[est.category]; return Icon ? <Icon className="w-5 h-5 text-indigo-600" /> : null; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{est.name}</h3>
                    {est.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">{est.description}</p>
                    )}
                  </div>
                </div>
                {est.address && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {est.address}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">
                    {est._count?.services || 0} serviço{est._count?.services !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs font-medium text-indigo-600">Ver detalhes →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
