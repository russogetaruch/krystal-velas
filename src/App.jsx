import { useState, useEffect, lazy, Suspense } from 'react';
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
import { useContent } from './context/ContentContext';

// Admin carregado somente quando necessário (lazy)
const AdminApp   = lazy(() => import('./admin/AdminApp'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));

const isAdminRoute = window.location.pathname.startsWith('/admin');

// ── Admin ────────────────────────────────────────────────────────────────────
function AdminRoot() {
  const [session, setSession] = useState(undefined);

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

  if (!session) return <AdminLogin onLogin={setSession} />;
  return <AdminApp session={session} onLogout={() => setSession(null)} />;
}

// ── Site Público ─────────────────────────────────────────────────────────────
function PublicSite() {
  const { content, loading, error } = useContent();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0602] flex items-center justify-center">
        <img src="/logo.png" alt="Krystal Velas" className="h-14 w-auto brightness-0 invert opacity-30 animate-pulse" />
      </div>
    );
  }

  // Se houver erro crítico no carregamento, mostra o site com os dados padrão (fallback)
  // Mas se for um erro de renderização, o Error Boundary deve atuar.
  
  const isMaintenanceOn = content.maintenance_mode === 'true';
  const until = content.maintenance_until;

  // Verifica se o tempo de manutenção já passou
  const isStillInMaintenance = isMaintenanceOn && (!until || new Date(until).getTime() > Date.now());

  if (isStillInMaintenance) {
    return <MaintenancePage until={until} />;
  }

  return (
    <div className="font-sans antialiased text-gray-900 bg-white selection:bg-gold selection:text-brown">
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
      <CookieBanner />
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0602] flex items-center justify-center">
        <div className="text-white/30 animate-pulse text-sm">Carregando...</div>
      </div>
    }>
      {isAdminRoute ? <AdminRoot /> : <PublicSite />}
    </Suspense>
  );
}
