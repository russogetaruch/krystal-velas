import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus, Edit2, Trash2, X, AlertCircle,
  Building2, Phone, Mail, MapPin, FileText
} from 'lucide-react';
import { logAudit } from './adminUtils';

const EMPTY_FORM = { name: '', cnpj: '', email: '', phone: '', address: '', notes: '', is_active: true };

export default function AdminSuppliers({ session }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  useEffect(() => { fetchSuppliers(); }, []);

  async function fetchSuppliers() {
    setLoading(true);
    const { data } = await supabase.from('suppliers').select('*').order('name');
    setSuppliers(data || []);
    setLoading(false);
  }

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditing(supplier);
      setForm({
        name      : supplier.name,
        cnpj      : supplier.cnpj      || '',
        email     : supplier.email     || '',
        phone     : supplier.phone     || '',
        address   : supplier.address   || '',
        notes     : supplier.notes     || '',
        is_active : supplier.is_active,
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        const { error: e } = await supabase.from('suppliers').update(form).eq('id', editing.id);
        if (e) throw e;
        await logAudit(session, 'SUPPLIER_UPDATE', { name: form.name, id: editing.id });
      } else {
        const { error: e } = await supabase.from('suppliers').insert([form]);
        if (e) throw e;
        await logAudit(session, 'SUPPLIER_CREATE', { name: form.name });
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remover fornecedor "${name}"? Movimentações de estoque vinculadas serão mantidas.`)) return;
    const { error: e } = await supabase.from('suppliers').delete().eq('id', id);
    if (!e) {
      await logAudit(session, 'SUPPLIER_DELETE', { name, id });
      fetchSuppliers();
    }
  };

  const field = (key, label, props = {}) => (
    <div>
      <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">{label}</label>
      <input
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none transition-colors"
        {...props}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Fornecedores</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Gerencie fornecedores e vincule às entradas de estoque.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
        >
          <Plus size={18} /> Novo Fornecedor
        </button>
      </div>

      {/* Grid de Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-52 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl animate-pulse" />
          ))
        ) : suppliers.length === 0 ? (
          <div className="md:col-span-3 flex flex-col items-center justify-center py-24 text-gray-300 dark:text-white/10">
            <Building2 size={56} className="mb-4" />
            <p className="text-gray-400 font-serif text-lg">Nenhum fornecedor cadastrado.</p>
            <p className="text-gray-300 text-xs mt-1">Clique em "Novo Fornecedor" para começar.</p>
          </div>
        ) : suppliers.map(s => (
          <div
            key={s.id}
            className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 hover:shadow-xl transition-all duration-500 group hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center shadow-sm">
                <Building2 size={22} className="text-orange-500" />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(s)}
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <h3 className="font-serif text-lg text-brown dark:text-white mb-1 truncate">{s.name}</h3>
            {s.cnpj && (
              <p className="text-[10px] font-mono text-gray-400 mb-4 tracking-wider">CNPJ: {s.cnpj}</p>
            )}

            <div className="space-y-2">
              {s.email && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                  <Mail size={11} className="text-gray-400" /> {s.email}
                </div>
              )}
              {s.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                  <Phone size={11} className="text-gray-400" /> {s.phone}
                </div>
              )}
              {s.address && (
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 truncate">
                  <MapPin size={11} className="text-gray-400 flex-shrink-0" /> {s.address}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-50 dark:border-white/5">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                s.is_active ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-white/5 text-gray-400'
              }`}>
                {s.is_active ? '● Ativo' : '○ Inativo'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150a06] rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-serif text-brown dark:text-white">
                {editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {field('name',    'Nome *')}
              <div className="grid grid-cols-2 gap-4">
                {field('cnpj',  'CNPJ', { placeholder: '00.000.000/0001-00' })}
                {field('phone', 'Telefone')}
              </div>
              {field('email',   'E-mail', { type: 'email' })}
              {field('address', 'Endereço')}
              <div>
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white h-20 resize-none outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox" id="sup_active"
                  checked={form.is_active}
                  onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-orange-500"
                />
                <label htmlFor="sup_active" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fornecedor Ativo</label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5">
                  Cancelar
                </button>
                <button
                  onClick={handleSave} disabled={saving}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Fornecedor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
