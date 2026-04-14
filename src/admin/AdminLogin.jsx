import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, AlertTriangle, WifiOff, ShieldOff, Clock } from 'lucide-react';
import { logSecurityEvent } from '../lib/security';

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

// Mapeia o código/mensagem do Supabase para mensagens amigáveis
function parseAuthError(err) {
  const msg = err?.message?.toLowerCase() || '';
  const status = err?.status;

  if (status === 429) {
    return {
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      title: 'Muitas tentativas',
      detail: 'Você excedeu o limite de requisições. Aguarde um momento e tente novamente.',
    };
  }
  if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
    return {
      icon: ShieldOff,
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      title: 'E-mail não verificado',
      detail: 'A conta existe, mas o e-mail ainda não foi confirmado. Fale com o administrador do sistema.',
    };
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
    return {
      icon: Lock,
      color: 'text-red-600 bg-red-50 border-red-200',
      title: 'Credenciais inválidas',
      detail: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.',
    };
  }
  if (msg.includes('user not found') || msg.includes('no user')) {
    return {
      icon: ShieldOff,
      color: 'text-red-600 bg-red-50 border-red-200',
      title: 'Usuário não encontrado',
      detail: 'Nenhuma conta cadastrada com este e-mail.',
    };
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch') || msg.includes('load')) {
    return {
      icon: WifiOff,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      title: 'Erro de conexão',
      detail: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
    };
  }
  return {
    icon: AlertTriangle,
    color: 'text-red-600 bg-red-50 border-red-200',
    title: 'Erro de autenticação',
    detail: err?.message || 'Erro desconhecido. Tente novamente.',
  };
}

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer quando bloqueado
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        setAttempts(0);
        setError(null);
      } else {
        setCountdown(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (isLocked || loading) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (err) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        await logSecurityEvent('LOGIN_FAILURE', cleanEmail, { 
          attempts: newAttempts, 
          error: err.message 
        }, newAttempts >= 3 ? 'WARNING' : 'INFO');

        // Bloqueia após MAX_ATTEMPTS
        if (newAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_SECONDS * 1000;
          setLockedUntil(until);
          await logSecurityEvent('BRUTE_FORCE_ALERT', cleanEmail, { lockout: LOCKOUT_SECONDS }, 'CRITICAL');
          setError({
            icon: Clock,
            color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            title: `Conta bloqueada por ${LOCKOUT_SECONDS}s`,
            detail: `${MAX_ATTEMPTS} tentativas incorretas. Aguarde ${LOCKOUT_SECONDS} segundos.`,
          });
        } else {
          setError(parseAuthError(err));
        }
      } else if (data?.session) {
        await logSecurityEvent('LOGIN_SUCCESS', cleanEmail);
        onLogin(data.session);
      }
    } catch (networkErr) {
      setError(parseAuthError(networkErr));
    } finally {
      setLoading(false);
    }
  };

  const ErrorIcon = error?.icon || AlertTriangle;

  return (
    <div className="min-h-screen bg-stone flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
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

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl shadow-brown/5 space-y-5"
          noValidate
        >
          <div>
            <label htmlFor="admin-email" className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(null); }}
                disabled={isLocked || loading}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors placeholder:text-gray-300 disabled:opacity-50"
                placeholder="admin@krystalvelas.com.br"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null); }}
                disabled={isLocked || loading}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition-colors placeholder:text-gray-300 disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Contador de tentativas */}
          {attempts > 0 && !isLocked && (
            <p className="text-gray-400 text-xs text-right">
              {MAX_ATTEMPTS - attempts} tentativa{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} restante{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''}
            </p>
          )}

          {/* Erro detalhado */}
          {error && (
            <div className={`flex items-start gap-3 text-sm rounded-xl px-4 py-3 border ${error.color}`}>
              <ErrorIcon size={16} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">{error.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{error.detail}</p>
                {isLocked && countdown > 0 && (
                  <p className="text-xs mt-1 font-mono font-bold">{countdown}s restantes</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-colors"
          >
            {loading ? 'Autenticando...' : isLocked ? `Bloqueado (${countdown}s)` : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button 
            onClick={() => window.location.href = '#/setup'} 
            className="text-gray-400 hover:text-orange-500 text-[10px] uppercase font-bold tracking-widest transition-colors"
          >
            Primeiro acesso? Clique aqui
          </button>
          
          <p className="text-gray-400 text-[9px] uppercase tracking-[0.2em] opacity-50">
            Supabase Auth · RLS Protegido · LGPD Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
