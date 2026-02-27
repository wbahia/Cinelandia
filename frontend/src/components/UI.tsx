import { ReactNode, CSSProperties } from 'react';

// ─── Button ──────────────────────────────────────────────────────────────────

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md';
  disabled?: boolean;
  type?: 'button' | 'submit';
  style?: CSSProperties;
}

const btnStyles: Record<string, CSSProperties> = {
  primary: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(79,70,229,0.3)' },
  danger: { background: 'linear-gradient(135deg, #e63946, #c1121f)', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(230,57,70,0.3)' },
  ghost: { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' },
  success: { background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' },
};

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, type = 'button', style }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: size === 'sm' ? '0.375rem 0.75rem' : '0.625rem 1.25rem',
        borderRadius: '8px',
        fontSize: size === 'sm' ? '0.8rem' : '0.875rem',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        ...btnStyles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({ open, onClose, title, children, width = '500px' }: ModalProps) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f0f23',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
          width: '90vw',
          maxWidth: width,
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', width: '32px', height: '32px', borderRadius: '8px',
              cursor: 'pointer', fontSize: '1rem',
            }}
          >×</button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Input / Field ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export function Field({ label, name, value, onChange, type = 'text', required, placeholder }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: '#e63946' }}>*</span>}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '0.625rem 0.875rem',
          color: '#e2e8f0',
          fontSize: '0.9rem',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.target.style.borderColor = '#4f46e5')}
        onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
      />
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

const badgeColors: Record<string, { bg: string; color: string }> = {
  CONFIRMADA: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  PENDENTE:   { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  CANCELADA:  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  IMAX:  { bg: 'rgba(79,70,229,0.2)', color: '#818cf8' },
  '3D':  { bg: 'rgba(6,182,212,0.15)', color: '#22d3ee' },
  '2D':  { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8' },
};

export function Badge({ label }: { label: string }) {
  const c = badgeColors[label] ?? { bg: 'rgba(100,116,139,0.2)', color: '#94a3b8' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: c.bg,
      color: c.color,
    }}>
      {label}
    </span>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
      <div>
        <h1 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h1>
        {subtitle && <p style={{ color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{icon}</div>
      <p style={{ color: '#475569', margin: 0 }}>{message}</p>
    </div>
  );
}

// ─── Loading ─────────────────────────────────────────────────────────────────

export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
      <div style={{
        width: '32px', height: '32px',
        border: '3px solid rgba(79,70,229,0.2)',
        borderTop: '3px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }} />
    </div>
  );
}
