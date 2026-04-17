import StoreNavbar from '../components/StoreNavbar';
import Products from '../components/Products';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Star } from 'lucide-react';

export default function StorePage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <SEO 
        title="Loja Online | Velas e Artigos Religiosos" 
        description="Explore nossa vitrine online. Velas votivas, decorativas e acessórios com entrega em todo o Brasil."
      />
      <StoreNavbar />
      <CartDrawer />
      
      <main className="pt-20">
        {/* Store Hero / Header Premium */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-brown">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8"
                >
                  <Star size={14} className="text-orange-400 fill-orange-400" />
                  <span className="text-[10px] text-white font-bold uppercase tracking-[0.3em]">Qualidade Premium Garantida</span>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-serif text-5xl md:text-7xl text-white mb-8 leading-tight"
                >
                  Sinta a Essência <br /> da <span className="text-orange-500">Pureza.</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-white/60 text-lg md:text-xl font-light mb-12 leading-relaxed"
                >
                  Explore nossa coleção exclusiva de velas artesanais e artigos religiosos. 
                  Cada peça é esculpida para elevar sua espiritualidade e decorar seu lar com luz.
                </motion.p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-brown bg-stone flex items-center justify-center overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-brown bg-orange-500 flex items-center justify-center text-[10px] text-white font-bold">
                      +2k
                    </div>
                  </div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest pl-2">Clientas Satisfeitas</p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden lg:block relative"
              >
                <div className="w-80 h-96 bg-stone/10 rounded-[3rem] border border-white/10 backdrop-blur-sm flex items-center justify-center group overflow-hidden">
                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-orange-500/20 to-transparent" />
                   <ShoppingBag size={120} className="text-white/10 group-hover:scale-110 transition-transform duration-700" />
                   <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-6 py-3 rounded-2xl shadow-2xl">
                     <p className="text-brown font-bold text-xs uppercase tracking-widest whitespace-nowrap">Explore o Catálogo</p>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Dynamic Catalog Section */}
        <section id="catalog" className="py-20">
          <Products />
        </section>
      </main>

      <Footer />

      <style jsx>{`
        main {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
