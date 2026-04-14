import { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, CheckCircle, AlertCircle, ImagePlus, Trash2, RefreshCw } from 'lucide-react';

const ALLOWED_TYPES = ['image/webp', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 3;
const CATEGORIES = [
  { id: 'casa', label: 'Para sua Casa' },
  { id: 'evento', label: 'Suas Celebrações' },
  { id: 'fe', label: 'Para sua Fé' },
];

export default function AdminGallery() {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('casa');
  const [name, setName] = useState('');
  const [imgCategory, setImgCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const inputRef = useRef();

  useEffect(() => { loadGallery(); }, []);

  const validateFile = (f) => {
    if (!ALLOWED_TYPES.includes(f.type)) {
      setMessage({ type: 'error', text: 'Formato inválido. Use: WebP, PNG ou JPG.' });
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setMessage({ type: 'error', text: `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB.` });
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!f || !validateFile(f)) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setMessage(null);
  };

  const loadGallery = async () => {
    setLoadingGallery(true);
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setGallery(data || []);
    setLoadingGallery(false);
  };

  const handleUpload = async () => {
    if (!file || !name) {
      setMessage({ type: 'error', text: 'Preencha o nome e selecione uma imagem.' });
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `gallery/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage.from('gallery').upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type,
    });

    if (uploadErr) {
      setMessage({ type: 'error', text: 'Erro no upload: ' + uploadErr.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);
    await supabase.from('gallery').insert({
      name, category, img_category: imgCategory, src: urlData.publicUrl, storage_path: path,
    });

    setMessage({ type: 'success', text: 'Imagem publicada com sucesso!' });
    setFile(null); setPreview(null); setName(''); setImgCategory('');
    setUploading(false);
    loadGallery();
  };

  const handleDelete = async (item) => {
    if (!confirm(`Remover "${item.name}" da vitrine?`)) return;
    // Fotos locais (seeded) não existem no Supabase Storage — só remove o registro
    if (item.storage_path && !item.storage_path.startsWith('local/')) {
      await supabase.storage.from('gallery').remove([item.storage_path]);
    }
    await supabase.from('gallery').delete().eq('id', item.id);
    setGallery(prev => prev.filter(g => g.id !== item.id));
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20 transition-colors placeholder:text-gray-400";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-gray-900 dark:text-white mb-1">Galeria de Produtos</h2>
        <p className="text-gray-500 dark:text-white/40 text-sm">Faça upload de novas fotos para a vitrine do site.</p>
      </div>

      {/* Upload + Form */}
      <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Drop zone */}
          <div>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                dragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 dark:border-white/10 hover:border-orange-300 hover:bg-orange-50/50 bg-gray-50 dark:bg-white/5'
              }`}
            >
              <input ref={inputRef} type="file" accept=".webp,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFile(e.target.files[0])} />
              <Upload className="mx-auto mb-3 text-gray-400" size={40} />
              <p className="text-gray-700 dark:text-white/60 text-sm font-bold">Arraste e solte aqui</p>
              <p className="text-gray-400 dark:text-white/30 text-xs mt-1">ou <span className="text-orange-500 underline">clique para selecionar</span></p>
              <p className="text-gray-400 dark:text-white/20 text-xs mt-3 font-mono">WebP · PNG · JPG · Máx {MAX_SIZE_MB}MB</p>
            </div>

            {preview && (
              <div className="mt-4 relative rounded-2xl overflow-hidden border border-gray-200">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
                <button onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-red-500 transition-colors">
                  <X size={14} />
                </button>
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
              <label className="text-gray-500 dark:text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Nome do Produto *</label>
              <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Vela Votiva Branca" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Subcategoria</label>
              <input value={imgCategory} onChange={e => setImgCategory(e.target.value)} type="text" placeholder="Ex: Linha Votiva, Atacado B2B" className={inputClass} />
            </div>
            <div>
              <label className="text-gray-500 dark:text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Aba da Vitrine</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            {message && (
              <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            <button onClick={handleUpload} disabled={uploading || !file}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              <ImagePlus size={16} />
              {uploading ? 'Enviando...' : 'Publicar na Vitrine'}
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-500 dark:text-white/60 text-xs font-bold uppercase tracking-widest">
            Fotos Publicadas ({gallery.length})
          </h3>
          <button onClick={loadGallery} className="text-gray-400 hover:text-orange-500 transition-colors">
            <RefreshCw size={16} className={loadingGallery ? 'animate-spin' : ''} />
          </button>
        </div>

        {loadingGallery && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-36" />
            ))}
          </div>
        )}

        {!loadingGallery && gallery.length === 0 && (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <ImagePlus className="mx-auto mb-3 text-gray-300" size={32} />
            <p className="text-gray-400 text-sm font-medium">Nenhuma foto publicada ainda</p>
            <p className="text-gray-300 text-xs mt-1">Faça o upload da primeira imagem acima</p>
          </div>
        )}

        {!loadingGallery && gallery.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map(item => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                <img src={item.src} alt={item.name} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(item)} className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-gray-800 text-xs font-bold truncate">{item.name}</p>
                  <p className="text-gray-400 text-[10px] mt-0.5 capitalize">{CATEGORIES.find(c => c.id === item.category)?.label || item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
