import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import { Plus, Trash2, Edit2, Save, X, Package, Search, Filter, ImagePlus, Upload, AlertCircle, ShoppingCart, RefreshCw } from 'lucide-react';
import DOMPurify from 'dompurify';

const ALLOWED_TYPES = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock: '',
    is_active: true,
    images: []
  });
  
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  
  const fileInputRef = useRef();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);
    
    if (prodRes.data) setProducts(prodRes.data);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        name: item.name,
        category_id: item.category_id || '',
        description: item.description || '',
        price: item.price.toString(),
        stock: item.stock?.toString() || '0',
        is_active: item.is_active,
        images: item.images || []
      });
    } else {
      setEditingItem(null);
      setForm({
        name: '',
        category_id: categories[0]?.id || '',
        description: '',
        price: '',
        stock: '0',
        is_active: true,
        images: []
      });
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!ALLOWED_TYPES.includes(file.type)) { setError('Use WebP, PNG ou JPG.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('Arquivo ignorante! Tente algo menor que 20MB.'); return; }
    
    setCompressing(true);
    setError(null);
    
    try {
      // Motor de Compressão Vittalix
      const options = {
        maxSizeMB: 3,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp' // Converte para o formato mais leve do mercado
      };

      const compressedFile = await imageCompression(file, options);
      
      setCompressing(false);
      setUploading(true);
      
      const ext = 'webp';
      const path = `products/${Date.now()}.${ext}`;
      
      const { error: upErr } = await supabase.storage
        .from('gallery').upload(path, compressedFile);
        
      if (upErr) throw upErr;
      
      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
      setForm(prev => ({ ...prev, images: [...prev.images, urlData.publicUrl] }));
    } catch (err) {
      setError('Erro no processo: ' + err.message);
    } finally {
      setCompressing(false);
      setUploading(false);
    }
  };

  const handleQuickAddCategory = async () => {
    const name = prompt('Nome da nova categoria:');
    if (!name) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: name.trim(), slug: name.trim().toLowerCase().replace(/\s+/g, '-') }])
      .select()
      .single();
      
    if (error) {
      alert('Erro ao criar categoria: ' + error.message);
    } else {
      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setForm(prev => ({ ...prev, category_id: data.id }));
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) {
      setError('Preencha Nome, Preço e Categoria.');
      return;
    }

    setLoading(true);
    const sanitize = (s) => DOMPurify.sanitize(s.trim());
    
    const payload = {
      name: sanitize(form.name),
      category_id: form.category_id,
      description: sanitize(form.description),
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      is_active: form.is_active,
      images: form.images
    };

    let res;
    if (editingItem) {
      res = await supabase.from('products').update(payload).eq('id', editingItem.id);
    } else {
      res = await supabase.from('products').insert([payload]);
    }

    if (res.error) {
      setError('Erro ao salvar: ' + res.error.message);
      setLoading(false);
    } else {
      setIsModalOpen(false);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este produto permanentemente?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) fetchData();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = filterCat === 'all' || p.category_id === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white">Gestão de Produtos</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Controle estoque, preços e a vitrine de vendas.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-lg shadow-orange-500/20 text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/10">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por nome..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl text-sm dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select 
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-2 text-sm dark:text-gray-200"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white dark:bg-[#1a0a05] border border-gray-100 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-all duration-500">
            <div className="aspect-square relative overflow-hidden bg-gray-50">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Package size={48} />
                </div>
              )}
              <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleOpenModal(p)} className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-gray-700 hover:text-orange-500"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 bg-white/90 backdrop-blur shadow-lg rounded-full text-gray-700 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
              {!p.is_active && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-gray-800 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">Inativo</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">{p.categories?.name}</span>
                <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">R$ {p.price.toFixed(2)}</span>
              </div>
              <h3 className="font-serif text-brown dark:text-white mb-2 truncate">{p.name}</h3>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                <div className="flex items-center gap-1.5">
                  <Package size={12} className="text-gray-400" />
                  <span className="text-[10px] text-gray-500 uppercase font-bold">{p.stock} em estoque</span>
                </div>
                {p.is_active && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#150a06] rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-serif text-brown dark:text-white">{editingItem ? 'Editar Produto' : 'Novo Produto'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-400"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Nome do Produto *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white" />
                </div>
                
                <div>
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Categoria *</label>
                  <div className="flex gap-2">
                    <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="flex-1 bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white">
                      <option value="">Selecione...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button 
                      type="button"
                      onClick={handleQuickAddCategory}
                      className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20"
                      title="Criar nova categoria"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Preço (R$) *</label>
                    <input required type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Estoque</label>
                    <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 dark:text-white" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Imagens</label>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {form.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setForm({...form, images: form.images.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"><X size={12} /></button>
                      </div>
                    ))}
                    {form.images.length < 5 && (
                      <button type="button" disabled={uploading || compressing} onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-orange-400 transition-colors relative overflow-hidden">
                        {(uploading || compressing) ? (
                          <div className="flex flex-col items-center gap-1">
                            <RefreshCw className="animate-spin text-orange-500" size={24} />
                            <span className="text-[8px] font-bold uppercase text-orange-600">
                              {compressing ? 'Comprimindo...' : 'Subindo...'}
                            </span>
                          </div>
                        ) : (
                          <>
                            <Upload size={20} />
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold tracking-tighter px-2 text-center">
                              Add Foto
                            </p>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Ajuda Categoria */}
                  <div className="md:col-span-2 bg-orange-50 dark:bg-orange-500/10 p-3 rounded-xl border border-orange-100 dark:border-orange-500/20 text-[10px] text-orange-700 dark:text-orange-400 font-bold uppercase tracking-wider">
                    Dica: Se a categoria desejada não aparecer na lista, salve este produto como rascunho e cadastre a categoria no menu "Categorias" do painel lateral.
                  </div>
                  
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest block mb-2">Descrição</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-transparent focus:border-orange-500 rounded-xl px-4 py-3 h-24 resize-none dark:text-white" />
                </div>
                
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} className="w-4 h-4 rounded text-orange-500" />
                  <label htmlFor="active" className="text-xs font-bold text-gray-500 uppercase tracking-widest">Produto Ativo na Vitrine</label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </form>

            <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-gray-200 rounded-2xl text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50">Cancelar</button>
              <button type="button" onClick={handleSave} disabled={loading && !isModalOpen} className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
