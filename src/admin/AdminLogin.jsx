import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, Lock, Mail } from 'lucide-react';

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError('Credenciais inválidas. Verifique e-mail e senha.');
    } else {
      onLogin(data.session);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a05] via-[#2d1407] to-[#1a0a05] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 mb-6">
            <Flame className="text-orange-400" size={32} />
            <div className="text-left">
              <p className="text-white font-bold text-lg tracking-wide">Krystal Velas</p>
              <p className="text-white/40 text-xs tracking-widest uppercase">Painel Admin</p>
            </div>
          </div>
          <h1 className="text-3xl font-serif text-white mb-2">Área Restrita</h1>
          <p className="text-white/40 text-sm">Acesso exclusivo para administradores</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm space-y-5">
          <div>
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-white/20"
                placeholder="admin@krystalvelas.com.br"
              />
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs font-bold uppercase tracking-widest block mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-colors"
          >
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Acesso protegido por Supabase Auth · LGPD Compliant
        </p>
      </div>
    </div>
  );
}
