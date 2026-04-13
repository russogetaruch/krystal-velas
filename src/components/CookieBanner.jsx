import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Só mostra se o usuário ainda não decidiu
    const consent = localStorage.getItem('kv_cookie_consent');
    if (!consent) {
      // Delay pequeno pra não competir com o carregamento inicial
      const timer = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('kv_cookie_consent', 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('kv_cookie_consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de Privacidade e Cookies"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[200] bg-brown/95 backdrop-blur-sm text-white rounded-2xl shadow-2xl border border-white/10 p-5 flex flex-col gap-4 animate-fade-in"
    >
      <div>
        <p className="font-bold text-sm tracking-wide text-white mb-1">🍪 Privacidade & Cookies</p>
        <p className="text-white/70 text-xs font-light leading-relaxed">
          Este site utiliza cookies estritamente necessários para seu funcionamento. Em conformidade com a{' '}
          <strong className="text-white/90 font-semibold">LGPD</strong>, nenhum dado pessoal é coletado ou compartilhado sem sua ciência.{' '}
          <a
            href="https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline hover:text-gold/80 transition-colors"
          >
            Saiba mais
          </a>
          .
        </p>
      </div>
      <div className="flex gap-3 justify-end">
        <button
          onClick={decline}
          className="text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors px-3 py-2"
        >
          Recusar
        </button>
        <button
          onClick={accept}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-widest px-5 py-2 rounded-full transition-colors shadow-lg"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
