import { motion, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../hooks/useSiteContent';
import { useState, useEffect } from 'react';

export default function FloatingWhatsApp() {
  const { getWhatsAppLink } = useSiteContent();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed bottom-6 right-6 z-[60] md:bottom-10 md:right-10"
        >
          {/* Pulse Effect */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-green-500 rounded-full"
          />
          
          <a
            href={getWhatsAppLink('contact')}
            target="_blank"
            rel="noreferrer"
            className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-[0_12px_24px_rgba(34,197,94,0.3)] transition-all hover:scale-110 active:scale-95 group"
            aria-label="Falar no WhatsApp"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-8 md:h-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 1C5.927 1 1 5.927 1 12c0 1.889.494 3.66 1.358 5.196L1.016 23l5.958-1.32A10.954 10.954 0 0012 23c6.073 0 11-4.927 11-11S18.073 1 12 1zm0 20a8.96 8.96 0 01-4.577-1.25l-.328-.194-3.539.784.802-3.441-.213-.353A8.968 8.968 0 013 12C3 7.029 7.029 3 12 3s9 4.029 9 9-4.029 9-9 9z"/>
            </svg>
            
            {/* Tooltip */}
            <span className="absolute right-full mr-4 bg-white text-brown text-[10px] font-bold uppercase tracking-widest py-2 px-4 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-wine/5">
              Fale Conosco
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
