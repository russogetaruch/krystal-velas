import { useEffect, useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';

export default function MaintenancePage({ until }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const [progress, setProgress] = useState(0);
  const { getWhatsAppLink } = useSiteContent();

  useEffect(() => {
    if (!until) return;

    const end = new Date(until).getTime();
    const updateTimer = () => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft(null);
        setProgress(100);
        return;
      }

      const hours   = Math.floor(diff / 1000 / 60 / 60);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ hours, minutes, seconds, diff });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [until]);

  // Barra de progresso animada independente
  useEffect(() => {
    let frame;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setProgress(p => {
        const next = p + 0.008;
        return next >= 98 ? 98 : next;
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#0f0602] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Glow bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img
            src="/logo.png"
            alt="Krystal Velas"
            className="h-20 w-auto brightness-0 invert drop-shadow-[0_0_20px_rgba(251,146,60,0.4)]"
          />
        </div>

        {/* Flame icon animated */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center animate-pulse">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                <path d="M12 2C12 2 8 7 8 11C8 13.2091 9.79086 15 12 15C14.2091 15 16 13.2091 16 11C16 7 12 2 12 2Z"
                  fill="#f97316" opacity="0.9"/>
                <path d="M12 15C10.3431 15 9 16.3431 9 18C9 19.6569 10.3431 21 12 21C13.6569 21 15 19.6569 15 18C15 16.3431 13.6569 15 12 15Z"
                  fill="#fbbf24" opacity="0.7"/>
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full bg-orange-500/5 animate-ping" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-white font-serif text-3xl md:text-4xl mb-3 leading-snug">
          Krystal Velas<br />
          <span className="text-orange-400">Agradece o Contato</span>
        </h1>

        <p className="text-white/50 text-base md:text-lg leading-relaxed mb-10">
          Neste momento estamos <span className="text-orange-300 font-medium">atualizando nosso site</span> e em
          breve estaremos no ar novamente com novidades para você.
        </p>

        {/* Countdown */}
        {timeLeft && (
          <div className="flex items-center justify-center gap-4 mb-10">
            {[
              { val: timeLeft.hours,   label: 'Horas' },
              { val: timeLeft.minutes, label: 'Min' },
              { val: timeLeft.seconds, label: 'Seg' },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-2xl font-bold font-mono">{pad(val)}</span>
                </div>
                <span className="text-white/30 text-[10px] uppercase tracking-widest mt-1">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading bar */}
        <div className="mb-8">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-600 via-orange-400 to-amber-300 rounded-full transition-all duration-[1500ms] ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/30 blur-sm rounded-full" />
            </div>
          </div>
          <p className="text-white/20 text-xs mt-2 tracking-widest">ATUALIZANDO...</p>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={getWhatsAppLink('contact')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 font-bold text-sm uppercase tracking-widest px-6 py-3.5 rounded-full transition-all hover:-translate-y-0.5"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 1C5.927 1 1 5.927 1 12c0 1.889.494 3.66 1.358 5.196L1.016 23l5.958-1.32A10.954 10.954 0 0012 23c6.073 0 11-4.927 11-11S18.073 1 12 1z"/>
          </svg>
          Falar pelo WhatsApp
        </a>

        {/* Footer note */}
        <p className="text-white/15 text-xs mt-10 tracking-widest uppercase">
          © {new Date().getFullYear()} Krystal Velas · Ibiporã, Paraná
        </p>
      </div>
    </div>
  );
}
