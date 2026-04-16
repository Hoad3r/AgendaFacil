import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Star } from 'lucide-react';
import api from '@/services/api';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'SALON', label: '✂ Salão' },
  { value: 'PETSHOP', label: '🐾 Pet Shop' },
  { value: 'CLINIC', label: '🏥 Clínica' },
  { value: 'OTHER', label: '⭐ Outros' },
];

const CATEGORY_COLORS = {
  SALON: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  PETSHOP: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CLINIC: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  OTHER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function Establishments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');

  useEffect(() => {
    api.get('/establishments').then(({ data }) => setEstablishments(data)).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return establishments.filter((e) => {
      const matchesQuery = !query || e.name.toLowerCase().includes(query.toLowerCase()) || (e.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !category || e.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [establishments, query, category]);

  function handleCategoryClick(value) {
    setCategory(value);
    const params = {};
    if (query) params.q = query;
    if (value) params.category = value;
    setSearchParams(params);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Estabelecimentos</h1>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome ou descrição..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => handleCategoryClick(cat.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              category === cat.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">Nenhum estabelecimento encontrado.</p>
          <p className="text-sm mt-1">Tente buscar com outros termos.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((est) => (
            <button
              key={est.id}
              onClick={() => navigate(`/establishments/${est.id}`)}
              className="text-left group rounded-2xl border bg-card overflow-hidden hover:shadow-md transition-all hover:border-primary/30"
            >
              <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden">
                {est.coverImage ? (
                  <img src={est.coverImage} alt={est.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <span className="text-4xl opacity-30">🏪</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{est.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${CATEGORY_COLORS[est.category] || CATEGORY_COLORS.OTHER}`}>
                    {CATEGORIES.find((c) => c.value === est.category)?.label?.replace(/^[^\s]+ /, '') || est.category}
                  </span>
                </div>
                {est.averageRating != null && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">{est.averageRating.toFixed(1)} ({est.ratingCount})</span>
                  </div>
                )}
                {est.address && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground truncate">{est.address}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
