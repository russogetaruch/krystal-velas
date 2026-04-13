import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';
import { Plus, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const SOURCES = ['google', 'instagram', 'facebook'];

const SourceBadge = ({ source }) => {
  const map = {
    google: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Google' },
    instagram: { color: 'bg-pink-500/20 text-pink-300 border-pink-500/30', label: 'Instagram' },
    facebook: { color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', label: 'Facebook' },
  };
  const s = map[source] || map.google;
  return <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border ${s.color}`}>{s.label}</span>;
};

export default function AdminTestimonials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ author: '', role: '', location: '', quote: '', source: 'google' });

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
    const clean = {
      author: sanitize(form.author),
      role: sanitize(form.role),
      location: sanitize(form.location),
      quote: sanitize(form.quote),
      source: form.source,
      active: true,
    };
    const { error } = await supabase.from('testimonials').insert(clean);
    setSaving(false);
    if (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Depoimento publicado!' });
      setForm({ author: '', role: '', location: '', quote: '', source: 'google' });
      load();
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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-white mb-1">Depoimentos</h2>
        <p className="text-white/40 text-sm">Adicione e gerencie prova social. Só os ativos aparecem no site.</p>
      </div>

      {/* Add Form */}
      <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold text-sm uppercase tracking-widest">Novo Depoimento</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Nome *</label>
            <input value={form.author} onChange={e => setForm({...form, author: e.target.value})} type="text" maxLength={80} placeholder="Maria Silva" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Cargo / Perfil</label>
            <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} type="text" maxLength={80} placeholder="Decoradora de Eventos" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Cidade</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} type="text" maxLength={60} placeholder="Londrina - PR" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50" />
          </div>
        </div>
        <div>
          <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Depoimento *</label>
          <textarea value={form.quote} onChange={e => setForm({...form, quote: e.target.value})} rows={3} maxLength={400} placeholder="Escreva o texto do depoimento aqui..." className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500/50 resize-none" />
          <p className="text-white/20 text-xs mt-1 text-right">{form.quote.length}/400</p>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Origem</label>
            <select value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full bg-[#2d1407] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl text-sm uppercase tracking-widest flex items-center gap-2 transition-colors">
            <Plus size={16} /> {saving ? 'Salvando...' : 'Publicar'}
          </button>
        </div>
        {message && (
          <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {message.text}
          </div>
        )}
      </form>

      {/* List */}
      <div className="space-y-3">
        <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Publicados ({list.length})</h3>
        {loading && <p className="text-white/30 text-sm">Carregando...</p>}
        {list.map(item => (
          <div key={item.id} className={`bg-white/5 border ${item.active ? 'border-white/10' : 'border-white/5 opacity-50'} rounded-2xl p-5 flex items-start gap-4`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-white font-bold text-sm">{item.author}</p>
                <SourceBadge source={item.source} />
                {!item.active && <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Oculto</span>}
              </div>
              <p className="text-white/40 text-xs mb-2">{item.role} · {item.location}</p>
              <p className="text-white/70 text-sm italic">"{item.quote}"</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => toggleActive(item)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors" title={item.active ? 'Ocultar' : 'Mostrar'}>
                {item.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
