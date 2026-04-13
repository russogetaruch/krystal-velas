import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';
import { Save, Eye, CheckCircle, AlertCircle } from 'lucide-react';

const FIELDS = [
  { key: 'hero_slogan', label: 'Slogan Principal', placeholder: 'A luz que nos conduz', multiline: false },
  { key: 'hero_subtitle', label: 'Subtítulo Hero', placeholder: 'Da Fé ao Conforto do Lar', multiline: false },
  { key: 'hero_description', label: 'Texto de Destaque', placeholder: 'De Ibiporã para todos...', multiline: true },
  { key: 'fabrica_title', label: 'Título — A Fábrica', placeholder: 'Estrutura Fabril em Ibiporã, Paraná', multiline: false },
  { key: 'fabrica_description', label: 'Descrição — A Fábrica', placeholder: 'Texto sobre a fábrica...', multiline: true },
];

export default function AdminContent() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [messages, setMessages] = useState({});

  const load = async () => {
    const { data } = await supabase.from('site_content').select('*');
    const map = {};
    (data || []).forEach(row => { map[row.key] = row.value; });
    setValues(map);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (key) => {
    const raw = values[key] || '';
    const clean = DOMPurify.sanitize(raw.trim(), { ALLOWED_TAGS: [] });
    setSaving(key);
    const { error } = await supabase.from('site_content').upsert({ key, value: clean, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(null);
    setMessages(prev => ({ ...prev, [key]: error ? { type: 'error', text: 'Erro ao salvar.' } : { type: 'success', text: 'Salvo!' } }));
    setTimeout(() => setMessages(prev => ({ ...prev, [key]: null })), 3000);
  };

  if (loading) return <p className="text-white/30 text-sm">Carregando conteúdo...</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-white mb-1">Conteúdo do Site</h2>
        <p className="text-white/40 text-sm">Edite textos que aparecem na Home sem tocar no código.</p>
      </div>

      <div className="space-y-6">
        {FIELDS.map(field => (
          <div key={field.key} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-white font-bold text-sm">{field.label}</label>
              <span className="text-white/20 text-xs font-mono">{field.key}</span>
            </div>

            {field.multiline ? (
              <textarea
                rows={4}
                value={values[field.key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 resize-none"
              />
            ) : (
              <input
                type="text"
                value={values[field.key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50"
              />
            )}

            <div className="flex items-center justify-between">
              {messages[field.key] ? (
                <div className={`flex items-center gap-2 text-xs ${messages[field.key].type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {messages[field.key].type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                  {messages[field.key].text}
                </div>
              ) : <div />}

              <button
                onClick={() => handleSave(field.key)}
                disabled={saving === field.key}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-colors"
              >
                <Save size={12} />
                {saving === field.key ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 text-blue-300 font-bold text-sm mb-2">
          <Eye size={16} /> Como funciona
        </div>
        <p className="text-blue-300/70 text-sm">
          Após salvar, o site público buscará automaticamente esses textos do Supabase. Se o banco estiver offline, os textos padrão do código serão exibidos como fallback.
        </p>
      </div>
    </div>
  );
}
