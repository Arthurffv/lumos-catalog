import { useEffect, useState } from 'react';
import { getDevelopers, createDeveloper, deleteDeveloper } from '../services/api';
import type { Developer } from '../types';

const EMPTY = { nome: '', cnpj: '', estudio: '', diretor: '', pais: '', data_fundacao: '' };

export default function DevelopersPage() {
  const [list, setList]     = useState<Developer[]>([]);
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setList(await getDevelopers()); }
    catch (e: any) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    setError(''); setLoading(true);
    try {
      await createDeveloper(form);
      setForm(EMPTY);
      await load();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Deletar "${nome}"?`)) return;
    try { await deleteDeveloper(id); setList(l => l.filter(x => x.id !== id)); }
    catch (e: any) { alert('Erro: ' + e.message); }
  }

  const field = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <h1>Desenvolvedoras <span className="badge badge-purple">{list.length}</span></h1>
      </div>

      {/* Formulário de cadastro */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>Nova Desenvolvedora</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Nome *</label>
              <input value={form.nome} onChange={e => field('nome', e.target.value)} placeholder="CD Projekt Red" /></div>
            <div className="form-group"><label>CNPJ</label>
              <input value={form.cnpj} onChange={e => field('cnpj', e.target.value)} placeholder="00.000.000/0000-00" /></div>
            <div className="form-group"><label>Estúdio</label>
              <input value={form.estudio} onChange={e => field('estudio', e.target.value)} /></div>
            <div className="form-group"><label>Diretor</label>
              <input value={form.diretor} onChange={e => field('diretor', e.target.value)} /></div>
            <div className="form-group"><label>País</label>
              <input value={form.pais} onChange={e => field('pais', e.target.value)} placeholder="Polônia" /></div>
            <div className="form-group"><label>Data de Fundação</label>
              <input type="date" value={form.data_fundacao} onChange={e => field('data_fundacao', e.target.value)} /></div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : '+ Cadastrar'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabela */}
      {list.length === 0 ? <p className="empty">Nenhuma desenvolvedora cadastrada.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>#</th><th>Nome</th><th>Estúdio</th><th>Diretor</th>
              <th>País</th><th>Fundação</th><th></th>
            </tr></thead>
            <tbody>
              {list.map(d => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td><strong>{d.nome}</strong></td>
                  <td>{d.estudio ?? '—'}</td>
                  <td>{d.diretor ?? '—'}</td>
                  <td>{d.pais ?? '—'}</td>
                  <td>{d.data_fundacao ?? '—'}</td>
                  <td><button className="btn btn-danger" onClick={() => handleDelete(d.id, d.nome)}>Deletar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
