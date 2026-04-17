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
import CartDrawer from './components/CartDrawer';
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

// Admin carregado somente quando necessário (lazy)
const AdminApp   = lazy(() => import('./admin/AdminApp'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));
const AdminSetup = lazy(() => import('./admin/AdminSetup'));

const isAdminRoute = window.location.pathname.startsWith('/admin');

// ── Admin ────────────────────────────────────────────────────────────────────
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
      <div className="min-h-screen bg-[#0f0602] flex items-center justify-center">
        <div className="text-white/30 text-sm animate-pulse">Verificando sessão...</div>
      </div>
    );
  }

  if (isSetup && !session) return <AdminSetup onBack={() => window.location.hash = ''} />;
  if (!session) return <AdminLogin onLogin={setSession} />;
  
  return <AdminApp session={session} onLogout={() => setSession(null)} />;
}

// ── Site Público ─────────────────────────────────────────────────────────────
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

  if (isStillInMaintenance) {
    return <MaintenancePage until={until} />;
  }

  return (
    <div className="font-sans antialiased text-gray-900 bg-white selection:bg-gold selection:text-brown">
      <Navbar />
      <CartDrawer />
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
      <CookieBanner />
      <FloatingWhatsApp />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0f0602] flex items-center justify-center">
          <div className="text-white/30 animate-pulse text-sm">Carregando...</div>
        </div>
      }>
        {isAdminRoute ? <AdminRoot /> : <PublicSite />}
      </Suspense>
    </ErrorBoundary>
  );
}
