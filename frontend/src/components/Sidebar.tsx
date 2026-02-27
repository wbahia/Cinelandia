import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞' },
  { to: '/clientes', label: 'Clientes', icon: '👤' },
  { to: '/filmes', label: 'Filmes', icon: '🎬' },
  { to: '/sessoes', label: 'Sessões', icon: '🎭' },
  { to: '/reservas/nova', label: 'Nova Reserva', icon: '🎟', accent: true },
];

export function Sidebar() {
  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d0d1a 0%, #0a0a16 100%)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #e63946, #ff006e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            boxShadow: '0 0 20px rgba(230,57,70,0.4)',
          }}>🎬</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', fontFamily: '"Bebas Neue", cursive' }}>
              Cinelandia
            </div>
            <div style={{ color: '#666', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Admin
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.625rem 0.75rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.15s',
              background: isActive
                ? item.accent ? 'rgba(230,57,70,0.15)' : 'rgba(255,255,255,0.07)'
                : 'transparent',
              color: isActive
                ? item.accent ? '#ff4d6d' : '#e2e8f0'
                : '#64748b',
              borderLeft: isActive
                ? `3px solid ${item.accent ? '#e63946' : '#4f46e5'}`
                : '3px solid transparent',
              marginTop: item.accent ? '0.5rem' : 0,
            })}
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: '0.7rem', color: '#334155', textAlign: 'center' }}>
          🔴 Live • WebSocket ativo
        </div>
      </div>
    </aside>
  );
}
