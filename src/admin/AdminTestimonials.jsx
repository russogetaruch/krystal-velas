import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';
import { Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const SOURCES = ['google', 'instagram', 'facebook', 'whatsapp'];

const SOURCE_STYLE = {
  google:    'bg-blue-50 text-blue-600 border-blue-200',
  instagram: 'bg-pink-50 text-pink-600 border-pink-200',
  facebook:  'bg-indigo-50 text-indigo-600 border-indigo-200',
  whatsapp:  'bg-green-50 text-green-700 border-green-200',
};

const SourceBadge = ({ source }) => (
  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${SOURCE_STYLE[source] || SOURCE_STYLE.google}`}>
    {source}
  </span>
);

export default function AdminTestimonials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ author: '', role: '', location: '', quote: '', source: 'google', avatar_url: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sanitize = (str) => DOMPurify.sanitize(str.trim(), { ALLOWED_TAGS: [] });

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.author || !form.quote) {
      setMessage({ type: 'error', text: 'Nome e depoimento são obrigatórios.' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('testimonials').insert({
        author: sanitize(form.author),
        role: sanitize(form.role),
        location: sanitize(form.location),
        quote: sanitize(form.quote),
        source: form.source,
        avatar_url: form.avatar_url.trim() || null,
        active: true,
      });
      if (error) throw new Error(error.message);
      setMessage({ type: 'success', text: 'Depoimento publicado com sucesso!' });
      setForm({ author: '', role: '', location: '', quote: '', source: 'google', avatar_url: '' });
      setTimeout(() => setMessage(null), 3000);
      load();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item) => {
    await supabase.from('testimonials').update({ active: !item.active }).eq('id', item.id);
    setList(prev => prev.map(t => t.id === item.id ? { ...t, active: !t.active } : t));
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este depoimento?')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    setList(prev => prev.filter(t => t.id !== id));
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-colors placeholder:text-gray-400";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-1">Depoimentos</h2>
        <p className="text-gray-500 dark:text-white/40 text-sm">Adicione e gerencie prova social. Só os ativos aparecem no site.</p>
      </div>

      {/* Add Form */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-gray-800 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <Plus size={16} className="text-orange-500" /> Novo Depoimento
        </h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1.5">Nome *</label>
              <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} type="text" maxLength={80} placeholder="Maria Silva" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1.5">Cargo / Perfil</label>
              <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} type="text" maxLength={80} placeholder="Decoradora de Eventos" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1.5">Cidade</label>
              <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} type="text" maxLength={60} placeholder="Londrina - PR" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1.5">URL da Foto (Avatar)</label>
              <input value={form.avatar_url} onChange={e => setForm({...form, avatar_url: e.target.value})} type="url" placeholder="https://exemplo.com/foto.jpg" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1.5">Depoimento *</label>
            <textarea value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} rows={3} maxLength={400} placeholder="Escreva o texto do depoimento aqui..."
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 resize-none placeholder:text-gray-400" />
            <p className="text-gray-400 text-xs mt-1 text-right">{form.quote.length}/400</p>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1.5">Origem</label>
              <select value={form.source} onChange={e => setForm({...form, source: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400">
                {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl text-sm uppercase tracking-widest flex items-center gap-2 transition-colors">
              <Plus size={16} /> {saving ? 'Salvando...' : 'Publicar'}
            </button>
          </div>

          {message && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">
            Publicados ({list.length})
          </h3>
          {list.filter(t => !t.active).length > 0 && (
            <span className="text-xs text-yellow-600 font-bold">{list.filter(t => !t.active).length} oculto(s)</span>
          )}
        </div>

        {loading && (
          <div className="space-y-3">
            {[1,2].map(i => <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-24" />)}
          </div>
        )}

        {!loading && list.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <MessageSquare className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-400 text-sm font-medium">Nenhum depoimento cadastrado</p>
            <p className="text-gray-300 text-xs mt-1">Adicione o primeiro depoimento acima</p>
          </div>
        )}

        {list.map(item => (
          <div key={item.id} className={`bg-white border rounded-2xl p-5 flex items-start gap-4 transition-opacity ${
            item.active ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-60'
          }`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <p className="text-gray-900 font-bold text-sm">{item.author}</p>
                <SourceBadge source={item.source} />
                {!item.active && (
                  <span className="text-[10px] bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">
                    Oculto
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs mb-2">{item.role}{item.role && item.location ? ' · ' : ''}{item.location}</p>
              <p className="text-gray-600 text-sm italic leading-relaxed">"{item.quote}"</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleActive(item)}
                className="p-2 rounded-xl border border-gray-200 hover:border-orange-200 text-gray-400 hover:text-orange-500 transition-colors"
                title={item.active ? 'Ocultar' : 'Mostrar'}>
                {item.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => handleDelete(item.id)}
                className="p-2 rounded-xl border border-gray-200 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
