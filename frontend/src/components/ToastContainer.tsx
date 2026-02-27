import { useToastState, Toast } from '../hooks/useToast';

const icons: Record<Toast['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colors: Record<Toast['type'], string> = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

export function ToastContainer() {
  const { toasts, remove } = useToastState();

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      maxWidth: '380px',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            background: '#1a1a2e',
            border: `1px solid ${colors[t.type]}40`,
            borderLeft: `4px solid ${colors[t.type]}`,
            borderRadius: '8px',
            boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 12px ${colors[t.type]}20`,
            cursor: 'pointer',
            animation: 'slideIn 0.2s ease',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: `${colors[t.type]}20`,
            border: `1.5px solid ${colors[t.type]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors[t.type],
            fontSize: '0.75rem',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {icons[t.type]}
          </span>
          <span style={{ color: '#e2e8f0', fontSize: '0.875rem', lineHeight: 1.4 }}>
            {t.message}
          </span>
        </div>
      ))}
    </div>
  );
}
