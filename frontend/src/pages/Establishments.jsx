import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const categories = [
  { id: '', label: 'Todos' },
  { id: 'SALON', label: 'Salão' },
  { id: 'PETSHOP', label: 'Pet Shop' },
  { id: 'CLINIC', label: 'Clínica' },
  { id: 'OTHER', label: 'Outros' },
];

const categoryIcons = { SALON: '✂️', PETSHOP: '🐾', CLINIC: '🏥', OTHER: '⭐' };

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estabelecimentos</h1>
        <p className="text-gray-500">Encontre os melhores serviços perto de você</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSearchParams(cat.id ? { category: cat.id } : {})}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:ml-auto px-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">Nenhum estabelecimento encontrado</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((est) => (
            <Card
              key={est.id}
              onClick={() => navigate(`/establishments/${est.id}`)}
              className="p-6 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-2xl">
                  {categoryIcons[est.category] || '⭐'}
                </div>
                <Badge value={est.category} />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-1">{est.name}</h3>
              {est.description && (
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{est.description}</p>
              )}
              {est.address && (
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  📍 {est.address}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">
                  {est._count?.services || 0} serviço{est._count?.services !== 1 ? 's' : ''}
                </span>
                <span className="text-xs font-medium text-primary-600">Ver detalhes →</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
