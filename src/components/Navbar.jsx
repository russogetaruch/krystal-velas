import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Navega até a seção com scroll suave e URL limpa (sem hash)
const scrollToSection = (id, closeMobileMenu) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Atualiza a URL para /section-name sem recarregar a página
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
    { name: 'Produtos', id: 'produtos' },
    { name: 'Dúvidas', id: 'duvidas' },
    { name: 'Contato', id: 'contato' }
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-brown/95 backdrop-blur-md shadow-md border-b border-wine/20 py-4' : 'bg-gradient-to-b from-brown/80 via-brown/30 to-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button
          onClick={() => scrollToSection('hero', null)}
          className="flex items-center gap-3 group bg-white/95 px-5 py-2 rounded-full shadow-xl ring-2 ring-white/20"
          aria-label="Ir para o topo - Krystal Velas"
        >
          <img src="/logo.png" alt="Krystal Velas" className="h-8 md:h-10 w-auto transition-transform group-hover:scale-105" />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10" aria-label="Menu principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id, null)}
              className={`uppercase text-[13px] font-bold tracking-widest transition-all ${isScrolled ? 'text-white hover:text-gold' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-gold/90'} hover:-translate-y-0.5 bg-transparent border-none cursor-pointer`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={32} className="text-white drop-shadow-md" /> : <Menu size={32} className="text-white drop-shadow-md" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full bg-cream border-t border-wine/10 shadow-xl overflow-hidden md:hidden"
            aria-label="Menu mobile"
          >
            <div className="flex flex-col py-6 px-6 gap-6">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id, setMobileMenuOpen)}
                  className="text-xl font-bold text-wine uppercase tracking-widest border-b border-wine/5 pb-2 text-left bg-transparent border-none cursor-pointer"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
