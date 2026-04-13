import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';
import { Save, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';

const FIELDS = [
  { key: 'hero_slogan', label: 'Slogan Principal', placeholder: 'Paz e Luz em Cada Detalhe', multiline: false, hint: 'Título em destaque no Hero' },
  { key: 'hero_subtitle', label: 'Subtítulo Hero', placeholder: 'Da Fé ao Conforto do Lar', multiline: false, hint: 'Subtítulo abaixo do slogan' },
  { key: 'hero_description', label: 'Texto de Destaque (Hero)', placeholder: 'De Ibiporã para todo o Brasil...', multiline: true, hint: 'Parágrafo descritivo na hero section' },
  { key: 'fabrica_title', label: 'Título — A Fábrica', placeholder: 'Estrutura Fabril em Ibiporã, Paraná', multiline: false, hint: 'Cabeçalho da seção Fábrica' },
  { key: 'fabrica_description', label: 'Descrição — A Fábrica', placeholder: 'Nossa fábrica...', multiline: true, hint: 'Texto descritivo sobre a fábrica' },
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
    const { error } = await supabase
      .from('site_content')
      .upsert({ key, value: clean, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    setSaving(null);
    setMessages(prev => ({ ...prev, [key]: error
      ? { type: 'error', text: 'Erro ao salvar.' }
      : { type: 'success', text: 'Salvo com sucesso!' }
    }));
    setTimeout(() => setMessages(prev => ({ ...prev, [key]: null })), 3000);
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-colors placeholder:text-gray-400";

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-1">Conteúdo do Site</h2>
        <p className="text-gray-500 dark:text-white/40 text-sm">Edite textos que aparecem na Home sem tocar no código.</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-blue-700 font-bold text-sm">Como funciona</p>
          <p className="text-blue-600 text-xs mt-0.5">
            Após salvar, o site público buscará automaticamente esses textos do Supabase. 
            Se o banco estiver offline, os textos padrão do código serão exibidos como fallback.
          </p>
          <a href="https://krystalvelas.vittalix.com.br" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 text-xs mt-1.5 font-bold">
            <ExternalLink size={11} /> Ver site ao vivo
          </a>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {FIELDS.map(field => (
          <div key={field.key} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <label className="text-gray-800 font-bold text-sm">{field.label}</label>
                <p className="text-gray-400 text-xs mt-0.5">{field.hint}</p>
              </div>
              <span className="text-gray-300 text-[10px] font-mono bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">
                {field.key}
              </span>
            </div>

            {field.multiline ? (
              <textarea
                rows={4}
                value={values[field.key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className={inputClass + ' resize-none'}
              />
            ) : (
              <input
                type="text"
                value={values[field.key] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className={inputClass}
              />
            )}

            <div className="flex items-center justify-between mt-3">
              <div>
                {messages[field.key] && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${
                    messages[field.key].type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {messages[field.key].type === 'success'
                      ? <CheckCircle size={13} />
                      : <AlertCircle size={13} />}
                    {messages[field.key].text}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleSave(field.key)}
                disabled={saving === field.key}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors"
              >
                <Save size={13} />
                {saving === field.key ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
