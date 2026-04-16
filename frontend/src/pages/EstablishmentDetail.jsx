import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Clock, Star, ChevronRight, Images } from 'lucide-react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function EstablishmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [est, setEst] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/establishments/${id}`),
      api.get(`/ratings/establishment/${id}`).catch(() => ({ data: [] })),
    ]).then(([{ data: e }, { data: r }]) => {
      setEst(e);
      setRatings(r);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (!est) return <div className="text-center py-20 text-muted-foreground">Estabelecimento não encontrado.</div>;

  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Cover image */}
      <div className="relative h-56 rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
        {est.coverImage ? (
          <img src={est.coverImage} alt={est.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl opacity-20">🏪</span>
        )}
        {est.gallery?.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
            <Images className="w-3 h-3" /> Galeria ({est.gallery.length})
          </div>
        )}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{est.name}</h1>
            {avgRating && (
              <div className="flex items-center gap-1.5 mt-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{avgRating}</span>
                <span className="text-muted-foreground text-sm">({ratings.length} avaliações)</span>
              </div>
            )}
          </div>
          <Badge variant="secondary">{est.category}</Badge>
        </div>
        {est.description && <p className="text-muted-foreground mt-3">{est.description}</p>}
        <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
          {est.address && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{est.address}</span>}
          {est.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{est.phone}</span>}
        </div>
      </div>

      {/* Working hours */}
      {est.workingHours?.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Horários</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {est.workingHours.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map((wh) => (
                <div key={wh.id} className="flex justify-between text-muted-foreground">
                  <span>{DAYS[wh.dayOfWeek]}</span>
                  <span>{wh.startTime} – {wh.endTime}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Services */}
      {est.services?.filter((s) => s.active).length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="font-semibold mb-3">Serviços</h2>
            <div className="space-y-3">
              {est.services.filter((s) => s.active).map((service) => (
                <div key={service.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/30 transition-colors">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.duration} min{service.description ? ` · ${service.description}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-primary">R$ {service.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      onClick={() => isAuthenticated
                        ? navigate(`/booking/${est.id}/${service.id}`)
                        : navigate('/login')
                      }
                    >
                      Agendar <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Ratings */}
      {ratings.length > 0 && (
        <>
          <Separator />
          <div>
            <h2 className="font-semibold mb-4">Avaliações</h2>
            <div className="space-y-4">
              {ratings.map((r) => (
                <div key={r.id} className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.client?.name || 'Cliente'}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.score ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
