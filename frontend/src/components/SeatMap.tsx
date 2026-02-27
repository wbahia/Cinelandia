import { useEffect, useState, useCallback } from 'react';
import { Assento } from '../services/api';
import { useSessaoSocket } from '../hooks/useSessaoSocket';

interface SeatMapProps {
  sessaoId: number | null;
  assentos: Assento[];
  selected: number[];
  onSelect: (id: number) => void;
  onRealtimeUpdate?: (reservados: number[], liberados: number[]) => void;
}

const tipoConfig: Record<string, { color: string; label: string; icon: string }> = {
  NORMAL: { color: '#4f46e5', label: 'Normal', icon: '🪑' },
  VIP:    { color: '#d97706', label: 'VIP', icon: '👑' },
  PCD:    { color: '#0891b2', label: 'PCD', icon: '♿' },
};

export function SeatMap({ sessaoId, assentos, selected, onSelect, onRealtimeUpdate }: SeatMapProps) {
  const [justUpdated, setJustUpdated] = useState<Set<number>>(new Set());
  
  // Group by row
  const rows = assentos.reduce((acc, a) => {
    if (!acc[a.fileira]) acc[a.fileira] = [];
    acc[a.fileira].push(a);
    return acc;
  }, {} as Record<string, Assento[]>);

  const rowLetters = Object.keys(rows).sort();

  // WebSocket: receive real-time seat updates
  const { status: wsStatus } = useSessaoSocket(sessaoId, useCallback((payload) => {
    // Flash animation for changed seats
    const changed = new Set([...payload.reservados, ...payload.liberados]);
    setJustUpdated(changed);
    setTimeout(() => setJustUpdated(new Set()), 1500);

    if (onRealtimeUpdate) {
      onRealtimeUpdate(payload.reservados, payload.liberados);
    }
  }, [onRealtimeUpdate]));

  const totalDisponiveis = assentos.filter(a => a.disponivel).length;
  const totalReservados = assentos.filter(a => !a.disponivel).length;

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Disponíveis', count: totalDisponiveis, color: '#10b981' },
          { label: 'Ocupados', count: totalReservados, color: '#ef4444' },
          { label: 'Selecionados', count: selected.length, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{
            background: `${s.color}10`,
            border: `1px solid ${s.color}30`,
            borderRadius: '10px',
            padding: '0.625rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '90px',
          }}>
            <span style={{ color: s.color, fontSize: '1.25rem', fontWeight: 800 }}>{s.count}</span>
            <span style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
          </div>
        ))}

        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '0.5rem 0.875rem',
        }}>
          <span style={{
            color: wsStatus === 'connected' ? '#10b981' : wsStatus === 'connecting' ? '#f59e0b' : '#ef4444',
            fontSize: '0.6rem',
          }}>●</span>
          <span style={{ color: '#475569', fontSize: '0.75rem' }}>
            {wsStatus === 'connected' ? 'Live — tempo real' : wsStatus === 'connecting' ? 'Conectando...' : 'Sem conexão live'}
          </span>
        </div>
      </div>

      {/* Screen */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative' }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 100%)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '4px 4px 60px 60px',
          padding: '0.25rem 5rem',
          color: '#64748b',
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          boxShadow: '0 0 40px rgba(255,255,255,0.05)',
        }}>
          Tela
        </div>
      </div>

      {/* Seat Grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.5rem', minWidth: 'max-content' }}>
          {rowLetters.map(row => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {/* Row label */}
              <span style={{
                width: '24px', textAlign: 'center',
                color: '#475569', fontSize: '0.75rem', fontWeight: 700,
                flexShrink: 0,
              }}>{row}</span>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                {rows[row].sort((a, b) => a.numero - b.numero).map(assento => {
                  const isOccupied = !assento.disponivel;
                  const isSelected = selected.includes(assento.id);
                  const isFlashing = justUpdated.has(assento.id);
                  const cfg = tipoConfig[assento.tipo] ?? tipoConfig.NORMAL;

                  let bg = 'rgba(79,70,229,0.12)';
                  let border = 'rgba(79,70,229,0.3)';
                  let color = '#818cf8';
                  let cursor = 'pointer';

                  if (isOccupied) {
                    bg = 'rgba(239,68,68,0.1)';
                    border = 'rgba(239,68,68,0.2)';
                    color = '#ef444460';
                    cursor = 'not-allowed';
                  } else if (isSelected) {
                    bg = 'rgba(245,158,11,0.2)';
                    border = '#f59e0b';
                    color = '#f59e0b';
                  } else if (assento.tipo === 'VIP') {
                    bg = 'rgba(217,119,6,0.1)';
                    border = 'rgba(217,119,6,0.3)';
                    color = '#d97706';
                  } else if (assento.tipo === 'PCD') {
                    bg = 'rgba(8,145,178,0.1)';
                    border = 'rgba(8,145,178,0.3)';
                    color = '#0891b2';
                  }

                  return (
                    <button
                      key={assento.id}
                      disabled={isOccupied}
                      onClick={() => !isOccupied && onSelect(assento.id)}
                      title={`${assento.fileira}${assento.numero} - ${assento.tipo}${isOccupied ? ' (Ocupado)' : ''}`}
                      style={{
                        width: '38px',
                        height: '36px',
                        borderRadius: '6px 6px 10px 10px',
                        background: bg,
                        border: `1.5px solid ${border}`,
                        color,
                        cursor,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1px',
                        transition: 'all 0.15s',
                        position: 'relative',
                        outline: 'none',
                        animation: isFlashing ? 'seatFlash 0.4s ease 3' : 'none',
                        boxShadow: isSelected ? `0 0 10px ${border}` : 'none',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                      }}
                    >
                      {/* Seat back arc */}
                      <div style={{
                        width: '22px',
                        height: '10px',
                        borderRadius: '4px 4px 0 0',
                        background: isOccupied ? 'rgba(239,68,68,0.2)' : isSelected ? 'rgba(245,158,11,0.3)' : `${cfg.color}25`,
                        borderBottom: `1px solid ${border}`,
                      }} />
                      <span style={{ fontSize: '0.6rem', lineHeight: 1 }}>{assento.numero}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '1.5rem', marginTop: '1.5rem',
        padding: '1rem', background: 'rgba(255,255,255,0.02)',
        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap',
      }}>
        {[
          { color: 'rgba(79,70,229,0.3)', label: 'Normal disponível' },
          { color: 'rgba(217,119,6,0.3)', label: 'VIP disponível' },
          { color: 'rgba(8,145,178,0.3)', label: 'PCD disponível' },
          { color: 'rgba(239,68,68,0.2)', label: 'Ocupado' },
          { color: 'rgba(245,158,11,0.4)', label: 'Selecionado' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '24px', height: '20px',
              borderRadius: '4px 4px 6px 6px',
              background: item.color,
              border: `1.5px solid ${item.color.replace('0.', '0.7').replace('0.2', '0.5').replace('0.3', '0.7').replace('0.4', '0.9')}`,
            }} />
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}