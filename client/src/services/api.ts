import type { Game, Developer, Publisher, Platform, Genre, Rating, GameFormData } from '../types';

const API = '/api';

// ── helpers ────────────────────────────────────────────────────
async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Erro desconhecido');
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

const json = (body: unknown) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// ── JOGOS ──────────────────────────────────────────────────────
export const getGames      = ()        => http<Game[]>(`${API}/games`);
export const getGameById   = (id: number) => http<Game>(`${API}/games/${id}`);
export const createGame    = (data: GameFormData) =>
  http<{ id: number }>(`${API}/games`, { method: 'POST', ...json({
    ...data,
    duracao_media:     data.duracao_media     ? Number(data.duracao_media)     : null,
    id_desenvolvedora: data.id_desenvolvedora ? Number(data.id_desenvolvedora) : null,
    id_distribuidora:  data.id_distribuidora  ? Number(data.id_distribuidora)  : null,
    id_classificacao:  data.id_classificacao  ? Number(data.id_classificacao)  : null,
  })});
export const updateGame    = (id: number, data: GameFormData) =>
  http<void>(`${API}/games/${id}`, { method: 'PUT', ...json({
    ...data,
    duracao_media:     data.duracao_media     ? Number(data.duracao_media)     : null,
    id_desenvolvedora: data.id_desenvolvedora ? Number(data.id_desenvolvedora) : null,
    id_distribuidora:  data.id_distribuidora  ? Number(data.id_distribuidora)  : null,
    id_classificacao:  data.id_classificacao  ? Number(data.id_classificacao)  : null,
  })});
export const deleteGame    = (id: number) =>
  http<void>(`${API}/games/${id}`, { method: 'DELETE' });

// ── DESENVOLVEDORAS ────────────────────────────────────────────
export const getDevelopers    = ()                         => http<Developer[]>(`${API}/developers`);
export const createDeveloper  = (data: Partial<Developer>) => http<{ id: number }>(`${API}/developers`, { method: 'POST', ...json(data) });
export const deleteDeveloper  = (id: number)               => http<void>(`${API}/developers/${id}`, { method: 'DELETE' });

// ── DISTRIBUIDORAS ─────────────────────────────────────────────
export const getPublishers   = ()                         => http<Publisher[]>(`${API}/publishers`);
export const createPublisher = (data: Partial<Publisher>) => http<{ id: number }>(`${API}/publishers`, { method: 'POST', ...json(data) });
export const deletePublisher = (id: number)               => http<void>(`${API}/publishers/${id}`, { method: 'DELETE' });

// ── LISTAS DE SUPORTE ──────────────────────────────────────────
export const getPlatforms = () => http<Platform[]>(`${API}/platforms`);
export const getGenres    = () => http<Genre[]>(`${API}/genres`);
export const getRatings   = () => http<Rating[]>(`${API}/ratings`);
