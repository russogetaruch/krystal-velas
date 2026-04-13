import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import Tradition from './components/Tradition';
import Differentials from './components/Differentials';
import Products from './components/Products';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="font-sans antialiased text-gray-900 bg-white selection:bg-gold selection:text-brown border-t-8 border-gold">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Tradition />
        <Differentials />
        <Products />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
