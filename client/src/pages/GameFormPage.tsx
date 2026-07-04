import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDevelopers, getPublishers, getPlatforms, getGenres, getRatings, createGame, updateGame, getGameById } from '../services/api';
import type { Developer, Publisher, Platform, Genre, Rating, GameFormData } from '../types';

const EMPTY: GameFormData = {
  titulo: '', duracao_media: '', categoria: '',
  id_desenvolvedora: '', id_distribuidora: '', data_lancamento: '',
  id_classificacao: '', ids_generos: [], ids_plataformas: [],
};

export default function GameFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm]         = useState<GameFormData>(EMPTY);
  const [developers, setDev]    = useState<Developer[]>([]);
  const [publishers, setPub]    = useState<Publisher[]>([]);
  const [platforms, setPlat]    = useState<Platform[]>([]);
  const [genres, setGen]        = useState<Genre[]>([]);
  const [ratings, setRat]       = useState<Rating[]>([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    Promise.all([getDevelopers(), getPublishers(), getPlatforms(), getGenres(), getRatings()])
      .then(([d, p, pl, g, r]) => { setDev(d); setPub(p); setPlat(pl); setGen(g); setRat(r); });

    if (isEdit && id) {
      getGameById(Number(id)).then(game => {
        if (!game) return;
        setForm(prev => ({
          ...prev,
          titulo: game.titulo,
          duracao_media: game.duracao_media?.toString() ?? '',
          categoria: game.categoria ?? '',
          data_lancamento: game.data_lancamento ?? '',
        }));
      });
    }
  }, [id, isEdit]);

  function toggleArray(key: 'ids_generos' | 'ids_plataformas', value: number) {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) { setError('Título é obrigatório.'); return; }
    setError(''); setLoading(true);
    try {
      if (isEdit && id) {
        await updateGame(Number(id), form);
      } else {
        await createGame(form);
      }
      navigate('/games');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (key: keyof GameFormData, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Editar Jogo' : 'Novo Jogo'}</h1>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="form-grid">

            <div className="form-group full">
              <label>Título *</label>
              <input value={form.titulo} onChange={e => field('titulo', e.target.value)} placeholder="Ex: The Witcher 3" />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <input value={form.categoria} onChange={e => field('categoria', e.target.value)} placeholder="Ex: Open World" />
            </div>

            <div className="form-group">
              <label>Duração Média (horas)</label>
              <input type="number" min="0" value={form.duracao_media} onChange={e => field('duracao_media', e.target.value)} placeholder="Ex: 50" />
            </div>

            <div className="form-group">
              <label>Data de Lançamento</label>
              <input type="date" value={form.data_lancamento} onChange={e => field('data_lancamento', e.target.value)} />
            </div>

            <div className="form-group">
              <label>Classificação Indicativa</label>
              <select value={form.id_classificacao} onChange={e => field('id_classificacao', e.target.value)}>
                <option value="">— Selecione —</option>
                {ratings.map(r => <option key={r.id} value={r.id}>{r.faixa_etaria}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Desenvolvedora</label>
              <select value={form.id_desenvolvedora} onChange={e => field('id_desenvolvedora', e.target.value)}>
                <option value="">— Selecione —</option>
                {developers.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Distribuidora</label>
              <select value={form.id_distribuidora} onChange={e => field('id_distribuidora', e.target.value)}>
                <option value="">— Selecione —</option>
                {publishers.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>

            <div className="form-group full">
              <label>Gêneros</label>
              <div className="check-grid">
                {genres.map(g => (
                  <label key={g.id} className="check-item">
                    <input type="checkbox" checked={form.ids_generos.includes(g.id)}
                      onChange={() => toggleArray('ids_generos', g.id)} />
                    {g.nome}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group full">
              <label>Plataformas</label>
              <div className="check-grid">
                {platforms.map(p => (
                  <label key={p.id} className="check-item">
                    <input type="checkbox" checked={form.ids_plataformas.includes(p.id)}
                      onChange={() => toggleArray('ids_plataformas', p.id)} />
                    {p.nome}
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/games')}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar Jogo'}
          </button>
        </div>
      </form>
    </div>
  );
}
