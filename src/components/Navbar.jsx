import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

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
  const { itemsCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'A Fábrica', id: 'fabrica' },
    { name: 'Diferenciais', id: 'diferenciais' },
    { name: 'Loja Online', id: 'produtos' },
    { name: 'Dúvidas', id: 'duvidas' },
    { name: 'Contato', id: 'contato' }
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-brown/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border-b border-white/5 py-4' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button
          onClick={() => scrollToSection('hero', null)}
          className={`flex items-center gap-3 group transition-all duration-300 ${
            isScrolled ? 'bg-white/95 px-5 py-2' : 'bg-white px-6 py-3 shadow-2xl'
          } rounded-full ring-1 ring-white/20`}
          aria-label="Ir para o topo - Krystal Velas"
        >
          <img src="/logo.png" alt="Krystal Velas" className={`${isScrolled ? 'h-7 md:h-8' : 'h-8 md:h-10'} w-auto transition-all group-hover:scale-105`} />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10" aria-label="Menu principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id, null)}
              className={`uppercase text-[11px] font-bold tracking-[0.2em] transition-all duration-300 ${
                isScrolled 
                  ? 'text-white/80 hover:text-gold' 
                  : 'text-white drop-shadow-lg hover:text-gold/90'
              } hover:-translate-y-0.5 bg-transparent border-none cursor-pointer`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`relative p-2 rounded-full transition-all duration-300 ${isScrolled ? 'text-white hover:bg-white/10' : 'text-white hover:bg-white/20'}`}
          >
            <ShoppingBag size={24} className={!isScrolled ? 'drop-shadow-lg' : ''} />
            {itemsCount > 0 && (
              <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white/20">
                {itemsCount}
              </span>
            )}
          </button>

          {/* Mobile Toggle */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir Menu"
            aria-expanded={mobileMenuOpen}
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
            aria-label="Menu mobile"
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
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
