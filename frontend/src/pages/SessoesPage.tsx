import { useState, useEffect } from 'react';
import { getSessoes, getFilmes, Sessao, Filme } from '../services/api';
import { toast } from '../hooks/useToast';
import { Badge, PageHeader, Card, EmptyState, Spinner } from '../components/UI';
import { useNavigate } from 'react-router-dom';

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function SessoesPage() {
  const navigate = useNavigate();
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [loading, setLoading] = useState(true);
  const [filmeFilter, setFilmeFilter] = useState('');
  const [dataFilter, setDataFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        getSessoes({
          filme_id: filmeFilter ? Number(filmeFilter) : undefined,
          data: dataFilter || undefined,
        }),
        getFilmes(),
      ]);
      setSessoes(s);
      setFilmes(f);
    } catch {
      toast.error('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filmeFilter, dataFilter]);

  const tipeColor: Record<string, string> = {
    'IMAX': '#818cf8',
    '3D': '#22d3ee',
    '2D': '#94a3b8',
  };

  return (
    <div>
      <PageHeader title="Sessões" subtitle={`${sessoes.length} sessões encontradas`} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <select
          value={filmeFilter}
          onChange={e => setFilmeFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '0.625rem 1rem',
            color: '#e2e8f0',
            fontSize: '0.9rem',
            outline: 'none',
            minWidth: '200px',
          }}
        >
          <option value="">🎬 Todos os filmes</option>
          {filmes.map(f => <option key={f.id} value={f.id} style={{ background: '#0f0f23' }}>{f.titulo}</option>)}
        </select>

        <input
          type="date"
          value={dataFilter}
          onChange={e => setDataFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '0.625rem 1rem',
            color: dataFilter ? '#e2e8f0' : '#475569',
            fontSize: '0.9rem',
            outline: 'none',
            colorScheme: 'dark',
          }}
        />

        {(filmeFilter || dataFilter) && (
          <button
            onClick={() => { setFilmeFilter(''); setDataFilter(''); }}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: '10px',
              padding: '0.625rem 1rem',
              color: '#ef4444',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            ✕ Limpar
          </button>
        )}
      </div>

      <Card>
        {loading ? <Spinner /> : sessoes.length === 0 ? (
          <EmptyState icon="🎭" message="Nenhuma sessão encontrada" />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['ID', 'Filme', 'Sala', 'Data/Hora', 'Valor', 'Disponíveis', 'Ação'].map(h => (
                    <th key={h} style={{
                      padding: '0.875rem 1rem', textAlign: 'left',
                      color: '#475569', fontSize: '0.75rem',
                      fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessoes.map((s, i) => {
                  const tipo = s.sala.split(' - ')[1] ?? '2D';
                  const disponivel = s.assentos_disponiveis;
                  return (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,229,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                    >
                      <td style={{ padding: '0.875rem 1rem', color: '#475569', fontSize: '0.8rem' }}>#{s.id}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#f1f5f9', fontWeight: 600 }}>{s.filme}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>{s.sala.split(' - ')[0]}</div>
                        <span style={{
                          fontSize: '0.7rem', fontWeight: 700,
                          color: tipeColor[tipo] ?? '#94a3b8',
                        }}>{tipo}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {formatDate(s.data_hora)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                        R$ {Number(s.valor_unitario).toFixed(2)}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {disponivel !== undefined ? (
                          <span style={{
                            color: disponivel > 10 ? '#10b981' : disponivel > 0 ? '#f59e0b' : '#ef4444',
                            fontWeight: 600, fontSize: '0.875rem',
                          }}>
                            {disponivel} lugares
                          </span>
                        ) : <span style={{ color: '#475569' }}>—</span>}
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button
                          onClick={() => navigate(`/reservas/nova?sessao=${s.id}`)}
                          style={{
                            background: 'rgba(79,70,229,0.15)',
                            border: '1px solid rgba(79,70,229,0.3)',
                            color: '#818cf8',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                          }}
                        >
                          🎟 Reservar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
