import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowLeft, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

export default function StoreNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemsCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg py-3' : 'bg-white/90 backdrop-blur-md py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Back to Site */}
        <a href="/" className="flex items-center gap-2 text-brown group hover:text-orange-600 transition-colors">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Voltar ao Site</span>
        </a>

        {/* Logo Center */}
        <a href="/loja" className="absolute left-1/2 -translate-x-1/2">
          <img src="/logo.png" alt="Krystal Velas" className="h-10 w-auto" />
        </a>

        {/* Cart Action */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 rounded-full hover:bg-gray-100 transition-all"
        >
          <ShoppingBag size={24} className="text-brown" />
          {itemsCount > 0 && (
            <span className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-lg">
              {itemsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
