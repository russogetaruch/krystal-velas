import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-stone flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo — direta, sem caixa */}
        <div className="text-center mb-10">
          <img
            src="/logo.png"
            alt="Krystal Velas"
            className="h-20 w-auto mx-auto mb-4 drop-shadow-sm"
          />
          <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase font-bold mb-6">
            Painel Administrativo
          </p>
          <h1 className="text-3xl font-serif text-brown mb-2">Área Restrita</h1>
          <p className="text-gray-500 text-sm">Acesso exclusivo para administradores</p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-brown/5 space-y-5"
        >
          <div>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors placeholder:text-gray-300"
                placeholder="admin@krystalvelas.com.br"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors placeholder:text-gray-300"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
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

        <p className="text-center text-gray-400 text-xs mt-6">
          Acesso protegido por Supabase Auth · LGPD Compliant
        </p>
      </div>
    </div>
  );
}

