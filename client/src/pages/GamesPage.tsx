import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, deleteGame } from '../services/api';
import { fetchGameCover } from '../services/rawg';
import type { Game } from '../types';

type SortKey = 'id' | 'titulo' | 'categoria' | 'duracao_media' | 'data_lancamento' | 'desenvolvedora' | 'classificacao';
type SortDir = 'asc' | 'desc';
type ViewMode = 'table' | 'cards';

const RATING_ORDER: Record<string, number> = {
  'Livre': 0, '10+': 1, '12+': 2, '14+': 3, '16+': 4, '18+': 5,
};

const RATING_COLOR: Record<string, string> = {
  'Livre': '#4ade80', '10+': '#86efac', '12+': '#fbbf24',
  '14+': '#fb923c', '16+': '#f87171', '18+': '#dc2626',
};

export default function GamesPage() {
  const [games, setGames]       = useState<Game[]>([]);
  const [covers, setCovers]     = useState<Record<number, string>>({});
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState<{ key: SortKey; dir: SortDir }>({ key: 'titulo', dir: 'asc' });
  const [search, setSearch]     = useState('');
  const [view, setView]         = useState<ViewMode>('cards');
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      const data = await getGames();
      setGames(data);
      // Busca capas em paralelo (sem bloquear a UI)
      data.forEach(async g => {
        const url = await fetchGameCover(g.titulo);
        if (url) setCovers(prev => ({ ...prev, [g.id]: url }));
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

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
      let valA: string | number = sort.key === 'classificacao'
        ? (RATING_ORDER[a.classificacao ?? ''] ?? 99)
        : (a[sort.key] ?? '');
      let valB: string | number = sort.key === 'classificacao'
        ? (RATING_ORDER[b.classificacao ?? ''] ?? 99)
        : (b[sort.key] ?? '');
      if (valA < valB) return sort.dir === 'asc' ? -1 : 1;
      if (valA > valB) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [games, sort, search]);

  function toggleSort(key: SortKey) {
    setSort(prev => prev.key === key
      ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' });
  }

  function arrow(key: SortKey) {
    if (sort.key !== key) return <span style={{ color: 'var(--border)', marginLeft: 4 }}>⇅</span>;
    return <span style={{ color: 'var(--primary)', marginLeft: 4 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
  }

  const th = (key: SortKey, label: string) => (
    <th onClick={() => toggleSort(key)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
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
      {/* Header */}
      <div className="page-header">
        <h1>Jogos <span className="badge badge-purple">{displayed.length}</span></h1>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          {/* Toggle de visualização */}
          <div style={{
            display: 'flex', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', overflow: 'hidden'
          }}>
            <button
              onClick={() => setView('cards')}
              style={{
                padding: '.4rem .8rem', border: 'none', cursor: 'pointer', fontSize: '.9rem',
                background: view === 'cards' ? 'var(--primary)' : 'transparent',
                color: view === 'cards' ? '#fff' : 'var(--muted)',
              }}
            >⊞ Cards</button>
            <button
              onClick={() => setView('table')}
              style={{
                padding: '.4rem .8rem', border: 'none', cursor: 'pointer', fontSize: '.9rem',
                background: view === 'table' ? 'var(--primary)' : 'transparent',
                color: view === 'table' ? '#fff' : 'var(--muted)',
              }}
            >☰ Tabela</button>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/games/new')}>+ Novo Jogo</button>
        </div>
      </div>

      {/* Busca */}
      <div style={{ marginBottom: '1.25rem' }}>
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

      ) : view === 'cards' ? (
        /* ── MODO CARDS ── */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}>
          {displayed.map(g => (
            <div key={g.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform .15s, border-color .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {/* Capa */}
              <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--bg)' }}>
                {covers[g.id] ? (
                  <img
                    src={covers[g.id]}
                    alt={g.titulo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem', color: 'var(--border)',
                  }}>🎮</div>
                )}
                {/* Badge de classificação */}
                {g.classificacao && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    background: RATING_COLOR[g.classificacao] ?? '#888',
                    color: '#000', fontWeight: 700, fontSize: '.7rem',
                    padding: '2px 7px', borderRadius: 4,
                  }}>{g.classificacao}</span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '.85rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                <strong style={{ fontSize: '.95rem', lineHeight: 1.3 }}>{g.titulo}</strong>
                <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>
                  {g.categoria ?? '—'} {g.duracao_media ? `· ${g.duracao_media}h` : ''}
                </span>
                {g.generos && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', marginTop: '.2rem' }}>
                    {g.generos.split(', ').map(gen => (
                      <span key={gen} style={{
                        fontSize: '.7rem', padding: '2px 7px',
                        background: 'rgba(108,99,255,.15)', color: 'var(--primary-h)',
                        borderRadius: 99, fontWeight: 600,
                      }}>{gen}</span>
                    ))}
                  </div>
                )}
                <span style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 'auto', paddingTop: '.4rem' }}>
                  {g.desenvolvedora ?? '—'}
                  {g.data_lancamento ? ` · ${g.data_lancamento.slice(0, 4)}` : ''}
                </span>
              </div>

              {/* Ações */}
              <div style={{
                display: 'flex', borderTop: '1px solid var(--border)',
              }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, borderRadius: 0, borderRight: '1px solid var(--border)' }}
                  onClick={() => navigate(`/games/${g.id}/edit`)}
                >Editar</button>
                <button
                  className="btn btn-danger"
                  style={{ flex: 1, borderRadius: 0 }}
                  onClick={() => handleDelete(g.id, g.titulo)}
                >Deletar</button>
              </div>
            </div>
          ))}
        </div>

      ) : (
        /* ── MODO TABELA ── */
        <div className="table-wrap">
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              <col style={{ width: '4%' }} />   {/* # */}
              <col style={{ width: '22%' }} />  {/* Título */}
              <col style={{ width: '11%' }} />  {/* Categoria */}
              <col style={{ width: '7%' }} />   {/* Duração */}
              <col style={{ width: '9%' }} />   {/* Classificação */}
              <col style={{ width: '16%' }} />  {/* Gêneros */}
              <col style={{ width: '16%' }} />  {/* Desenvolvedora */}
              <col style={{ width: '8%' }} />   {/* Lançamento */}
              <col style={{ width: '14%' }} />  {/* Ações */}
            </colgroup>
            <thead>
              <tr>
                {th('id', '#')}
                {th('titulo', 'Título')}
                {th('categoria', 'Categoria')}
                {th('duracao_media', 'Dur.')}
                {th('classificacao', 'Classif.')}
                <th>Gêneros</th>
                {th('desenvolvedora', 'Desenvolvedora')}
                {th('data_lancamento', 'Lançamento')}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(g => (
                <tr key={g.id}>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{g.id}</td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <strong title={g.titulo}>{g.titulo}</strong>
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.85rem' }}>
                    {g.categoria ?? '—'}
                  </td>
                  <td style={{ fontSize: '.85rem' }}>
                    {g.duracao_media != null ? `${g.duracao_media}h` : '—'}
                  </td>
                  <td>
                    {g.classificacao
                      ? <span className="badge badge-green">{g.classificacao}</span>
                      : '—'}
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.85rem' }}
                      title={g.generos ?? ''}>
                    {g.generos ?? '—'}
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '.85rem' }}
                      title={g.desenvolvedora ?? ''}>
                    {g.desenvolvedora ?? '—'}
                  </td>
                  <td style={{ fontSize: '.85rem' }}>{g.data_lancamento?.slice(0, 4) ?? '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '.4rem' }}>
                      <button className="btn btn-secondary"
                        style={{ padding: '.3rem .6rem', fontSize: '.8rem' }}
                        onClick={() => navigate(`/games/${g.id}/edit`)}>Editar</button>
                      <button className="btn btn-danger"
                        style={{ padding: '.3rem .6rem', fontSize: '.8rem' }}
                        onClick={() => handleDelete(g.id, g.titulo)}>Deletar</button>
                    </div>
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