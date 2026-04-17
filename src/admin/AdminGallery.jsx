import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import { Upload, X, CheckCircle, AlertCircle, ImagePlus, Trash2, RefreshCw, Pencil, Save } from 'lucide-react';
import DOMPurify from 'dompurify';

const ALLOWED_TYPES = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 3;
const CATEGORIES = [
  { id: 'all',    label: 'Todas' },
  { id: 'casa',   label: 'Para sua Casa' },
  { id: 'evento', label: 'Suas Celebrações' },
  { id: 'fe',     label: 'Para sua Fé' },
];

// ─── Modal de edição ───────────────────────────────────────────────────────────
function EditModal({ item, onClose, onSaved }) {
  const [name, setName]           = useState(item.name);
  const [category, setCategory]   = useState(item.category);
  const [imgCategory, setImgCategory] = useState(item.img_category || '');
  const [newFile, setNewFile]     = useState(null);
  const [preview, setPreview]     = useState(item.src);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState(null);
  const inputRef = useRef();

  const sanitize = (str) => DOMPurify.sanitize(str.trim(), { ALLOWED_TAGS: [] });

  const handleFile = (f) => {
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) { setError('Use WebP, PNG ou JPG.'); return; }
    if (f.size > 20 * 1024 * 1024) { setError('Arquivo ignorante! Tente algo menor que 20MB.'); return; }
    setNewFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('O nome é obrigatório.'); return; }
    setSaving(true);
    setError(null);

    try {
      let src = item.src;
      let storagePath = item.storage_path;

      if (newFile) {
        setCompressing(true);
        const options = { maxSizeMB: 3, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
        const compressedFile = await imageCompression(newFile, options);
        setCompressing(false);

        const ext = 'webp';
        const path = `gallery/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('gallery').upload(path, compressedFile, { cacheControl: '3600', upsert: false, contentType: 'image/webp' });
        if (upErr) throw new Error('Erro no upload: ' + upErr.message);

        if (storagePath && !storagePath.startsWith('local/')) {
          await supabase.storage.from('gallery').remove([storagePath]);
        }
        const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
        src = urlData.publicUrl;
        storagePath = path;
      }

      const { error: dbErr } = await supabase.from('gallery').update({
        name: sanitize(name), category, img_category: sanitize(imgCategory), src, storage_path: storagePath,
      }).eq('id', item.id);

      if (dbErr) throw new Error(dbErr.message);
      onSaved();
      onClose();
    } catch (err) {
      setError('Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-colors placeholder:text-gray-400";

  return (
    // Overlay
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-900 font-bold text-lg">Editar Foto</h3>
            <p className="text-gray-400 text-xs mt-0.5">Altere nome, categoria ou substitua a imagem</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Live Preview Card */}
          <div>
            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] block mb-3">Prévia em Tempo Real</label>
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 flex items-center justify-center">
              <div className="w-48 group relative rounded-[1.5rem] overflow-hidden aspect-[4/5] shadow-xl bg-white border border-wine/5">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f0602]/90 via-transparent to-transparent flex flex-col justify-end p-4">
                  <p className="text-gold text-[8px] uppercase font-bold tracking-[0.2em] mb-1">{imgCategory || 'Categoria'}</p>
                  <h3 className="text-white font-serif text-xs leading-tight">{name || 'Nome do Produto'}</h3>
                  <div className="h-0.5 bg-orange-500 w-8 mt-2 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="md:col-span-2">
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Nome do Produto *</label>
              <input value={name} onChange={e => { setName(e.target.value); setError(null); }} type="text" maxLength={100} placeholder="Ex: Vela Votiva Branca 298g" className={inputClass} />
            </div>

            {/* Subcategoria */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Linha / Detalhe</label>
              <input value={imgCategory} onChange={e => setImgCategory(e.target.value)} type="text" maxLength={60} placeholder="Ex: Linha Votiva" className={inputClass} />
            </div>

            {/* Aba */}
            <div>
              <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest block mb-1.5">Aba da Vitrine</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Troca de imagem */}
          <div
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-100 hover:border-orange-400/50 hover:bg-orange-50/10 cursor-pointer transition-all"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <Upload size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Substituir Imagem</p>
              <p className="text-[10px] text-gray-400">Clique para selecionar novo arquivo</p>
            </div>
            <input ref={inputRef} type="file" accept=".webp,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* Erro */}
          {error && (
            <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-3 bg-red-50 border border-red-200 text-red-700">
              <AlertCircle size={14} /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || compressing}
            className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors">
            {compressing ? <RefreshCw className="animate-spin" size={15} /> : <Save size={15} />}
            {compressing ? 'Comprimindo...' : (saving ? 'Salvando...' : 'Salvar Alterações')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────
export default function AdminGallery() {
  const [dragging, setDragging]       = useState(false);
  const [preview, setPreview]         = useState(null);
  const [file, setFile]               = useState(null);
  const [category, setCategory]       = useState('casa');
  const [name, setName]               = useState('');
  const [imgCategory, setImgCategory] = useState('');
  const [uploading, setUploading]     = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [message, setMessage]         = useState(null);
  const [gallery, setGallery]         = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const inputRef = useRef();

  const sanitize = (str) => DOMPurify.sanitize(str.trim(), { ALLOWED_TAGS: [] });

  useEffect(() => { loadGallery(); }, []);

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) { setMessage({ type: 'error', text: 'Formato inválido. Use: WebP, PNG ou JPG.' }); return false; }
    if (f.size > 20 * 1024 * 1024) { setMessage({ type: 'error', text: 'Arquivo muito grande. Máximo 20MB.' }); return false; }
    return true;
  };

  const handleFile = (f) => {
    if (!f || !validateFile(f)) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setMessage(null);
  };

  const loadGallery = async () => {
    setLoadingGallery(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setGallery(data || []);
    setLoadingGallery(false);
  };

  const handleUpload = async () => {
    if (!file || !name) { setMessage({ type: 'error', text: 'Preencha o nome e selecione uma imagem.' }); return; }
    setCompressing(true);
    
    try {
      const options = { maxSizeMB: 3, maxWidthOrHeight: 1920, useWebWorker: true, fileType: 'image/webp' };
      const compressedFile = await imageCompression(file, options);
      
      setCompressing(false);
      setUploading(true);
      
      const ext = 'webp';
      const path = `gallery/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('gallery').upload(path, compressedFile, { cacheControl: '3600', upsert: false, contentType: 'image/webp' });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
    await supabase.from('gallery').insert({ 
      name: sanitize(name), 
      category, 
      img_category: sanitize(imgCategory), 
      src: urlData.publicUrl, 
      storage_path: path 
    });
    setMessage({ type: 'success', text: 'Imagem publicada com sucesso!' });
      setName(''); setImgCategory('');
      setUploading(false);
      loadGallery();
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro no processo: ' + err.message });
      setUploading(false);
      setCompressing(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Remover "${item.name}" da vitrine?`)) return;
    if (item.storage_path && !item.storage_path.startsWith('local/')) {
      await supabase.storage.from('gallery').remove([item.storage_path]);
    }
    await supabase.from('gallery').delete().eq('id', item.id);
    setGallery(prev => prev.filter(g => g.id !== item.id));
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-colors placeholder:text-gray-400";

  return (
    <>
      {/* Modal de edição */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={loadGallery}
        />
      )}

      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-1">Galeria de Produtos</h2>
          <p className="text-gray-500 dark:text-white/40 text-sm">Gerencie, edite ou adicione fotos à vitrine do site.</p>
        </div>

        {/* Upload + Form */}
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
          <h3 className="text-gray-700 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
            <ImagePlus size={16} className="text-orange-500" /> Nova Foto
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Drop zone */}
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  dragging ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 bg-gray-50'
                }`}
              >
                <input ref={inputRef} type="file" accept=".webp,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFile(e.target.files[0])} />
                <Upload className="mx-auto mb-3 text-gray-400" size={36} />
                <p className="text-gray-700 text-sm font-bold">Arraste e solte aqui</p>
                <p className="text-gray-400 text-xs mt-1">ou <span className="text-orange-500 underline">clique para selecionar</span></p>
                <p className="text-gray-400 text-xs mt-3 font-mono">WebP · PNG · JPG · Máx {MAX_SIZE_MB}MB</p>
              </div>
              {preview && (
                <div className="mt-4 relative rounded-2xl overflow-hidden border border-gray-200">
                  <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                  <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors"><X size={14} /></button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs font-bold">{file?.name}</p>
                    <p className="text-white/60 text-xs">{(file?.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Nome do Produto *</label>
                <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Vela Votiva Branca" className={inputClass} />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Subcategoria</label>
                <input value={imgCategory} onChange={e => setImgCategory(e.target.value)} type="text" placeholder="Ex: Linha Votiva, Atacado B2B" className={inputClass} />
              </div>
              <div>
                <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Aba da Vitrine</label>
                <select value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>

              {message && (
                <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                  {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />} {message.text}
                </div>
              )}

              <button onClick={handleUpload} disabled={uploading || compressing || !file}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                {(uploading || compressing) ? <RefreshCw className="animate-spin" size={16} /> : <ImagePlus size={16} />}
                {compressing ? 'Comprimindo...' : (uploading ? 'Enviando...' : 'Publicar na Vitrine')}
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setFilterCat(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterCat === c.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600'
                  }`}>
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 dark:text-white/30 text-xs">
                {filterCat === 'all' ? gallery.length : gallery.filter(g => g.category === filterCat).length} foto(s)
              </span>
              <button onClick={loadGallery} className="text-gray-400 hover:text-orange-500 transition-colors" title="Recarregar">
                <RefreshCw size={16} className={loadingGallery ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {loadingGallery && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-36" />)}
            </div>
          )}

          {!loadingGallery && gallery.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
              <ImagePlus className="mx-auto mb-3 text-gray-300" size={32} />
              <p className="text-gray-400 text-sm font-medium">Nenhuma foto publicada ainda</p>
            </div>
          )}

          {!loadingGallery && gallery.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {gallery.filter(g => filterCat === 'all' || g.category === filterCat).map(item => (
                <div key={item.id} className="relative group rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 shadow-sm hover:shadow-xl transition-all duration-500">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={item.src} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>

                  {/* Hover overlay com botões */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                    <button
                      onClick={() => setEditingItem(item)}
                      title="Editar"
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-xl"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      title="Remover"
                      className="bg-white text-gray-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Info Panel subtle */}
                  <div className="p-5 border-t border-gray-50 dark:border-white/5">
                    <p className="text-gray-900 dark:text-white text-sm font-bold truncate mb-1">{item.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">
                         {CATEGORIES.find(c => c.id === item.category)?.label || item.category}
                       </span>
                       {item.img_category && (
                         <>
                           <span className="w-1 h-1 bg-gray-300 rounded-full" />
                           <span className="text-[10px] text-gray-400 dark:text-white/20 uppercase tracking-widest truncate max-w-[80px]">
                             {item.img_category}
                           </span>
                         </>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
