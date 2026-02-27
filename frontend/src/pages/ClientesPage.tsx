import { useState, useEffect, useCallback } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente, Cliente } from '../services/api';
import { toast } from '../hooks/useToast';
import { Button, Modal, Field, PageHeader, Card, EmptyState, Spinner } from '../components/UI';

const emptyForm = { nome: '', email: '', cpf: '', telefone: '' };

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export function ClientesPage() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const [filterNome, setFilterNome] = useState('');
    const [filterEmail, setFilterEmail] = useState('');
    const [filterCpf, setFilterCpf] = useState('');

    const debouncedNome = useDebounce(filterNome, 400);
    const debouncedEmail = useDebounce(filterEmail, 400);
    const debouncedCpf = useDebounce(filterCpf, 400);

    const [modal, setModal] = useState<'create' | 'edit' | null>(null);
    const [editing, setEditing] = useState<Cliente | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Cliente | null>(null);

    const hasFilters = !!(debouncedNome || debouncedEmail || debouncedCpf);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getClientes({
                nome: debouncedNome || undefined,
                email: debouncedEmail || undefined,
                cpf: debouncedCpf || undefined,
            });
            setClientes(data);
            if (!debouncedNome && !debouncedEmail && !debouncedCpf) {
                setTotal(data.length);
            }
        } catch {
            toast.error('Erro ao carregar clientes');
        } finally {
            setLoading(false);
        }
    }, [debouncedNome, debouncedEmail, debouncedCpf]);

    useEffect(() => { load(); }, [load]);

    const clearFilters = () => {
        setFilterNome('');
        setFilterEmail('');
        setFilterCpf('');
    };

    const openCreate = () => {
        setForm(emptyForm);
        setEditing(null);
        setModal('create');
    };

    const openEdit = (c: Cliente) => {
        setEditing(c);
        setForm({ nome: c.nome, email: c.email, cpf: c.cpf, telefone: c.telefone });
        setModal('edit');
    };

    const handleSubmit = async () => {
        if (!form.nome || !form.email || !form.cpf) {
            toast.warning('Preencha todos os campos obrigatórios');
            return;
        }
        setSaving(true);
        try {
            if (modal === 'create') {
                await createCliente(form);
                toast.success('Cliente cadastrado com sucesso!');
            } else if (editing) {
                await updateCliente(editing.id, form);
                toast.success('Cliente atualizado!');
            }
            setModal(null);
            load();
        } catch (err: any) {
            if (err.status === 409) toast.error('Email ou CPF já cadastrado');
            else toast.error(err.data?.erro ?? 'Erro ao salvar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await deleteCliente(confirmDelete.id);
            toast.success('Cliente removido');
            setConfirmDelete(null);
            load();
        } catch (err: any) {
            toast.error(err.data?.erro ?? 'Erro ao remover');
        }
    };

    const setField = (k: keyof typeof emptyForm) => (v: string) =>
        setForm(p => ({ ...p, [k]: v }));

    return (
        <div>
            <PageHeader
                title="Clientes"
                subtitle={`${total} clientes cadastrados`}
                action={<Button onClick={openCreate}>+ Novo Cliente</Button>}
            />

            {/* Filtros */}
            <Card style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: '0.75rem',
                    alignItems: 'end',
                }}>
                    <FilterInput label="Nome" placeholder="Ex: João Silva" value={filterNome} onChange={setFilterNome} icon="👤" />
                    <FilterInput label="Email" placeholder="Ex: joao@email.com" value={filterEmail} onChange={setFilterEmail} icon="✉️" />
                    <FilterInput label="CPF" placeholder="Ex: 12345678901" value={filterCpf} onChange={setFilterCpf} icon="🪪" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'transparent', userSelect: 'none' }}>_</span>
                        <button
                            onClick={clearFilters}
                            disabled={!hasFilters}
                            style={{
                                background: hasFilters ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${hasFilters ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                                color: hasFilters ? '#ef4444' : '#334155',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                cursor: hasFilters ? 'pointer' : 'default',
                                fontSize: '0.825rem',
                                fontWeight: 600,
                                transition: 'all 0.15s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            ✕ Limpar
                        </button>
                    </div>
                </div>

                {hasFilters && !loading && (
                    <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: '0.75rem', color: '#475569' }}>🔍 Filtros ativos —</span>
                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                            {clientes.length} resultado{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
                        </span>
                        {[
                            { label: 'Nome', value: debouncedNome },
                            { label: 'Email', value: debouncedEmail },
                            { label: 'CPF', value: debouncedCpf },
                        ].filter(f => f.value).map(f => (
                            <span key={f.label} style={{
                                background: 'rgba(79,70,229,0.12)',
                                border: '1px solid rgba(79,70,229,0.25)',
                                color: '#818cf8',
                                padding: '0.1rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                            }}>
                                {f.label}: {f.value}
                            </span>
                        ))}
                    </div>
                )}
            </Card>

            {/* Tabela */}
            <Card>
                {loading ? <Spinner /> : clientes.length === 0 ? (
                    <EmptyState
                        icon={hasFilters ? '🔍' : '👤'}
                        message={hasFilters ? 'Nenhum cliente encontrado com esses filtros' : 'Nenhum cliente cadastrado'}
                    />
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                    {['ID', 'Nome', 'Email', 'CPF', 'Telefone', 'Ações'].map(h => (
                                        <th key={h} style={{
                                            padding: '0.875rem 1rem', textAlign: 'left',
                                            color: '#475569', fontSize: '0.72rem',
                                            fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                                        }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {clientes.map((c, i) => (
                                    <tr
                                        key={c.id}
                                        style={{
                                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                                            background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,70,229,0.05)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)')}
                                    >
                                        <td style={{ padding: '0.875rem 1rem', color: '#334155', fontSize: '0.8rem' }}>#{c.id}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                                <div style={{
                                                    width: '34px', height: '34px', borderRadius: '50%',
                                                    background: `hsl(${(c.id * 47) % 360},55%,35%)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '0.85rem', fontWeight: 700, flexShrink: 0,
                                                }}>
                                                    {c.nome[0].toUpperCase()}
                                                </div>
                                                <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    <Highlight text={c.nome} query={debouncedNome} />
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                                            <Highlight text={c.email} query={debouncedEmail} />
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                            <Highlight
                                                text={c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                                                query={debouncedCpf}
                                            />
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.875rem' }}>{c.telefone}</td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>✏️ Editar</Button>
                                                <Button size="sm" variant="danger" onClick={() => setConfirmDelete(c)}>🗑</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Modal Create/Edit */}
            <Modal open={modal !== null} onClose={() => setModal(null)} title={modal === 'create' ? 'Novo Cliente' : 'Editar Cliente'}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Field label="Nome completo" name="nome" value={form.nome} onChange={setField('nome')} required placeholder="João Silva" />
                    <Field label="Email" name="email" value={form.email} onChange={setField('email')} type="email" required placeholder="joao@email.com" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Field label="CPF" name="cpf" value={form.cpf} onChange={setField('cpf')} required placeholder="12345678901" />
                        <Field label="Telefone" name="telefone" value={form.telefone} onChange={setField('telefone')} placeholder="47999990000" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <Button variant="ghost" onClick={() => setModal(null)}>Cancelar</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Salvando...' : modal === 'create' ? '✓ Cadastrar' : '✓ Salvar'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal Confirm Delete */}
            <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar exclusão">
                <p style={{ color: '#94a3b8', marginTop: 0 }}>
                    Tem certeza que deseja remover o cliente{' '}
                    <strong style={{ color: '#e2e8f0' }}>{confirmDelete?.nome}</strong>?
                    Esta ação não pode ser desfeita.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
                    <Button variant="danger" onClick={handleDelete}>🗑 Remover</Button>
                </div>
            </Modal>
        </div>
    );
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function FilterInput({ label, placeholder, value, onChange, icon }: {
    label: string; placeholder: string; value: string;
    onChange: (v: string) => void; icon: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{
                color: '#475569', fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <span style={{
                    position: 'absolute', left: '0.75rem', top: '50%',
                    transform: 'translateY(-50%)', fontSize: '0.85rem', pointerEvents: 'none',
                }}>
                    {icon}
                </span>
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${value ? 'rgba(79,70,229,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '8px',
                        padding: '0.5rem 2rem 0.5rem 2.25rem',
                        color: '#e2e8f0', fontSize: '0.875rem', outline: 'none',
                        transition: 'border-color 0.15s',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#4f46e5')}
                    onBlur={e => (e.target.style.borderColor = value ? 'rgba(79,70,229,0.5)' : 'rgba(255,255,255,0.08)')}
                />
                {value && (
                    <button onClick={() => onChange('')} style={{
                        position: 'absolute', right: '0.5rem', top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none', border: 'none',
                        color: '#475569', cursor: 'pointer', fontSize: '0.75rem', padding: '0.2rem',
                    }}>✕</button>
                )}
            </div>
        </div>
    );
}

function Highlight({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{ background: 'rgba(245,158,11,0.25)', color: '#fbbf24', borderRadius: '3px', padding: '0 2px' }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}