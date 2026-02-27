import { useState, useEffect } from 'react';
import { getFilmes, Filme } from '../services/api';
import { toast } from '../hooks/useToast';
import { Badge, PageHeader, Card, EmptyState, Spinner } from '../components/UI';

const classColors: Record<string, string> = {
  L: '#10b981', '10': '#f59e0b', '12': '#f97316', '14': '#ef4444', '16': '#dc2626', '18': '#991b1b',
};

export function FilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getFilmes()
      .then(setFilmes)
      .catch(() => toast.error('Erro ao carregar filmes'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filmes.filter(f =>
    f.titulo.toLowerCase().includes(search.toLowerCase()) ||
    f.genero.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader title="Filmes em Cartaz" subtitle={`${filmes.length} filmes disponíveis`} />

      <div style={{ marginBottom: '1.25rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Buscar por título ou gênero..."
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '0.625rem 1rem',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            outline: 'none',
            width: '320px',
          }}
        />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="🎬" message="Nenhum filme encontrado" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(f => (
            <Card key={f.id} style={{ overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s' }}
              // @ts-ignore
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              {/* Poster */}
              <div style={{
                height: '200px',
                background: f.poster_url
                  ? `url(${f.poster_url}) center/cover`
                  : `linear-gradient(135deg, hsl(${(f.id * 67) % 360},50%,20%), hsl(${(f.id * 67 + 60) % 360},50%,15%))`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                position: 'relative',
              }}>
                {!f.poster_url && '🎬'}
                {f.classificacao && (
                  <div style={{
                    position: 'absolute', top: '0.5rem', right: '0.5rem',
                    background: classColors[f.classificacao] ?? '#475569',
                    color: '#fff', borderRadius: '6px', padding: '0.2rem 0.5rem',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {f.classificacao}
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem' }}>
                <h3 style={{ color: '#f1f5f9', margin: '0 0 0.375rem', fontSize: '1rem', fontWeight: 700, lineHeight: 1.3 }}>
                  {f.titulo}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Badge label={f.genero} />
                  <span style={{ color: '#475569', fontSize: '0.8rem' }}>⏱ {f.duracao_min} min</span>
                </div>
                {f.sinopse && (
                  <p style={{
                    color: '#475569', fontSize: '0.8rem', margin: 0,
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {f.sinopse}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
