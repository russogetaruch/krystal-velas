import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  ArrowUpRight, ArrowDownRight, RotateCcw, X,
  Plus, AlertCircle, Package, TrendingDown, TrendingUp, DollarSign, Calculator
} from 'lucide-react';
import { logAudit } from './adminUtils';
import AdminProductionCalculator from './AdminProductionCalculator';

const TYPE_CONFIG = {
  entrada      : { label: 'Entrada',      color: 'text-green-600 bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20', icon: ArrowUpRight },
  saida        : { label: 'Saída',        color: 'text-red-600 bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20',           icon: ArrowDownRight },
  ajuste       : { label: 'Ajuste',       color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',       icon: RotateCcw },
  cancelamento : { label: 'Devolução',    color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20', icon: RotateCcw },
};

const EMPTY_FORM = { product_id: '', supplier_id: '', type: 'entrada', quantity: '', unit_cost: '', notes: '' };

export default function AdminInventory({ session }) {
  const [logs,      setLogs]      = useState([]);
  const [products,  setProducts]  = useState([]);
  const [materials, setMaterials] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeTab, setActiveTab] = useState('produtos'); // 'produtos' | 'insumos'
  const [loading,   setLoading]   = useState(true);
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterType,    setFilterType]    = useState('all');
  const [isModalOpen,   setIsModalOpen]   = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [modalMode,     setModalMode]     = useState('entrada');
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [logsRes, prodsRes, suppRes] = await Promise.all([
        supabase
          .from('inventory_logs')
          .select('*, products(name, stock, unit_cost), raw_materials(name, stock, unit_cost, unit), suppliers(name)')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('products').select('id, name, stock, unit_cost').order('name'),
        supabase.from('raw_materials').select('id, name, stock, unit_cost, unit').order('name'),
        supabase.from('suppliers').select('id, name').eq('is_active', true).order('name'),
      ]);
      setLogs(logsRes.data || []);
      setProducts(prodsRes.data || []);
      setMaterials(matRes.data || []);
      setSuppliers(suppRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── Stats ────────────────────────────────────────────────────────
  // ── Stats ────────────────────────────────────────────────────────
  const currentLogs = logs.filter(l => activeTab === 'produtos' ? l.product_id : l.raw_material_id);
  const totalEntradas = currentLogs.filter(l => l.type === 'entrada').reduce((s, l) => s + Math.abs(l.quantity), 0);
  const totalSaidas   = currentLogs.filter(l => l.type === 'saida').reduce((s, l) => s + Math.abs(l.quantity), 0);
  const cmv           = currentLogs
    .filter(l => l.type === 'saida' && l.unit_cost)
    .reduce((s, l) => s + Math.abs(l.quantity) * l.unit_cost, 0);

  // ── Filtered list ────────────────────────────────────────────────
  const filteredLogs = currentLogs.filter(l => {
    const matchId = filterProduct === 'all' || 
                   (activeTab === 'produtos' ? l.product_id === filterProduct : l.raw_material_id === filterProduct);
    const matchType = filterType    === 'all' || l.type       === filterType;
    return matchId && matchType;
  });

  // ── Modal ────────────────────────────────────────────────────────
  const openModal = (mode) => {
    setModalMode(mode);
    setForm({
      ...EMPTY_FORM,
      product_id : products[0]?.id || '',
      type       : mode === 'ajuste' ? 'ajuste' : 'entrada',
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.product_id || !form.quantity) {
      setError('Produto e quantidade são obrigatórios.');
      return;
    }
    setSaving(true);
    setError(null);

    const rawQty  = parseInt(form.quantity);
    // saída e ajustes negativos ficam negativos; entradas e devoluções positivos
    const finalQty = (form.type === 'saida') ? -Math.abs(rawQty) : rawQty;

    try {
      // 1. Registra movimentação
      const { error: logErr } = await supabase.from('inventory_logs').insert({
        product_id  : form.product_id,
        supplier_id : form.supplier_id || null,
        type        : form.type,
        quantity    : finalQty,
        unit_cost   : form.unit_cost ? parseFloat(form.unit_cost) : null,
        notes       : form.notes || null,
        created_by  : session?.user?.id,
      });
      if (logErr) throw logErr;

      // 2. Atualiza estoque do produto (para entradas e ajustes manuais)
      if (form.type !== 'saida') {
        const product = products.find(p => p.id === form.product_id);
        if (product) {
          const newStock = Math.max(0, product.stock + finalQty);
          const updatePayload = { stock: newStock };
          // Atualiza custo unitário se informado (para entradas com novo custo)
          if (form.unit_cost && form.type === 'entrada') {
            updatePayload.unit_cost = parseFloat(form.unit_cost);
          }
          await supabase.from('products').update(updatePayload).eq('id', form.product_id);
        }
      }

      await logAudit(session, `INVENTORY_${form.type.toUpperCase()}`, {
        product_id : form.product_id,
        quantity   : finalQty,
      });

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Tabs de Separação */}
      <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => { setActiveTab('produtos'); setFilterProduct('all'); }}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'produtos' ? 'bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm' : 'text-gray-400'}`}
        >
          Produtos Acabados
        </button>
        <button 
          onClick={() => { setActiveTab('insumos'); setFilterProduct('all'); }}
          className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'insumos' ? 'bg-white dark:bg-orange-500 text-orange-600 dark:text-white shadow-sm' : 'text-gray-400'}`}
        >
          Almoxarifado (Insumos)
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Gestão de Estoque</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Rastreio de movimentações e base de cálculo do CMV.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="bg-brown dark:bg-white/10 text-white dark:text-white py-3 px-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black dark:hover:bg-white/20 transition-all flex items-center gap-2 shadow-lg shadow-brown/20"
          >
            <Calculator size={16} /> Calculadora de Custos
          </button>
          <button
            onClick={() => openModal('ajuste')}
            className="border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 py-3 px-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center gap-2"
          >
            <RotateCcw size={15} /> Ajuste
          </button>
          <button
            onClick={() => openModal('entrada')}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
          >
            <Plus size={16} /> Nova Entrada
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center">
            <TrendingUp size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Entradas</p>
            <p className="text-3xl font-serif text-green-600">+{totalEntradas}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center">
            <TrendingDown size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Saídas</p>
            <p className="text-3xl font-serif text-red-500">-{totalSaidas}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center">
            <DollarSign size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">CMV Acumulado</p>
            <p className="text-2xl font-serif text-brown dark:text-white">R$ {cmv.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
        <select
          value={filterProduct}
          onChange={e => setFilterProduct(e.target.value)}
          className="flex-1 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm dark:text-white outline-none"
        >
          <option value="all">Todos os {activeTab === 'produtos' ? 'Produtos' : 'Insumos'}</option>
          {activeTab === 'produtos' ? products.map(p => (
            <option key={p.id} value={p.id}>{p.name} (estoque: {p.stock})</option>
          )) : materials.map(m => (
            <option key={m.id} value={m.id}>{m.name} (estoque: {m.stock} {m.unit})</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm dark:text-white outline-none"
        >
          <option value="all">Todos os Tipos</option>
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
          <option value="ajuste">Ajuste</option>
          <option value="cancelamento">Devolução</option>
        </select>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                {['Produto', 'Tipo', 'Qtd', 'Custo Unit.', 'Fornecedor / Pedido', 'Data', 'Obs.'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="7" className="py-20 text-center text-gray-400 dark:text-white/20 animate-pulse">Carregando movimentações...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <Package size={40} className="mx-auto mb-3 text-gray-200 dark:text-white/10" />
                    <p className="text-gray-400 dark:text-white/20">Nenhuma movimentação registrada.</p>
                  </td>
                </tr>
              ) : filteredLogs.map(log => {
                const cfg  = TYPE_CONFIG[log.type] || TYPE_CONFIG.ajuste;
                const Icon = cfg.icon;
                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {activeTab === 'produtos' ? log.products?.name : log.raw_materials?.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold text-sm ${log.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {log.quantity > 0 ? '+' : ''}{log.quantity}
                        <span className="text-[10px] ml-1 opacity-50">
                          {activeTab === 'produtos' ? 'un' : log.raw_materials?.unit}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-gray-300 font-mono text-xs">
                        {log.unit_cost ? `R$ ${parseFloat(log.unit_cost).toFixed(2)}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 dark:text-white/40">{log.suppliers?.name || '—'}</p>
                      {log.order_id && (
                        <p className="text-[10px] text-orange-500 font-mono">Pedido #{log.order_id.slice(0, 8)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 dark:text-white/30 text-xs">
                        {new Date(log.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400 dark:text-white/30 text-xs">{log.notes || '—'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Entrada / Ajuste */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150a06] rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-serif text-brown dark:text-white">
                {modalMode === 'entrada' ? 'Nova Entrada de Estoque' : 'Ajuste Manual de Estoque'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div>
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Produto *</label>
                <select
                  value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (atual: {p.stock} un.)</option>
                  ))}
                </select>
              </div>

              {modalMode === 'ajuste' && (
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Tipo</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none"
                  >
                    <option value="ajuste">Ajuste (positivo ou negativo)</option>
                    <option value="cancelamento">Devolução / Cancelamento</option>
                  </select>
                </div>
              )}

              {modalMode === 'entrada' && (
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Fornecedor</label>
                  <select
                    value={form.supplier_id}
                    onChange={e => setForm({ ...form, supplier_id: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none"
                  >
                    <option value="">Sem fornecedor</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">
                    Quantidade *
                    {modalMode === 'ajuste' && <span className="text-orange-500 ml-1">(- para diminuir)</span>}
                  </label>
                  <input
                    type="number"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Custo Unit. (R$)</label>
                  <input
                    type="number" step="0.01"
                    value={form.unit_cost}
                    onChange={e => setForm({ ...form, unit_cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Ex: Lote 202504, NF 1234..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white h-20 resize-none outline-none"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave} disabled={saving}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-green-600/20 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Calculadora de Produção */}
      {isCalculatorOpen && (
        <AdminProductionCalculator 
          session={session} 
          onClose={() => setIsCalculatorOpen(false)} 
        />
      )}
    </div>
  );
}
