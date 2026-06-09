import { useEffect, useState } from 'react';
import { getPublishers, createPublisher, deletePublisher } from '../services/api';
import type { Publisher } from '../types';

const EMPTY = { nome: '', cnpj: '', pais: '' };

export default function PublishersPage() {
  const [list, setList]     = useState<Publisher[]>([]);
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    try { setList(await getPublishers()); }
    catch (e: any) { setError(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) { setError('Nome é obrigatório.'); return; }
    setError(''); setLoading(true);
    try { await createPublisher(form); setForm(EMPTY); await load(); }
    catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Deletar "${nome}"?`)) return;
    try { await deletePublisher(id); setList(l => l.filter(x => x.id !== id)); }
    catch (e: any) { alert('Erro: ' + e.message); }
  }

  const field = (k: keyof typeof EMPTY, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header">
        <h1>Distribuidoras <span className="badge badge-purple">{list.length}</span></h1>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--muted)' }}>Nova Distribuidora</h2>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group"><label>Nome *</label>
              <input value={form.nome} onChange={e => field('nome', e.target.value)} placeholder="EA Games" /></div>
            <div className="form-group"><label>CNPJ</label>
              <input value={form.cnpj} onChange={e => field('cnpj', e.target.value)} placeholder="00.000.000/0000-00" /></div>
            <div className="form-group"><label>País</label>
              <input value={form.pais} onChange={e => field('pais', e.target.value)} placeholder="EUA" /></div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : '+ Cadastrar'}
            </button>
          </div>
        </form>
      </div>

      {list.length === 0 ? <p className="empty">Nenhuma distribuidora cadastrada.</p> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Nome</th><th>CNPJ</th><th>País</th><th></th></tr></thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td><td><strong>{p.nome}</strong></td>
                  <td>{p.cnpj ?? '—'}</td><td>{p.pais ?? '—'}</td>
                  <td><button className="btn btn-danger" onClick={() => handleDelete(p.id, p.nome)}>Deletar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
