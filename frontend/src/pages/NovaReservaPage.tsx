import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  getClientes, getFilmes, getSessoes, getSessaoAssentos, createReserva,
  Cliente, Filme, Sessao, Assento, SessaoAssentos
} from '../services/api';
import { toast } from '../hooks/useToast';
import { Button, PageHeader, Card, Spinner, Badge } from '../components/UI';
import { SeatMap } from '../components/SeatMap';

type Step = 'cliente' | 'filme' | 'sessao' | 'assentos' | 'confirmar';

const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'cliente', label: 'Cliente', icon: '👤' },
  { key: 'filme', label: 'Filme', icon: '🎬' },
  { key: 'sessao', label: 'Sessão', icon: '🗓' },
  { key: 'assentos', label: 'Assentos', icon: '🪑' },
  { key: 'confirmar', label: 'Confirmar', icon: '✓' },
];

function fmt(dt: string) {
  return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
}

export function NovaReservaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize sessaoId and step directly from URL — avoids race condition
  // where useEffect([sessaoId]) fires before the setter from another useEffect runs
  const sidFromUrl = searchParams.get('sessao');
  const initialSessaoId = sidFromUrl ? Number(sidFromUrl) : null;
  const initialStep: Step = initialSessaoId ? 'assentos' : 'cliente';

  const [step, setStep] = useState<Step>(initialStep);

  // Data
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [sessaoAssentos, setSessaoAssentos] = useState<SessaoAssentos | null>(null);

  // Selections
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [filmeId, setFilmeId] = useState<number | null>(null);
  const [sessaoId, setSessaoId] = useState<number | null>(initialSessaoId);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [assentosState, setAssentosState] = useState<Assento[]>([]);

  // UI
  const [clienteSearch, setClienteSearch] = useState('');
  const [dataFilter, setDataFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    Promise.all([getClientes(), getFilmes()]).then(([c, f]) => {
      setClientes(c);
      setFilmes(f);
    });
  }, []);

  // Load sessoes when film changes
  useEffect(() => {
    if (!filmeId) return;
    getSessoes({ filme_id: filmeId, data: dataFilter || undefined }).then(setSessoes);
  }, [filmeId, dataFilter]);

  // Load seat map when sessao changes
  useEffect(() => {
    if (!sessaoId) return;
    setLoading(true);
    getSessaoAssentos(sessaoId)
      .then(data => {
        setSessaoAssentos(data);
        setAssentosState(data.assentos);
      })
      .catch(() => toast.error('Erro ao carregar assentos'))
      .finally(() => setLoading(false));
  }, [sessaoId]);

  // Real-time seat update handler
  const handleRealtimeUpdate = useCallback((reservados: number[], liberados: number[]) => {
    setAssentosState(prev => prev.map(a => {
      if (reservados.includes(a.id)) return { ...a, disponivel: false };
      if (liberados.includes(a.id)) return { ...a, disponivel: true };
      return a;
    }));

    // Deselect any seat that was just reserved by someone else
    setSelectedSeats(prev => {
      const nowTaken = prev.filter(id => reservados.includes(id));
      if (nowTaken.length === 0) return prev;
      setTimeout(() => toast.warning('...'), 0);  // ← fora do render
      return prev.filter(id => !reservados.includes(id));
    });

    if (reservados.length > 0) toast.info(`🔴 ${reservados.length} assento(s) recém-reservados em tempo real`);
    if (liberados.length > 0) toast.info(`🟢 ${liberados.length} assento(s) liberados`);
  }, []);

  const toggleSeat = (id: number) => {
    setSelectedSeats(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedCliente = clientes.find(c => c.id === clienteId);
  const selectedFilme = filmes.find(f => f.id === filmeId);
  const selectedSessao = sessoes.find(s => s.id === sessaoId) || (sessaoAssentos ? { id: sessaoId } as any : null);

  const selectedAssentoInfos = assentosState.filter(a => selectedSeats.includes(a.id));
  const valorTotal = sessaoAssentos ? Number(sessaoAssentos.valor_unitario) * selectedSeats.length : 0;

  const handleConfirmar = async () => {
    if (!clienteId || !sessaoId || selectedSeats.length === 0) return;
    setSaving(true);
    try {
      const res = await createReserva({ cliente_id: clienteId, sessao_id: sessaoId, assentos_ids: selectedSeats });
      setResult(res);
      toast.success('🎉 Reserva confirmada com sucesso!');
    } catch (err: any) {
      const d = err.data;
      if (err.status === 409) toast.error(d?.erro ?? 'Assento já reservado');
      else if (err.status === 422) toast.error('Sessão não encontrada ou encerrada');
      else toast.error(d?.erro ?? 'Erro ao criar reserva');
    } finally {
      setSaving(false);
    }
  };

  const filteredClientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clienteSearch.toLowerCase())
  );

  const stepIndex = STEPS.findIndex(s => s.key === step);

  if (result) {
    return (
      <div style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', margin: '0 auto 1.5rem',
          boxShadow: '0 0 40px rgba(16,185,129,0.2)',
        }}>🎟</div>
        <h1 style={{ color: '#10b981', fontFamily: '"Bebas Neue", cursive', fontSize: '2rem', letterSpacing: '0.05em' }}>
          Reserva Confirmada!
        </h1>
        <Card style={{ textAlign: 'left', margin: '1.5rem 0' }}>
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { k: 'Reserva #', v: result.reserva_id },
              { k: 'Filme', v: result.sessao?.filme },
              { k: 'Sala', v: result.sessao?.sala },
              { k: 'Data/Hora', v: result.sessao?.data_hora ? fmt(result.sessao.data_hora) : '' },
              { k: 'Assentos', v: result.assentos?.map((a: any) => `${a.fileira}${a.numero}`).join(', ') },
              { k: 'Total', v: `R$ ${Number(result.valor_total).toFixed(2)}` },
            ].map(row => (
              <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569', fontSize: '0.875rem' }}>{row.k}</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.875rem' }}>{row.v}</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="ghost" onClick={() => navigate('/clientes')}>Ver Clientes</Button>
          <Button onClick={() => { setResult(null); setStep('cliente'); setSelectedSeats([]); setSessaoId(null); setFilmeId(null); setClienteId(null); }}>
            Nova Reserva
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Nova Reserva" subtitle="Escolha cliente, filme, sessão e assentos" />

      {/* Step progress */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '2rem', position: 'relative' }}>
        {STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = s.key === step;
          return (
            <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', position: 'relative' }}>
              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  position: 'absolute', top: '14px', left: '-50%', width: '100%',
                  height: '2px',
                  background: done ? '#4f46e5' : 'rgba(255,255,255,0.08)',
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: done ? '#4f46e5' : active ? 'rgba(79,70,229,0.3)' : 'rgba(255,255,255,0.05)',
                border: active ? '2px solid #4f46e5' : done ? '2px solid #4f46e5' : '2px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: done ? '0.7rem' : '0.8rem',
                color: done ? '#fff' : active ? '#818cf8' : '#475569',
                zIndex: 1,
                position: 'relative',
              }}>
                {done ? '✓' : s.icon}
              </div>
              <span style={{
                fontSize: '0.7rem', fontWeight: 600,
                color: active ? '#818cf8' : done ? '#4f46e5' : '#475569',
                letterSpacing: '0.04em',
              }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Main panel */}
        <Card style={{ padding: '1.5rem' }}>

          {/* STEP: Cliente */}
          {step === 'cliente' && (
            <div>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 1rem', fontSize: '1.1rem' }}>Selecione o Cliente</h2>
              <input
                value={clienteSearch}
                onChange={e => setClienteSearch(e.target.value)}
                placeholder="🔍  Buscar cliente..."
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '0.625rem 1rem',
                  color: '#e2e8f0', fontSize: '0.9rem', outline: 'none',
                  marginBottom: '1rem',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                {filteredClientes.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setClienteId(c.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.875rem 1rem',
                      borderRadius: '10px',
                      border: `1.5px solid ${clienteId === c.id ? '#4f46e5' : 'rgba(255,255,255,0.06)'}`,
                      background: clienteId === c.id ? 'rgba(79,70,229,0.1)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: `hsl(${(c.id * 47) % 360},55%,35%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                    }}>
                      {c.nome[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{c.nome}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{c.email}</div>
                    </div>
                    {clienteId === c.id && (
                      <div style={{ marginLeft: 'auto', color: '#4f46e5', fontSize: '1.25rem' }}>✓</div>
                    )}
                  </div>
                ))}
                {filteredClientes.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>Nenhum cliente encontrado</div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button disabled={!clienteId} onClick={() => setStep('filme')}>
                  Próximo →
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Filme */}
          {step === 'filme' && (
            <div>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 1rem', fontSize: '1.1rem' }}>Selecione o Filme</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {filmes.map(f => (
                  <div
                    key={f.id}
                    onClick={() => setFilmeId(f.id)}
                    style={{
                      borderRadius: '10px',
                      border: `2px solid ${filmeId === f.id ? '#4f46e5' : 'rgba(255,255,255,0.06)'}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      transform: filmeId === f.id ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: filmeId === f.id ? '0 0 20px rgba(79,70,229,0.3)' : 'none',
                    }}
                  >
                    <div style={{
                      height: '130px',
                      background: f.poster_url
                        ? `url(${f.poster_url}) center/cover`
                        : `linear-gradient(135deg, hsl(${(f.id * 67) % 360},50%,20%), hsl(${(f.id * 67 + 60) % 360},50%,15%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '3rem',
                    }}>
                      {!f.poster_url && '🎬'}
                    </div>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{f.titulo}</div>
                      <div style={{ color: '#475569', fontSize: '0.75rem' }}>{f.duracao_min} min • {f.genero}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Button variant="ghost" onClick={() => setStep('cliente')}>← Voltar</Button>
                <Button disabled={!filmeId} onClick={() => setStep('sessao')}>Próximo →</Button>
              </div>
            </div>
          )}

          {/* STEP: Sessão */}
          {step === 'sessao' && (
            <div>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 1rem', fontSize: '1.1rem' }}>Selecione a Sessão</h2>
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="date"
                  value={dataFilter}
                  onChange={e => setDataFilter(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px', padding: '0.5rem 0.875rem',
                    color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
                    colorScheme: 'dark',
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {sessoes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>Nenhuma sessão disponível</div>
                ) : sessoes.map(s => (
                  <div
                    key={s.id}
                    onClick={() => setSessaoId(s.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '1rem', borderRadius: '10px',
                      border: `1.5px solid ${sessaoId === s.id ? '#4f46e5' : 'rgba(255,255,255,0.06)'}`,
                      background: sessaoId === s.id ? 'rgba(79,70,229,0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '10px',
                      background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.25rem', flexShrink: 0,
                    }}>🎭</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: '0.25rem' }}>{s.sala}</div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{fmt(s.data_hora)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#10b981', fontWeight: 700 }}>R$ {Number(s.valor_unitario).toFixed(2)}</div>
                      {s.assentos_disponiveis !== undefined && (
                        <div style={{ color: '#475569', fontSize: '0.75rem' }}>{s.assentos_disponiveis} disponíveis</div>
                      )}
                    </div>
                    {sessaoId === s.id && <div style={{ color: '#4f46e5', fontSize: '1.25rem' }}>✓</div>}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                <Button variant="ghost" onClick={() => setStep('filme')}>← Voltar</Button>
                <Button disabled={!sessaoId} onClick={() => setStep('assentos')}>Ver Mapa →</Button>
              </div>
            </div>
          )}

          {/* STEP: Assentos */}
          {step === 'assentos' && (
            <div>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 1rem', fontSize: '1.1rem' }}>
                Escolha os Assentos
                {sessaoId && <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 400, marginLeft: '0.5rem' }}>
                  — Sessão #{sessaoId}
                </span>}
              </h2>
              {loading ? <Spinner /> : (
                <SeatMap
                  sessaoId={sessaoId}
                  assentos={assentosState}
                  selected={selectedSeats}
                  onSelect={toggleSeat}
                  onRealtimeUpdate={handleRealtimeUpdate}
                />
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <Button variant="ghost" onClick={() => setStep('sessao')}>← Voltar</Button>
                <Button disabled={selectedSeats.length === 0} onClick={() => setStep('confirmar')}>
                  Confirmar Seleção ({selectedSeats.length}) →
                </Button>
              </div>
            </div>
          )}

          {/* STEP: Confirmar */}
          {step === 'confirmar' && (
            <div>
              <h2 style={{ color: '#f1f5f9', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>Confirmar Reserva</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Summary cards */}
                {[
                  { icon: '👤', label: 'Cliente', value: selectedCliente?.nome, sub: selectedCliente?.email },
                  { icon: '🎬', label: 'Filme', value: selectedFilme?.titulo, sub: selectedFilme ? `${selectedFilme.duracao_min} min` : '' },
                  {
                    icon: '🪑', label: 'Assentos',
                    value: selectedAssentoInfos.map(a => `${a.fileira}${a.numero}`).join(', '),
                    sub: `${selectedSeats.length} assento(s)`
                  },
                ].map(item => (
                  <div key={item.label} style={{
                    display: 'flex', gap: '1rem', alignItems: 'center',
                    padding: '1rem', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
                    <div>
                      <div style={{ color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
                      <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{item.value}</div>
                      {item.sub && <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.sub}</div>}
                    </div>
                  </div>
                ))}

                <div style={{
                  padding: '1rem', background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#94a3b8', fontWeight: 600 }}>Total a pagar</span>
                  <span style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 800 }}>
                    R$ {valorTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
                <Button variant="ghost" onClick={() => setStep('assentos')}>← Voltar</Button>
                <Button variant="success" disabled={saving} onClick={handleConfirmar}>
                  {saving ? '⏳ Processando...' : '🎟 Confirmar Reserva'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Summary sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '1rem' }}>
          <Card style={{ padding: '1.25rem' }}>
            <h3 style={{ color: '#64748b', margin: '0 0 1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Resumo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Cliente', value: selectedCliente?.nome },
                { label: 'Filme', value: selectedFilme?.titulo },
                { label: 'Sessão', value: sessaoId ? `#${sessaoId}` : undefined },
                { label: 'Assentos', value: selectedSeats.length > 0 ? `${selectedSeats.length} selecionado(s)` : undefined },
              ].map(r => (
                r.value ? (
                  <div key={r.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                    <span style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</span>
                    <span style={{ color: '#e2e8f0', fontSize: '0.875rem', fontWeight: 500 }}>{r.value}</span>
                  </div>
                ) : null
              ))}
              {valorTotal > 0 && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Total</span>
                    <span style={{ color: '#10b981', fontWeight: 800 }}>R$ {valorTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
              {!selectedCliente && !selectedFilme && (
                <p style={{ color: '#334155', fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
                  Complete os passos ao lado
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}