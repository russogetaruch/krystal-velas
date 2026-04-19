import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Factory, Plus, Info, Check, X, RefreshCw, 
  Settings, Play, Package, Activity, AlertCircle, TrendingUp, DollarSign
} from 'lucide-react';

export default function AdminProduction({ session }) {
  const [activeTab, setActiveTab] = useState('composicoes'); // 'composicoes' | 'historico'
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [compositions, setCompositions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('recipe'); // 'recipe' | 'production'
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Recipe Form
  const [recipeItems, setRecipeItems] = useState([]);
  // Production Form
  const [prodQty, setProdQty] = useState(1);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [pRes, mRes, cRes, lRes] = await Promise.all([
        supabase.from('products').select('id, name, stock').order('name'),
        supabase.from('raw_materials').select('id, name, unit, unit_cost, stock'),
        supabase.from('product_composition').select('*'),
        supabase.from('production_logs').select('*, products(name)').order('created_at', { ascending: false }).limit(50)
      ]);
      
      setProducts(pRes.data || []);
      setMaterials(mRes.data || []);
      setCompositions(cRes.data || []);
      setLogs(lRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ── Recipe Logic ──────────────────────────────────────────────
  const openRecipeModal = (prod) => {
    setSelectedProduct(prod);
    const existing = compositions.filter(c => c.product_id === prod.id);
    setRecipeItems(existing.length > 0 ? existing.map(e => ({ material_id: e.raw_material_id, quantity: e.quantity })) : [{ material_id: '', quantity: '' }]);
    setModalMode('recipe');
    setIsModalOpen(true);
    setError(null);
  };

  const addRecipeItem = () => setRecipeItems([...recipeItems, { material_id: '', quantity: '' }]);
  const removeRecipeItem = (idx) => setRecipeItems(recipeItems.filter((_, i) => i !== idx));

  const saveRecipe = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Limpa composição antiga
      await supabase.from('product_composition').delete().eq('product_id', selectedProduct.id);
      
      // 2. Insere nova
      const toInsert = recipeItems
        .filter(i => i.material_id && i.quantity > 0)
        .map(i => ({ 
          product_id: selectedProduct.id, 
          raw_material_id: i.material_id, 
          quantity: parseFloat(i.quantity) 
        }));
        
      if (toInsert.length > 0) {
        const { error } = await supabase.from('product_composition').insert(toInsert);
        if (error) throw error;
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Production Logic ──────────────────────────────────────────
  const openProductionModal = (prod) => {
    setSelectedProduct(prod);
    setProdQty(1);
    setModalMode('production');
    setIsModalOpen(true);
    setError(null);
  };

  const calculateProductionCost = (prodId, qty) => {
    const items = compositions.filter(c => c.product_id === prodId);
    return items.reduce((acc, item) => {
      const material = materials.find(m => m.id === item.raw_material_id);
      return acc + (item.quantity * qty * (material?.unit_cost || 0));
    }, 0);
  };

  const runProduction = async () => {
    setSaving(true);
    setError(null);
    try {
      const unitCost = calculateProductionCost(selectedProduct.id, 1);
      
      const { error } = await supabase.rpc('execute_production', {
        p_product_id : selectedProduct.id,
        p_quantity   : parseInt(prodQty),
        p_user_id    : session?.user?.id,
        p_unit_cost  : unitCost
      });
      
      if (error) throw error;
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError('Falha na produção: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNumericFocus = (e) => e.target.select();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Centro de Produção Industrial</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Controle de receitas (BOM) e ordens de fabricação.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5">
        <button onClick={() => setActiveTab('composicoes')} className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'composicoes' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>Fichas Técnicas</button>
        <button onClick={() => setActiveTab('historico')} className={`px-8 py-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'historico' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-600'}`}>Histórico de Produção</button>
      </div>

      {activeTab === 'composicoes' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1,2,3].map(i => <div key={i} className="h-60 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl animate-pulse" />)
          ) : products.map(p => {
            const recipe = compositions.filter(c => c.product_id === p.id);
            const totalCost = recipe.reduce((acc, r) => {
              const mat = materials.find(m => m.id === r.raw_material_id);
              return acc + (r.quantity * (mat?.unit_cost || 0));
            }, 0);

            return (
              <div key={p.id} className="bg-white dark:bg-[#1a0a05] border border-gray-100 dark:border-white/10 rounded-[2.5rem] p-8 shadow-sm flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                    <Package size={22} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openRecipeModal(p)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all" title="Editar Receita"><Settings size={18} /></button>
                  </div>
                </div>

                <h3 className="font-serif text-lg text-brown dark:text-white mb-2">{p.name}</h3>
                
                <div className="flex-1 space-y-4">
                  {recipe.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Composição (BOM)</p>
                      {recipe.slice(0, 3).map(r => {
                        const mat = materials.find(m => m.id === r.raw_material_id);
                        return (
                          <div key={r.id} className="flex justify-between items-center text-[10px] text-gray-500 dark:text-white/40">
                             <span>{mat?.name}</span>
                             <span className="font-mono">{Number(r.quantity)} {mat?.unit}</span>
                          </div>
                        );
                      })}
                      {recipe.length > 3 && <p className="text-[8px] text-orange-500 font-bold">+{recipe.length - 3} itens...</p>}
                    </div>
                  ) : (
                    <div className="py-4 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                      <p className="text-[10px] text-gray-300 uppercase font-bold">Sem Ficha Técnica</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                   <div>
                     <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Custo Produção</p>
                     <p className="text-sm font-mono font-bold text-brown dark:text-white">R$ {totalCost.toFixed(2)}</p>
                   </div>
                   <button 
                     disabled={recipe.length === 0}
                     onClick={() => openProductionModal(p)}
                     className="bg-orange-500 hover:bg-orange-600 disabled:opacity-20 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                   >
                     <Play size={12} fill="currentColor" /> Produzir
                   </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Histórico de Produção */
        <div className="bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                {['Data', 'Produto acabado', 'Quantidade', 'Custo Unit.', 'Custo Total'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
               {logs.map(log => (
                 <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                   <td className="px-6 py-4 text-gray-400 text-xs">{new Date(log.created_at).toLocaleString('pt-BR')}</td>
                   <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{log.products?.name}</td>
                   <td className="px-6 py-4 font-mono font-bold text-orange-500">+{log.quantity_produced} un.</td>
                   <td className="px-6 py-4 text-xs font-mono">R$ {Number(log.unit_cost_at_prod).toFixed(2)}</td>
                   <td className="px-6 py-4 text-xs font-mono font-bold">R$ {(log.quantity_produced * log.unit_cost_at_prod).toFixed(2)}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modais */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150a06] rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-serif text-brown dark:text-white">
                {modalMode === 'recipe' ? `Ficha Técnica: ${selectedProduct?.name}` : `Produzir: ${selectedProduct?.name}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {modalMode === 'recipe' ? (
                /* Edit Recipe */
                <div className="space-y-4">
                  {recipeItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1.5">Insumo</label>
                        <select 
                          value={item.material_id} 
                          onChange={e => {
                            const newItems = [...recipeItems];
                            newItems[idx].material_id = e.target.value;
                            setRecipeItems(newItems);
                          }}
                          className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 dark:text-white"
                        >
                          <option value="">Selecione...</option>
                          {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                        </select>
                      </div>
                      <div className="w-32 relative">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1.5">Quantidade</label>
                        <div className="relative group">
                          <input 
                            type="number" step="0.001" 
                            onFocus={handleNumericFocus}
                            value={item.quantity} 
                            onChange={e => {
                              const newItems = [...recipeItems];
                              newItems[idx].quantity = e.target.value;
                              setRecipeItems(newItems);
                            }}
                            className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-xl px-4 py-3 dark:text-white outline-none pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-orange-500 font-bold uppercase opacity-50 select-none">
                            {materials.find(m => m.id === item.material_id)?.unit}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => removeRecipeItem(idx)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"><X size={18} /></button>
                    </div>
                  ))}
                  <button onClick={addRecipeItem} className="w-full py-3 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:border-orange-200 hover:text-orange-500 transition-all">+ Adicionar Insumo</button>
                </div>
              ) : (
                /* Production Launch */
                <div className="space-y-8">
                   <div className="bg-orange-50 dark:bg-orange-500/10 p-6 rounded-3xl border border-orange-100 dark:border-orange-500/20 text-center">
                      <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold uppercase tracking-[0.2em] mb-4 text-center">Comando de Fabricação</p>
                      <div className="flex items-center justify-center gap-8">
                         <button 
                           onClick={() => setProdQty(Math.max(1, prodQty - 1))}
                           className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"
                         >-</button>
                         <input 
                           type="number" 
                           value={prodQty} 
                           onFocus={handleNumericFocus}
                           onChange={e => setProdQty(Math.max(1, parseInt(e.target.value) || 1))}
                           className="bg-transparent text-5xl font-serif text-brown dark:text-white text-center w-24 outline-none" 
                         />
                         <button 
                           onClick={() => setProdQty(prodQty + 1)}
                           className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl shadow-sm flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"
                         >+</button>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400/60 mt-4 uppercase font-bold tracking-widest">Unidades de {selectedProduct?.name}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Custo Estimado</p>
                        <p className="text-xl font-mono font-bold text-brown dark:text-white">R$ {calculateProductionCost(selectedProduct.id, prodQty).toFixed(2)}</p>
                      </div>
                      <div className="p-5 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Novo Estoque</p>
                        <p className="text-xl font-mono font-bold text-green-600">{(selectedProduct.stock || 0) + prodQty} un.</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">Materiais que serão consumidos:</p>
                      {compositions.filter(c => c.product_id === selectedProduct.id).map(c => {
                        const mat = materials.find(m => m.id === c.raw_material_id);
                        const totalReq = c.quantity * prodQty;
                        const hasStock = mat ? mat.stock >= totalReq : false;
                        return (
                          <div key={c.id} className="flex justify-between items-center p-3 px-4 bg-white dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 text-xs">
                             <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${hasStock ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                               <span className="font-bold text-gray-700 dark:text-gray-300">{mat?.name}</span>
                             </div>
                             <span className={`font-mono ${hasStock ? 'text-gray-500' : 'text-red-500 font-bold'}`}>
                               -{Number(totalReq).toLocaleString()} {mat?.unit}
                             </span>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}

              {error && <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs flex items-center gap-2"><AlertCircle size={14} /> {error}</div>}
            </div>

            <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50">Sair</button>
              <button 
                type="button" 
                onClick={modalMode === 'recipe' ? saveRecipe : runProduction} 
                disabled={saving} 
                className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                {saving ? 'Processando...' : modalMode === 'recipe' ? 'Salvar Receita' : 'Iniciar Produção'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
