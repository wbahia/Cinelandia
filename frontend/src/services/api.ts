const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, data };
  return data as T;
}

// ─── Clientes ────────────────────────────────────────────────────────────────

export const getClientes = (params?: { nome?: string; email?: string; cpf?: string }) => {
  const qs = new URLSearchParams();
  if (params?.nome) qs.set('nome', params.nome);
  if (params?.email) qs.set('email', params.email);
  if (params?.cpf) qs.set('cpf', params.cpf);
  const query = qs.toString();
  return request<Cliente[]>(`/clientes${query ? `?${query}` : ''}`);
};
export const getCliente = (id: number) => request<Cliente>(`/clientes/${id}`);
export const createCliente = (body: Omit<Cliente, 'id' | 'created_at'>) =>
  request<Cliente>('/clientes', { method: 'POST', body: JSON.stringify(body) });
export const updateCliente = (id: number, body: Partial<Cliente>) =>
  request<Cliente>(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteCliente = (id: number) =>
  request<{ message: string }>(`/clientes/${id}`, { method: 'DELETE' });
export const getClienteReservas = (id: number) =>
  request<ClienteReserva[]>(`/clientes/${id}/reservas`);

// ─── Filmes ───────────────────────────────────────────────────────────────────

export const getFilmes = () => request<Filme[]>('/filmes');
export const getFilmeById = (id: number) => request<Filme>(`/filmes/${id}`);

// ─── Sessões ──────────────────────────────────────────────────────────────────

export const getSessoes = (params?: { filme_id?: number; data?: string }) => {
  const qs = new URLSearchParams();
  if (params?.filme_id) qs.set('filme_id', String(params.filme_id));
  if (params?.data) qs.set('data', params.data);
  return request<Sessao[]>(`/sessoes?${qs}`);
};

export const getSessaoAssentos = (id: number) =>
  request<SessaoAssentos>(`/sessoes/${id}/assentos`);

// ─── Reservas ────────────────────────────────────────────────────────────────

export const createReserva = (body: { cliente_id: number; sessao_id: number; assentos_ids: number[] }) =>
  request<ReservaCreated>('/reservas', { method: 'POST', body: JSON.stringify(body) });

export const getReserva = (id: number) => request<ReservaDetail>(`/reservas/${id}`);

export const cancelReserva = (id: number) =>
  request<{ reserva_id: number; status: string }>(`/reservas/${id}`, { method: 'DELETE' });

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Cliente {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  created_at?: string;
}

export interface ClienteReserva {
  reserva_id: number;
  status: string;
  filme: string;
  data_hora: string;
  assentos: string[];
  total_assentos: number;
  valor_total: number;
}

export interface Filme {
  id: number;
  titulo: string;
  sinopse?: string;
  duracao_min: number;
  genero: string;
  classificacao?: string;
  poster_url?: string;
}

export interface Sessao {
  id: number;
  filme: string;
  sala: string;
  data_hora: string;
  valor_unitario: number;
  assentos_disponiveis?: number;
}

export interface Assento {
  id: number;
  fileira: string;
  numero: number;
  tipo: string;
  disponivel: boolean;
  label?: string;
}

export interface SessaoAssentos {
  sessao_id: number;
  valor_unitario: number;
  total_assentos: number;
  disponiveis: number;
  assentos: Assento[];
}

export interface ReservaCreated {
  reserva_id: number;
  status: string;
  total_assentos: number;
  valor_unitario: number;
  valor_total: number;
  assentos: { fileira: string; numero: number }[];
  sessao: { filme: string; data_hora: string; sala: string };
}

export interface ReservaDetail extends ReservaCreated {
  cliente: { id: number; nome: string };
}