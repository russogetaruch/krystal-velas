import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Navega até a seção com scroll suave e URL limpa (sem hash)
const scrollToSection = (id, closeMobileMenu) => {
  if (id === 'loja') {
    window.location.href = '/loja';
    return;
  }
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `/${id}`);
  }
  if (closeMobileMenu) closeMobileMenu(false);
};

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'A Fábrica', id: 'fabrica' },
    { name: 'Diferenciais', id: 'diferenciais' },
    { name: 'Dúvidas', id: 'duvidas' },
    { name: 'Contato', id: 'contato' }
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-brown/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-b border-white/5 py-3' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button
          onClick={() => scrollToSection('hero', null)}
          className={`flex items-center gap-3 group transition-all duration-300 ${
            isScrolled ? 'bg-white/95 px-5 py-2' : 'bg-white px-6 py-3 shadow-2xl'
          } rounded-full ring-1 ring-white/20`}
        >
          <img src="/logo.png" alt="Krystal Velas" className={`${isScrolled ? 'h-7 md:h-8' : 'h-8 md:h-10'} w-auto transition-all group-hover:scale-105`} />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id, null)}
              className={`uppercase text-[10px] font-bold tracking-[0.2em] transition-all duration-300 ${
                isScrolled 
                  ? 'text-white/60 hover:text-white' 
                  : 'text-white drop-shadow-lg hover:text-gold'
              } hover:-translate-y-0.5 bg-transparent border-none cursor-pointer`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Actions - Dedicated Store Button */}
        <div className="flex items-center gap-6">
          <a 
            href="/loja"
            className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full border border-orange-500/30 text-white font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 ${
              isScrolled ? 'bg-orange-500/10' : 'bg-white/10 backdrop-blur-sm'
            }`}
          >
            Acessar Loja Online
          </a>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen 
              ? <X size={28} className="text-white" /> 
              : <Menu size={28} className={`text-white transition-all ${!isScrolled && 'drop-shadow-lg'}`} />
            }
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, scale: 0.98, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            className="absolute top-[85%] left-4 right-4 bg-brown/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden md:hidden z-50"
          >
            <div className="flex flex-col py-8 px-8 gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id, setMobileMenuOpen)}
                  className="text-lg font-bold text-white/90 uppercase tracking-[0.2em] border-b border-white/5 pb-3 text-left bg-transparent border-none cursor-pointer hover:text-gold transition-colors"
                >
                  {item.name}
                </button>
              ))}
              <a 
                href="/loja"
                className="bg-orange-500 text-white text-center py-4 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl"
              >
                Loja Online
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
