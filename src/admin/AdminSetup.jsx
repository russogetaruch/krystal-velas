import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { logSecurityEvent } from '../lib/security';
import { UserPlus, Mail, Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSetup({ onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Verifica se o e-mail está na whitelist
      const { data: authorized, error: authError } = await supabase
        .from('authorized_emails')
        .select('*')
        .eq('email', cleanEmail)
        .single();

      if (authError || !authorized) {
        await logSecurityEvent('UNAUTHORIZED_SETUP_ATTEMPT', cleanEmail, { exists_in_whitelist: false }, 'WARNING');
        throw new Error('Este e-mail não foi pré-autorizado pelo administrador.');
      }

      // 2. Realiza o cadastro no Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
      });

      if (signUpError) throw signUpError;

      // 3. Cria o perfil inicial (o trigger faria isso, mas garantimos aqui)
      // Nota: Devido ao RLS "Usuários criam próprio perfil", isso deve funcionar
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: cleanEmail,
        role: 'pending'
      });

      await logSecurityEvent('SETUP_SUCCESS', cleanEmail);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-stone flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-2xl font-serif text-brown mb-4">Conta Criada!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Seu cadastro foi realizado com sucesso. Agora, solicite ao administrador principal para **ativar seu acesso** no painel de controle.
          </p>
          <button onClick={onBack} className="w-full bg-brown text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-wine transition-colors">
            Voltar para o Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-brown transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Voltar</span>
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-serif text-brown mb-2">Configurar Acesso</h1>
          <p className="text-gray-500 text-sm">Disponível apenas para e-mails pré-autorizados</p>
        </div>

        <form onSubmit={handleSetup} className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-xl space-y-5">
          <div>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Seu E-mail Autorizado</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder="exemplo@email.com"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Defina sua Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-xs leading-relaxed">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-orange-500/20"
          >
            {loading ? 'Validando...' : 'Criar minha Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}
