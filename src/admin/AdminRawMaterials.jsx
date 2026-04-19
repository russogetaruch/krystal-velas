import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  FlaskConical, Plus, Edit2, Trash2, X, AlertCircle, 
  Search, Filter, Scale, Droplet, Package, Info, ArrowUpRight
} from 'lucide-react';
import { logAudit } from './adminUtils';

const EMPTY_FORM = { 
  name: '', 
  unit: 'kg', 
  stock: 0, 
  min_stock: 0, 
  unit_cost: 0, 
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
      setForm({ ...item });
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
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('raw_materials')
          .update(form)
          .eq('id', editingItem.id);
        if (error) throw error;
        await logAudit(session, 'RAW_MATERIAL_UPDATE', { name: form.name, id: editingItem.id });
      } else {
        const { error } = await supabase
          .from('raw_materials')
          .insert([form]);
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
          <p className="text-gray-500 dark:text-white/40 text-sm">Gestão de matérias-primas, parafinas e essências.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={18} /> Novo Insumo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
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
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select 
            value={filterUnit}
            onChange={e => setFilterUnit(e.target.value)}
            className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-2 text-sm dark:text-gray-200 outline-none"
          >
            <option value="all">Todas Unidades</option>
            {UNITS.map(u => <option key={u.id} value={u.id}>{u.id.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de Insumos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-48 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl animate-pulse" />)
        ) : filteredMaterials.length === 0 ? (
          <div className="col-span-full py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 text-center">
             <FlaskConical size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-400 font-serif text-lg">Nenhum insumo encontrado</p>
             <button onClick={() => handleOpenModal()} className="mt-4 text-orange-500 text-xs font-bold uppercase tracking-widest hover:underline">+ Cadastrar primeiro insumo</button>
          </div>
        ) : filteredMaterials.map(m => (
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

            <h3 className="font-serif text-brown dark:text-white mb-4 truncate" title={m.name}>{m.name}</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Estoque Disponível</p>
                  <p className={`text-xl font-mono font-bold ${getStockColor(m).split(' ')[0]}`}>
                    {Number(m.stock).toLocaleString()} <span className="text-xs">{m.unit}</span>
                  </p>
                </div>
                {m.stock <= m.min_stock && (
                  <div className="bg-red-50 text-red-500 p-1.5 rounded-lg animate-pulse">
                    <AlertCircle size={14} />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Custo Médio</p>
                  <p className="text-xs font-mono font-bold text-gray-600 dark:text-gray-300">R$ {Number(m.unit_cost).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Mínimo</p>
                  <p className="text-xs font-mono text-gray-500">{Number(m.min_stock)} {m.unit}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Nome do Insumo *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Parafina de Soja Eco" className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Unidade de Medida *</label>
                    <select required value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none">
                      {UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Custo Unitário Médio (R$)</label>
                    <input type="number" step="0.001" value={form.unit_cost} onChange={e => setForm({...form, unit_cost: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Estoque Inicial</label>
                    <input type="number" step="0.001" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Estoque Mínimo (Alerta)</label>
                    <input type="number" step="0.001" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Observações / Fornecedor</label>
                  <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Informações extras..." className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 h-24 resize-none dark:text-white outline-none" />
                </div>

                <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20">
                   <Info size={16} className="text-blue-500 shrink-0" />
                   <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase leading-tight">
                     Dica: Use gramas (g) ou mililitros (ml) para insumos de precisão como fragrâncias e pavios finos.
                   </p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2 font-bold uppercase">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </form>

            <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
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
