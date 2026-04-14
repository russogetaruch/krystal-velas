import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DOMPurify from 'dompurify';
import { Save, CheckCircle, AlertCircle, Info, ExternalLink } from 'lucide-react';

const FIELDS = [
  { key: 'hero_slogan',         label: 'Slogan Principal',          placeholder: 'Paz e Luz em Cada Detalhe',             multiline: false, hint: 'Título em destaque no Hero' },
  { key: 'hero_subtitle',       label: 'Subtítulo Hero',            placeholder: 'Da Fé ao Conforto do Lar',              multiline: false, hint: 'Subtítulo abaixo do slogan' },
  { key: 'hero_description',    label: 'Texto de Destaque (Hero)',  placeholder: 'De Ibiporã para todo o Brasil...',      multiline: true,  hint: 'Parágrafo descritivo na hero section' },
  { key: 'fabrica_title',       label: 'Título — A Fábrica',       placeholder: 'Estrutura Fabril em Ibiporã, Paraná',   multiline: false, hint: 'Cabeçalho da seção Fábrica' },
  { key: 'fabrica_description', label: 'Descrição — A Fábrica',    placeholder: 'Nossa fábrica...',                      multiline: true,  hint: 'Texto descritivo sobre a fábrica' },
];

const WHATSAPP_FIELDS = [
  { key: 'whatsapp_number', label: 'Número WhatsApp', placeholder: '5543998073376', hint: 'Só números com DDI+DDD, sem espaços ou símbolos. Ex: 5543999999999', multiline: false },
  { key: 'whatsapp_message_atacado', label: 'Mensagem — Botão Atacado', placeholder: 'Olá, queria acesso à tabela de Atacado para Lojista/Eventos.', hint: 'Texto pré-preenchido quando o cliente clica no botão de Atacado', multiline: true },
  { key: 'whatsapp_message_contact', label: 'Mensagem — Botão de Contato/Orçamento', placeholder: 'Olá! Gostaria de fazer um orçamento.', hint: 'Texto pré-preenchido no botão de contato flutuante', multiline: true },
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
    let clean = DOMPurify.sanitize(raw.trim(), { ALLOWED_TAGS: [] });

    // Validação específica para WhatsApp
    if (key === 'whatsapp_number') {
      clean = clean.replace(/\D/g, ''); // Remove tudo que não for dígito
      if (clean.length < 10) {
        setMessages(prev => ({ ...prev, [key]: { type: 'error', text: 'Número inválido (mínimo 10 dígitos com DDD)' } }));
        setTimeout(() => setMessages(prev => ({ ...prev, [key]: null })), 3000);
        return;
      }
    }

    setSaving(key);
    try {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value: clean, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      if (error) throw new Error(error.message);
      setMessages(prev => ({ ...prev, [key]: { type: 'success', text: 'Salvo com sucesso!' } }));
    } catch (err) {
      setMessages(prev => ({ ...prev, [key]: { type: 'error', text: 'Erro: ' + err.message } }));
    } finally {
      setSaving(null);
      setTimeout(() => setMessages(prev => ({ ...prev, [key]: null })), 3000);
    }
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

      {/* ─── WhatsApp Settings ─── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-2 border-b border-gray-200 dark:border-white/10">
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 1C5.927 1 1 5.927 1 12c0 1.889.494 3.66 1.358 5.196L1.016 23l5.958-1.32A10.954 10.954 0 0012 23c6.073 0 11-4.927 11-11S18.073 1 12 1zm0 20a8.96 8.96 0 01-4.577-1.25l-.328-.194-3.539.784.802-3.441-.213-.353A8.968 8.968 0 013 12C3 7.029 7.029 3 12 3s9 4.029 9 9-4.029 9-9 9z"/></svg>
          </div>
          <div>
            <h3 className="text-gray-800 dark:text-white font-bold text-sm">Configurações do WhatsApp</h3>
            <p className="text-gray-400 dark:text-white/30 text-xs">Número e mensagens dos botões de contato no site</p>
          </div>
        </div>

        {WHATSAPP_FIELDS.map(field => (
          <div key={field.key} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <label className="text-gray-800 dark:text-white font-bold text-sm">{field.label}</label>
                <p className="text-gray-400 dark:text-white/30 text-xs mt-0.5">{field.hint}</p>
              </div>
              <span className="text-gray-300 dark:text-white/20 text-[10px] font-mono bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 px-2 py-1 rounded-lg ml-2 shrink-0">{field.key}</span>
            </div>
            {field.multiline
              ? <textarea rows={3} value={values[field.key] || ''} onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className={inputClass + ' resize-none'} />
              : <input type="text" value={values[field.key] || ''} onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} className={inputClass} />
            }
            <div className="flex items-center justify-between mt-3">
              <div>
                {messages[field.key] && (
                  <div className={`flex items-center gap-1.5 text-xs font-bold ${messages[field.key].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {messages[field.key].type === 'success' ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                    {messages[field.key].text}
                  </div>
                )}
              </div>
              <button onClick={() => handleSave(field.key)} disabled={saving === field.key}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl transition-colors">
                <Save size={13} /> {saving === field.key ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
