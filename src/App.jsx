import { useState, useEffect, lazy, Suspense, Component } from 'react';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SocialProof from './components/SocialProof';
import Tradition from './components/Tradition';
import Differentials from './components/Differentials';
import Products from './components/Products';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import MaintenancePage from './components/MaintenancePage';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import { useContent } from './context/ContentContext';

// Error Boundary Simple
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ops! Algo deu errado ao carregar o site.</h1>
          <pre className="p-4 bg-gray-100 rounded-lg text-xs overflow-auto max-w-full">
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-brown text-white rounded-full">
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy Loads
const AdminApp   = lazy(() => import('./admin/AdminApp'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminSetup = lazy(() => import('./admin/AdminSetup'));
const StorePage  = lazy(() => import('./pages/StorePage'));

const pathname = window.location.pathname;
const isAdminRoute = pathname.startsWith('/admin');
const isStoreRoute = pathname === '/loja' || pathname.startsWith('/loja/');

// ── Admin Root ──────────────────────────────────────────────────────────────
function AdminRoot() {
  const [session, setSession] = useState(undefined);
  const [isSetup, setIsSetup] = useState(window.location.hash === '#/setup');

  useEffect(() => {
    const handleHash = () => setIsSetup(window.location.hash === '#/setup');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-[#0f0602] flex items-center justify-center text-white/30 text-sm animate-pulse">
        Verificando sessão...
      </div>
    );
  }

  if (isSetup && !session) return <AdminSetup onBack={() => window.location.hash = ''} />;
  if (!session) return <AdminLogin onLogin={setSession} />;
  return <AdminApp session={session} onLogout={() => setSession(null)} />;
}

// ── Landing Page (PublicSite) ────────────────────────────────────────────────
function PublicSite() {
  const { content, loading } = useContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0602] flex items-center justify-center">
        <img src="/logo.png" alt="Krystal Velas" className="h-14 w-auto brightness-0 invert opacity-30 animate-pulse" />
      </div>
    );
  }

  const isMaintenanceOn = content?.maintenance_mode === 'true';
  const until = content?.maintenance_until;
  const isStillInMaintenance = isMaintenanceOn && (!until || new Date(until).getTime() > Date.now());

  if (isStillInMaintenance) return <MaintenancePage until={until} />;

  return (
    <div className="font-sans antialiased text-gray-900 bg-white">
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <Tradition />
        <Differentials />
        
        {/* Banner CTA Loja */}
        <section className="py-24 bg-brown text-white text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="font-serif text-4xl md:text-6xl mb-8">Nossa Coleção Agora Online.</h2>
            <p className="text-white/60 mb-12 text-lg md:text-xl font-light">
              Explore cada aroma e detalhe de nossas velas artesanais em nossa nova loja online exclusiva.
            </p>
            <a href="/loja" className="bg-orange-500 hover:bg-white hover:text-brown text-white font-bold uppercase tracking-widest text-sm py-5 px-16 rounded-full transition-all inline-block shadow-2xl">
              Acessar Loja Online
            </a>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
        </section>

        <Testimonials />
        <FAQ />
      </main>
      <Footer />
      <CookieBanner />
      <FloatingWhatsApp />
    </div>
  );
}

// ── Store Site ──────────────────────────────────────────────────────────────
function StoreSite() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center py-20 animate-pulse text-gray-300">Carregando Loja...</div>}>
      <StorePage />
      <FloatingWhatsApp />
    </Suspense>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0f0602] flex items-center justify-center">
          <div className="text-white/30 animate-pulse text-sm font-bold tracking-widest uppercase">Krystal Velas...</div>
        </div>
      }>
        {isAdminRoute ? <AdminRoot /> : (isStoreRoute ? <StoreSite /> : <PublicSite />)}
      </Suspense>
    </ErrorBoundary>
  );
}
