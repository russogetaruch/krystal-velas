import StoreNavbar from '../components/StoreNavbar';
import Products from '../components/Products';
import CartDrawer from '../components/CartDrawer';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function StorePage() {
  return (
    <div className="min-h-screen bg-white">
      <StoreNavbar />
      <CartDrawer />
      
      <main className="pt-24 pb-20">
        {/* Store Header */}
        <div className="bg-gray-50 py-16 mb-12 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center md:text-left"
            >
              <h1 className="font-serif text-4xl md:text-6xl text-brown mb-4">Nossa Loja Online</h1>
              <p className="text-gray-500 text-lg md:text-xl font-light max-w-2xl">
                Velas artesanais e artigos religiosos produzidos com devoção e qualidade premium. 
                Entregamos em todo o Brasil.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Catalog */}
        <div className="bg-white">
          <Products />
        </div>
      </main>

      <Footer />
    </div>
  );
}
