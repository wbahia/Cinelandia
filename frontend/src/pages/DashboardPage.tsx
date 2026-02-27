import { useEffect, useState } from 'react';
import { getClientes, getFilmes, getSessoes } from '../services/api';
import { Card, Spinner } from '../components/UI';
import { useNavigate } from 'react-router-dom';

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ clientes: 0, filmes: 0, sessoes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getClientes(), getFilmes(), getSessoes()])
      .then(([c, f, s]) => setStats({ clientes: c.length, filmes: f.length, sessoes: s.length }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Clientes', count: stats.clientes, icon: '👤', color: '#4f46e5', path: '/clientes' },
    { label: 'Filmes', count: stats.filmes, icon: '🎬', color: '#e63946', path: '/filmes' },
    { label: 'Sessões', count: stats.sessoes, icon: '🎭', color: '#0891b2', path: '/sessoes' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#f1f5f9', margin: '0 0 0.25rem', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: '"Bebas Neue", cursive' }}>
          🎬 Cinelandia
        </h1>
        <p style={{ color: '#475569', margin: 0 }}>Painel administrativo do sistema de reservas</p>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {cards.map(c => (
            <Card
              key={c.label}
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
              // @ts-ignore
              onClick={() => navigate(c.path)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${c.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${c.color}15`, border: `1px solid ${c.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', marginBottom: '1rem',
              }}>
                {c.icon}
              </div>
              <div style={{ color: '#f1f5f9', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>
                {c.count}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>{c.label}</div>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ padding: '1.5rem' }}>
        <h2 style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Ações Rápidas
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: '+ Novo Cliente', path: '/clientes', color: '#4f46e5' },
            { label: '🎟 Nova Reserva', path: '/reservas/nova', color: '#e63946' },
            { label: '📅 Ver Sessões', path: '/sessoes', color: '#0891b2' },
          ].map(a => (
            <button
              key={a.label}
              onClick={() => navigate(a.path)}
              style={{
                background: `${a.color}15`,
                border: `1px solid ${a.color}30`,
                color: a.color,
                padding: '0.625rem 1.25rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${a.color}25`)}
              onMouseLeave={e => (e.currentTarget.style.background = `${a.color}15`)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
