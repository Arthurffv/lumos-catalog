import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGames, deleteGame } from '../services/api';
import type { Game } from '../types';

export default function GamesPage() {
  const [games, setGames]   = useState<Game[]>([]);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function load() {
    try {
      setLoading(true);
      setGames(await getGames());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: number, titulo: string) {
    if (!confirm(`Deletar "${titulo}"?`)) return;
    try {
      await deleteGame(id);
      setGames(g => g.filter(x => x.id !== id));
    } catch (e: any) {
      alert('Erro ao deletar: ' + e.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Jogos <span className="badge badge-purple">{games.length}</span></h1>
        <button className="btn btn-primary" onClick={() => navigate('/games/new')}>+ Novo Jogo</button>
      </div>

      {error && <p className="error-msg">{error}</p>}

      {loading ? (
        <p className="empty">Carregando...</p>
      ) : games.length === 0 ? (
        <p className="empty">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Título</th><th>Categoria</th><th>Duração</th>
                <th>Classificação</th><th>Gêneros</th><th>Plataformas</th>
                <th>Desenvolvedora</th><th>Lançamento</th><th></th>
              </tr>
            </thead>
            <tbody>
              {games.map(g => (
                <tr key={g.id}>
                  <td>{g.id}</td>
                  <td><strong>{g.titulo}</strong></td>
                  <td>{g.categoria ?? '—'}</td>
                  <td>{g.duracao_media != null ? `${g.duracao_media}h` : '—'}</td>
                  <td>{g.classificacao ? <span className="badge badge-green">{g.classificacao}</span> : '—'}</td>
                  <td>{g.generos ?? '—'}</td>
                  <td>{g.plataformas ?? '—'}</td>
                  <td>{g.desenvolvedora ?? '—'}</td>
                  <td>{g.data_lancamento ?? '—'}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => navigate(`/games/${g.id}/edit`)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(g.id, g.titulo)}>Deletar</button>
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
