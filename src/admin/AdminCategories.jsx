import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, Save, X, Tag } from 'lucide-react';
import { logAudit } from './adminUtils';

export default function AdminCategories({ session }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) {
      setError('Erro ao carregar categorias. Verifique sua conexão ou permissões.');
      console.error(error);
    } else {
      setCategories(data);
    }
    setLoading(false);
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    const slug = newCat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w ]+/g,'').replace(/ +/g,'-');
    const { error } = await supabase.from('categories').insert([{ ...newCat, slug }]);
    if (!error) {
      await logAudit(session, 'CATEGORY_CREATE', { name: newCat.name });
      setNewCat({ name: '', description: '' });
      fetchCategories();
    }
  };

  const handleUpdate = async (id) => {
    const slug = editForm.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w ]+/g,'').replace(/ +/g,'-');
    const { error } = await supabase.from('categories').update({ ...editForm, slug }).eq('id', id);
    if (!error) {
      await logAudit(session, 'CATEGORY_UPDATE', { name: editForm.name, id });
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir esta categoria? Isso pode afetar produtos vinculados.')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) {
      await logAudit(session, 'CATEGORY_DELETE', { id });
      fetchCategories();
    }
  };

  if (loading) return <div className="animate-pulse text-gray-400 text-xs text-center py-20">Lendo categorias...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Categorias</h2>
        <p className="text-gray-500 dark:text-white/40 text-sm">Organize suas velas por tipo ou uso.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <span>⚠️ {error}</span>
          <button onClick={fetchCategories} className="ml-auto underline font-bold uppercase">Tentar novamente</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Nova Categoria */}
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
            <Plus size={16} /> Nova Categoria
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <input 
              type="text" 
              placeholder="Nome (ex: Decorativas)" 
              value={newCat.name}
              onChange={e => setNewCat({...newCat, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:border-orange-500 transition-all"
            />
            <textarea 
              placeholder="Descrição curta..." 
              value={newCat.description}
              onChange={e => setNewCat({...newCat, description: e.target.value})}
              className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white focus:outline-none focus:border-orange-500 transition-all h-24 resize-none"
            />
            <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-500/20 text-xs uppercase tracking-widest">
              Adicionar
            </button>
          </form>
        </div>

        {/* Lista de Categorias */}
        <div className="lg:col-span-2 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/10">
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {categories.map(cat => (
                <tr key={cat.id} className="group hover:bg-gray-50/30 dark:hover:bg-white/[0.01]">
                  <td className="px-6 py-4">
                    {editingId === cat.id ? (
                      <div className="space-y-2 py-2">
                        <input 
                          value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-3 py-2 text-sm dark:text-white"
                        />
                        <input 
                          value={editForm.description} 
                          onChange={e => setEditForm({...editForm, description: e.target.value})}
                          placeholder="Descrição"
                          className="w-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/20 rounded-lg px-3 py-1 text-xs dark:text-white"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                          <Tag size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white/80">{cat.name}</p>
                          <p className="text-[10px] text-gray-400 truncate max-w-xs">{cat.description || 'Sem descrição'}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === cat.id ? (
                        <>
                          <button onClick={() => handleUpdate(cat.id)} className="p-2 text-green-500 hover:bg-green-50 rounded-lg"><Save size={16} /></button>
                          <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"><X size={16} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, description: cat.description || '' }); }} className="p-2 text-gray-400 hover:text-orange-500 rounded-lg transition-colors"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
