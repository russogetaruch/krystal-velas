import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, X, CheckCircle, AlertCircle, Image, Trash2 } from 'lucide-react';

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
  const [loadingGallery, setLoadingGallery] = useState(false);
  const inputRef = useRef();

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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
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
      cacheControl: '3600', upsert: false, contentType: file.type
    });

    if (uploadErr) {
      setMessage({ type: 'error', text: 'Erro no upload: ' + uploadErr.message });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path);

    await supabase.from('gallery').insert({
      name, category, img_category: imgCategory, src: urlData.publicUrl, storage_path: path
    });

    setMessage({ type: 'success', text: 'Imagem publicada com sucesso!' });
    setFile(null); setPreview(null); setName(''); setImgCategory('');
    setUploading(false);
    loadGallery();
  };

  const handleDelete = async (item) => {
    if (!confirm(`Remover "${item.name}"?`)) return;
    await supabase.storage.from('gallery').remove([item.storage_path]);
    await supabase.from('gallery').delete().eq('id', item.id);
    loadGallery();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-serif text-white mb-1">Galeria de Produtos</h2>
        <p className="text-white/40 text-sm">Faça upload de novas fotos para a vitrine do site.</p>
      </div>

      {/* Upload Zone */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
          >
            <input ref={inputRef} type="file" accept=".webp,.png,.jpg,.jpeg" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <Upload className="mx-auto mb-3 text-white/30" size={40} />
            <p className="text-white/60 text-sm font-medium">Arraste e solte aqui</p>
            <p className="text-white/30 text-xs mt-1">ou clique para selecionar</p>
            <p className="text-white/20 text-xs mt-3">WebP, PNG, JPG · Máx 3MB</p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="mt-4 relative rounded-2xl overflow-hidden border border-white/10">
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
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Nome do Produto</label>
            <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Ex: Vela Votiva Branca" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Subcategoria</label>
            <input value={imgCategory} onChange={e => setImgCategory(e.target.value)} type="text" placeholder="Ex: Linha Votiva, Atacado B2B" className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Aba da Vitrine</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-[#2d1407] border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none">
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          {message && (
            <div className={`flex items-center gap-2 text-sm rounded-xl px-4 py-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <button onClick={handleUpload} disabled={uploading || !file} className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Image size={16} />
            {uploading ? 'Enviando...' : 'Publicar na Vitrine'}
          </button>

          <button onClick={loadGallery} className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm py-3 rounded-xl transition-colors">
            {loadingGallery ? 'Carregando...' : 'Ver Fotos Publicadas'}
          </button>
        </div>
      </div>

      {/* Gallery List */}
      {gallery.length > 0 && (
        <div>
          <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">Fotos no Supabase ({gallery.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map(item => (
              <div key={item.id} className="relative group rounded-xl overflow-hidden border border-white/10">
                <img src={item.src} alt={item.name} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => handleDelete(item)} className="bg-red-500 p-2 rounded-full text-white hover:bg-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="p-2">
                  <p className="text-white text-xs font-bold truncate">{item.name}</p>
                  <p className="text-white/40 text-[10px]">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
