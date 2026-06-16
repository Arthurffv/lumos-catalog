import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, deleteGame } from '../services/api';
import type { Game } from '../types';

// Colunas que podem ser ordenadas e suas chaves no objeto Game
type SortKey = 'id' | 'titulo' | 'categoria' | 'duracao_media' | 'data_lancamento' | 'desenvolvedora' | 'classificacao';
type SortDir = 'asc' | 'desc';

interface SortState { key: SortKey; dir: SortDir; }

// Ordem personalizada para classificação indicativa
const RATING_ORDER: Record<string, number> = {
  'Livre': 0, '10+': 1, '12+': 2, '14+': 3, '16+': 4, '18+': 5,
};

export default function GamesPage() {
  const [games, setGames]     = useState<Game[]>([]);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);
  const [sort, setSort]       = useState<SortState>({ key: 'titulo', dir: 'asc' });
  const [search, setSearch]   = useState('');
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      setGames(await getGames());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  // Ordena e filtra no front — sem nova chamada ao banco
  const displayed = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? games.filter(g =>
          g.titulo.toLowerCase().includes(q) ||
          (g.categoria ?? '').toLowerCase().includes(q) ||
          (g.desenvolvedora ?? '').toLowerCase().includes(q) ||
          (g.generos ?? '').toLowerCase().includes(q) ||
          (g.plataformas ?? '').toLowerCase().includes(q)
        )
      : games;

    return [...filtered].sort((a, b) => {
      let valA: string | number | null;
      let valB: string | number | null;

      if (sort.key === 'classificacao') {
        valA = RATING_ORDER[a.classificacao ?? ''] ?? 99;
        valB = RATING_ORDER[b.classificacao ?? ''] ?? 99;
      } else {
        valA = a[sort.key] ?? '';
        valB = b[sort.key] ?? '';
      }

      if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [games, sort, search]);

  function toggleSort(key: SortKey) {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    );
  }

  // Ícone de seta na coluna ativa
  function arrow(key: SortKey) {
    if (sort.key !== key) return <span style={{ color: 'var(--border)', marginLeft: 4 }}>⇅</span>;
    return <span style={{ color: 'var(--primary)', marginLeft: 4 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
  }

  // Estilo do th clicável
  const th = (key: SortKey, label: string) => (
    <th
      onClick={() => toggleSort(key)}
      style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      {label}{arrow(key)}
    </th>
  );

  async function handleDelete(id: number, titulo: string) {
    if (!confirm(`Deletar "${titulo}"?`)) return;
    try {
      await deleteGame(id);
      setGames(g => g.filter(x => x.id !== id));
    } catch (e: any) { alert('Erro ao deletar: ' + e.message); }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Jogos <span className="badge badge-purple">{displayed.length}</span></h1>
        <button className="btn btn-primary" onClick={() => navigate('/games/new')}>+ Novo Jogo</button>
      </div>

      {/* Barra de busca */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍  Buscar por título, gênero, plataforma, desenvolvedora..."
          style={{ width: '100%', padding: '.6rem 1rem', fontSize: '.95rem' }}
        />
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="empty">Carregando...</p>
      ) : displayed.length === 0 ? (
        <p className="empty">Nenhum jogo encontrado.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {th('id',             '#')}
                {th('titulo',         'Título')}
                {th('categoria',      'Categoria')}
                {th('duracao_media',  'Duração')}
                {th('classificacao',  'Classificação')}
                <th>Gêneros</th>
                <th>Plataformas</th>
                {th('desenvolvedora', 'Desenvolvedora')}
                {th('data_lancamento','Lançamento')}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(g => (
                <tr key={g.id}>
                  <td style={{ color: 'var(--muted)', fontSize: '.85rem' }}>{g.id}</td>
                  <td><strong>{g.titulo}</strong></td>
                  <td>{g.categoria ?? '—'}</td>
                  <td>{g.duracao_media != null ? `${g.duracao_media}h` : '—'}</td>
                  <td>
                    {g.classificacao
                      ? <span className="badge badge-green">{g.classificacao}</span>
                      : '—'}
                  </td>
                  <td>{g.generos ?? '—'}</td>
                  <td>{g.plataformas ?? '—'}</td>
                  <td>{g.desenvolvedora ?? '—'}</td>
                  <td>{g.data_lancamento ?? '—'}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => navigate(`/games/${g.id}/edit`)}>Editar</button>
                    <button className="btn btn-danger"    onClick={() => handleDelete(g.id, g.titulo)}>Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}