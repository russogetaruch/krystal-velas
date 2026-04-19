import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FlaskConical, Plus, Edit2, Trash2, X, AlertCircle, 
  Search, Filter, Scale, Droplet, Package, Info, Check, Table as TableIcon, LayoutGrid
} from 'lucide-react';
import { logAudit } from './adminUtils';

const EMPTY_FORM = { 
  name: '', 
  unit: 'kg', 
  stock: '', 
  min_stock: '', 
  unit_cost: '', 
  notes: '', 
  is_active: true 
};

const UNITS = [
  { id: 'kg', label: 'Quilograma (kg)', icon: Scale },
  { id: 'g',  label: 'Grama (g)',       icon: Scale },
  { id: 'l',  label: 'Litro (l)',        icon: Droplet },
  { id: 'ml', label: 'Mililitro (ml)',   icon: Droplet },
  { id: 'un', label: 'Unidade (un)',     icon: Package }
];

export default function AdminRawMaterials({ session }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'grid' | 'table'

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  async function fetchMaterials() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('raw_materials')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setMaterials(data || []);
    } catch (err) {
      setError('Erro ao carregar insumos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({ 
        ...item,
        stock: item.stock === 0 ? '' : item.stock,
        min_stock: item.min_stock === 0 ? '' : item.min_stock,
        unit_cost: item.unit_cost === 0 ? '' : item.unit_cost
      });
    } else {
      setEditingItem(null);
      setForm(EMPTY_FORM);
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.unit) {
      setError('Nome e Unidade são obrigatórios.');
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      stock: form.stock === '' ? 0 : parseFloat(form.stock),
      min_stock: form.min_stock === '' ? 0 : parseFloat(form.min_stock),
      unit_cost: form.unit_cost === '' ? 0 : parseFloat(form.unit_cost)
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('raw_materials')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        await logAudit(session, 'RAW_MATERIAL_UPDATE', { name: form.name, id: editingItem.id });
      } else {
        const { error } = await supabase
          .from('raw_materials')
          .insert([payload]);
        if (error) throw error;
        await logAudit(session, 'RAW_MATERIAL_CREATE', { name: form.name });
      }
      setIsModalOpen(false);
      fetchMaterials();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remover insumo "${name}" permanentemente?`)) return;
    try {
      const { error } = await supabase.from('raw_materials').delete().eq('id', id);
      if (error) throw error;
      await logAudit(session, 'RAW_MATERIAL_DELETE', { name, id });
      fetchMaterials();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleInlineUpdate = async (id, field, value) => {
    try {
      const { error } = await supabase.from('raw_materials').update({ [field]: value }).eq('id', id);
      if (error) throw error;
      setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));
    } catch (err) {
      console.error('Erro no update rápido:', err);
    }
  };

  const handleNumericFocus = (e) => e.target.select();

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = filterUnit === 'all' || m.unit === filterUnit;
    return matchesSearch && matchesUnit;
  });

  const getStockColor = (item) => {
    if (item.stock <= 0) return 'text-red-500 bg-red-50 dark:bg-red-500/10';
    if (item.stock <= item.min_stock) return 'text-orange-500 bg-orange-50 dark:bg-orange-500/10';
    return 'text-green-600 bg-green-50 dark:bg-green-500/10';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Almoxarifado de Insumos</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Gestão ágil de matérias-primas e custos industriais.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={18} /> Novo Insumo
        </button>
      </div>

      {/* Filtros e Toggle */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar insumo (ex: Parafina)..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl text-sm dark:text-white outline-none"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
             <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm' : 'text-gray-400'}`} title="Vista de Lista"><TableIcon size={18} /></button>
             <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm' : 'text-gray-400'}`} title="Vista de Grade"><LayoutGrid size={18} /></button>
          </div>
          <div className="flex items-center gap-2 border-l border-gray-100 dark:border-white/10 pl-4">
            <Filter size={14} className="text-gray-400" />
            <select 
              value={filterUnit}
              onChange={e => setFilterUnit(e.target.value)}
              className="bg-transparent text-sm dark:text-gray-200 outline-none"
            >
              <option value="all">Todas Unid.</option>
              {UNITS.map(u => <option key={u.id} value={u.id}>{u.id.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 bg-white dark:bg-white/5 rounded-3xl animate-pulse" />)}
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="py-24 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 text-center">
           <FlaskConical size={48} className="mx-auto text-gray-300 mb-4" />
           <p className="text-gray-400 font-serif text-lg">Nenhum insumo encontrado</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMaterials.map(m => (
            <div key={m.id} className="bg-white dark:bg-[#1a0a05] border border-gray-100 dark:border-white/10 rounded-3xl p-6 shadow-sm group hover:shadow-xl transition-all duration-500">
               <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl ${m.name.toLowerCase().includes('parafina') ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-400'}`}>
                  {m.unit === 'kg' || m.unit === 'g' ? <Scale size={20} /> : m.unit === 'un' ? <Package size={20} /> : <Droplet size={20} />}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleOpenModal(m)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 hover:text-orange-500"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(m.id, m.name)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-serif text-brown dark:text-white mb-4 truncate">{m.name}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Estoque</p>
                    <p className={`text-xl font-mono font-bold ${getStockColor(m).split(' ')[0]}`}>
                      {Number(m.stock).toLocaleString()} <span className="text-xs">{m.unit}</span>
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                  <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">R$ {Number(m.unit_cost).toFixed(2)}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Custo Médio</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-200 dark:border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Insumo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Unid.</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Custo Unit.</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estoque Atual</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Mínimo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filteredMaterials.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] group transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-serif text-brown dark:text-white text-base">{m.name}</p>
                    {m.notes && <p className="text-[10px] text-gray-400 truncate max-w-xs">{m.notes}</p>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-gray-400">{m.unit.toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-1 group/edit relative max-w-[120px] mx-auto">
                        <span className="text-gray-300 font-mono text-xs">R$</span>
                        <input 
                          type="number" step="0.01" 
                          defaultValue={m.unit_cost}
                          onFocus={handleNumericFocus}
                          onBlur={(e) => handleInlineUpdate(m.id, 'unit_cost', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent border-none text-center font-mono font-bold text-gray-700 dark:text-gray-300 outline-none focus:bg-orange-50 dark:focus:bg-orange-500/10 rounded-lg p-1"
                        />
                     </div>
                  </td>
                  <td className={`px-6 py-4 text-center font-mono font-bold ${getStockColor(m).split(' ')[0]}`}>
                    {Number(m.stock).toLocaleString()} <span className="text-[10px] font-normal opacity-50">{m.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1 max-w-[100px] mx-auto">
                       <input 
                        type="number" step="0.1" 
                        defaultValue={m.min_stock}
                        onFocus={handleNumericFocus}
                        onBlur={(e) => handleInlineUpdate(m.id, 'min_stock', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-none text-center font-mono text-gray-500 dark:text-gray-400 outline-none focus:bg-orange-50 dark:focus:bg-orange-500/10 rounded-lg p-1"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(m)} className="p-2 text-gray-300 hover:text-orange-500 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(m.id, m.name)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150a06] rounded-[2.5rem] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-serif text-brown dark:text-white">{editingItem ? 'Editar Insumo' : 'Novo Insumo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">Nome do Insumo *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Parafina de Soja Eco" className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 dark:text-white outline-none transition-all shadow-inner" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">Unidade de Medida *</label>
                    <select required value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 dark:text-white outline-none appearance-none cursor-pointer shadow-inner">
                      {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">Custo Unitário Médio</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-mono text-sm group-focus-within:text-orange-500 transition-colors">R$</span>
                      <input 
                        type="number" step="0.001" 
                        onFocus={handleNumericFocus}
                        value={form.unit_cost} 
                        onChange={e => setForm({...form, unit_cost: e.target.value})} 
                        placeholder="0.00"
                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl pl-12 pr-4 py-4 dark:text-white outline-none font-mono shadow-inner" 
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">Estoque Inicial</label>
                    <div className="relative group">
                      <input 
                        type="number" step="0.001" 
                        onFocus={handleNumericFocus}
                        value={form.stock} 
                        onChange={e => setForm({...form, stock: e.target.value})} 
                        placeholder="0.000"
                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 dark:text-white outline-none font-mono shadow-inner pr-12" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 text-[10px] font-bold uppercase tracking-tighter opacity-50 group-focus-within:opacity-100 transition-opacity">
                        {UNITS.find(u => u.id === form.unit)?.id}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5 px-1">Alerta Mínimo</label>
                    <div className="relative group">
                      <input 
                        type="number" step="0.001" 
                        onFocus={handleNumericFocus}
                        value={form.min_stock} 
                        onChange={e => setForm({...form, min_stock: e.target.value})} 
                        placeholder="0.000"
                        className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-4 dark:text-white outline-none font-mono shadow-inner pr-12" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 text-[10px] font-bold uppercase tracking-tighter opacity-50 group-focus-within:opacity-100 transition-opacity">
                        {UNITS.find(u => u.id === form.unit)?.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2 px-1">Observações / Fornecedor</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Informações extras do insumo..." className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-2xl px-4 py-3 h-24 resize-none dark:text-white outline-none shadow-inner" />
                </div>

                <div className="flex items-center gap-3 bg-orange-50 dark:bg-orange-500/10 p-4 rounded-3xl border border-orange-100 dark:border-orange-500/20">
                   <Info size={18} className="text-orange-500 shrink-0" />
                   <p className="text-[10px] text-orange-700 dark:text-orange-400 font-bold uppercase leading-relaxed tracking-tight">
                     Dica: Mantenha o custo unitário atualizado para garantir que o CMV dos seus produtos no dashboard reflita a realidade industrial.
                   </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-[10px] flex items-center gap-2 font-bold uppercase tracking-widest">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
            </form>

            <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4 bg-gray-50/50 dark:bg-white/[0.01]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-white dark:hover:bg-white/5 transition-all">Cancelar</button>
              <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all">
                {saving ? 'Gravando...' : 'Salvar Insumo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
